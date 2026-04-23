use axum::{
    extract::State,
    http::{Method, StatusCode},
    routing::{get, put},
    Json, Router,
};
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::Arc;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub target_band: f64,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Course {
    pub id: String,
    pub title: String,
    pub skill_id: String,
    pub total_lessons: i32,
    pub completed_lessons: i32,
    pub source: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScoreRecord {
    pub id: String,
    pub skill_id: String,
    pub band: f64,
    pub date: String,
    pub test_name: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StudyPlan {
    pub id: String,
    pub title: String,
    pub skill_id: String,
    pub course_id: Option<String>,
    pub date: String,
    pub completed: bool,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Goal {
    pub id: String,
    pub skill_id: String,
    pub target_band: f64,
    pub target_date: String,
    pub achieved: bool,
    pub achieved_date: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct AppData {
    #[serde(rename = "skills")]
    pub skills: Vec<Skill>,
    #[serde(rename = "courses")]
    pub courses: Vec<Course>,
    #[serde(rename = "scores")]
    pub scores: Vec<ScoreRecord>,
    #[serde(rename = "studyPlans")]
    pub study_plans: Vec<StudyPlan>,
    #[serde(rename = "goals")]
    pub goals: Vec<Goal>,
}

#[derive(Clone)]
struct AppState {
    app_handle: AppHandle,
    data: Arc<Mutex<AppData>>,
}

async fn get_data(State(state): State<AppState>) -> Result<Json<AppData>, StatusCode> {
    let data = state.data.lock().await;
    Ok(Json(data.clone()))
}

async fn put_data(
    State(state): State<AppState>,
    Json(new_data): Json<AppData>,
) -> Result<Json<AppData>, StatusCode> {
    let mut data = state.data.lock().await;
    *data = new_data.clone();

    if let Some(store) = state.app_handle.get_store("lexiq_data.json") {
        let _ = store.set("app_data", serde_json::to_value(&new_data).unwrap());
        if let Err(e) = store.save() {
            error!("Failed to save store: {}", e);
        }
    }

    info!("Data synced successfully");
    Ok(Json(data.clone()))
}

async fn get_status() -> &'static str {
    "LexiQ Sync Server Running"
}

async fn shutdown_server() {
    info!("Shutdown signal received");
}

fn create_routes(state: AppState) -> Router {
    Router::new()
        .route("/api/status", get(get_status))
        .route("/api/data", get(get_data))
        .route("/api/data", put(put_data))
        .route("/api/shutdown", axum::routing::post(shutdown_server))
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_methods([Method::GET, Method::PUT, Method::POST])
                .allow_headers(tower_http::cors::Any),
        )
        .with_state(state)
}

pub fn get_local_ip() -> Option<String> {
    use std::net::IpAddr;
    let localhost = IpAddr::from([127, 0, 0, 1]);
    for iface in pnet_datalink::interfaces().iter() {
        for addr in &iface.ips {
            if !addr.ip().is_loopback() && addr.ip().is_ipv4() {
                let ip = addr.ip();
                if ip != localhost {
                    return Some(ip.to_string());
                }
            }
        }
    }
    None
}

pub fn start_sync_server(app_handle: AppHandle, data: AppData) {
    let data = Arc::new(Mutex::new(data));
    let state = AppState {
        app_handle: app_handle.clone(),
        data: data.clone(),
    };

    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            let addr = SocketAddr::from(([0, 0, 0, 0], 7878));
            let listener = match tokio::net::TcpListener::bind(addr).await {
                Ok(l) => l,
                Err(e) => {
                    error!("Failed to bind to port 7878: {}", e);
                    return;
                }
            };
            let router = create_routes(state);
            info!("LexiQ Sync Server started on port 7878");

            if let Some(local_ip) = get_local_ip() {
                info!("Access from iPhone: http://{}:7878", local_ip);
            }

            if let Err(e) = axum::serve(listener, router).await {
                error!("Server error: {}", e);
            }
        });
    });
}

#[tauri::command]
fn get_sync_address() -> String {
    if let Some(ip) = get_local_ip() {
        format!("http://{}:7878", ip)
    } else {
        "http://localhost:7878".to_string()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_sync_address])
        .setup(|app| {
            let app_handle = app.handle().clone();

            let data = if let Some(store) = app.get_store("lexiq_data.json") {
                if let Some(value) = store.get("app_data") {
                    match serde_json::from_value::<AppData>(value.clone()) {
                        Ok(d) => d,
                        Err(_) => AppData::default(),
                    }
                } else {
                    AppData::default()
                }
            } else {
                AppData::default()
            };

            start_sync_server(app_handle, data);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}