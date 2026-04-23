import { useAppStore } from "../store/useAppStore";
import { saveAllData } from "../lib/indexedDB";

const API = {
  status: "/api/status",
  data: "/api/data",
  shutdown: "/api/shutdown",
};

export async function fetchFromMac(): Promise<any> {
  const address = useAppStore.getState().serverAddress;
  if (!address) return null;

  try {
    const res = await fetch(`${address}${API.data}`);
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
}

export async function pushToMac(data: any): Promise<boolean> {
  const address = useAppStore.getState().serverAddress;
  if (!address) return false;

  try {
    const res = await fetch(`${address}${API.data}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (e) {
    console.error("Push error:", e);
    return false;
  }
}

export async function syncFromMac(): Promise<boolean> {
  const data = await fetchFromMac();
  if (!data) return false;

  await saveAllData(data);
  useAppStore.getState().setLastSyncDate(new Date().toISOString());
  await useAppStore.getState().loadData();
  return true;
}

export async function syncToMac(): Promise<boolean> {
  const store = useAppStore.getState();
  const data = {
    skills: store.skills,
    courses: store.courses,
    scores: store.scores,
    studyPlans: store.studyPlans,
    goals: store.goals,
  };
  const success = await pushToMac(data);
  if (success) {
    store.setLastSyncDate(new Date().toISOString());
  }
  return success;
}