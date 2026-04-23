import { load } from "@tauri-apps/plugin-store";
import type { AppData } from "../types";
import { DEFAULT_SKILLS } from "../types";

const STORE_FILE = "lexiq_data.json";
const STORE_KEY = "app_data";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;

async function getStore() {
  if (!storeInstance) {
    storeInstance = await load(STORE_FILE);
  }
  return storeInstance;
}

export async function loadAppData(): Promise<AppData> {
  try {
    const store = await getStore();
    const data = await store.get<AppData>(STORE_KEY);
    if (data) {
      return data;
    }
  } catch (e) {
    console.warn("Failed to load data from store, using defaults:", e);
  }
  return { skills: DEFAULT_SKILLS, courses: [], scores: [] };
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    const store = await getStore();
    await store.set(STORE_KEY, data);
    await store.save();
  } catch (e) {
    console.error("Failed to save data:", e);
    throw e;
  }
}
