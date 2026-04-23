import { db, seedDefaultSkills, resetAllData, getAllData, saveAllData } from './indexedDB';

export { db, seedDefaultSkills, resetAllData, getAllData, saveAllData };

export async function openDB() {
  await db.open();
}

export async function initDB() {
  await db.open();
  await seedDefaultSkills();
}