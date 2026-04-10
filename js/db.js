// =====================================================
// db.js — IndexedDB wrapper (promise-based)
// Stores: exercises, workouts, settings
// =====================================================

const DB_NAME = 'FysioAppDB';
const DB_VERSION = 1;
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('exercises')) {
        db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('workouts')) {
        db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

async function getAll(store) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getOne(store, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addItem(store, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).add(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putItem(store, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteItem(store, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function clearStore(store) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Export all data as a JSON-serialisable object
async function exportDB() {
  const [exercises, workouts, settings] = await Promise.all([
    getAll('exercises'),
    getAll('workouts'),
    getAll('settings'),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises,
    workouts,
    settings,
  };
}

// Completely overwrite the database with imported data
async function importDB(data) {
  await clearStore('exercises');
  await clearStore('workouts');
  await clearStore('settings');

  for (const item of (data.exercises || [])) await putItem('exercises', item);
  for (const item of (data.workouts  || [])) await putItem('workouts',  item);
  for (const item of (data.settings  || [])) await putItem('settings',  item);
}

export { getAll, getOne, addItem, putItem, deleteItem, clearStore, exportDB, importDB };
