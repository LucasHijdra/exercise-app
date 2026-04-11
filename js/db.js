// =====================================================
// db.js — IndexedDB wrapper (promise-based)
// Stores: exercises, workouts, advice, settings
// =====================================================

const DB_NAME = 'FysioAppDB';
const DB_VERSION = 2; // bumped: added advice store
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
      if (!db.objectStoreNames.contains('advice')) {
        db.createObjectStore('advice', { keyPath: 'id', autoIncrement: true });
      }
    };

    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror  = () => reject(req.error);
  });
}

async function getAll(store) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function getOne(store, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function addItem(store, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readwrite').objectStore(store).add(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function putItem(store, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readwrite').objectStore(store).put(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function deleteItem(store, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readwrite').objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

async function clearStore(store) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readwrite').objectStore(store).clear();
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

async function exportDB() {
  const [exercises, workouts, settings, advice] = await Promise.all([
    getAll('exercises'), getAll('workouts'), getAll('settings'), getAll('advice'),
  ]);
  return { version: 2, exportedAt: new Date().toISOString(), exercises, workouts, settings, advice };
}

async function importDB(data) {
  await clearStore('exercises');
  await clearStore('workouts');
  await clearStore('settings');
  await clearStore('advice');
  for (const item of (data.exercises || [])) await putItem('exercises', item);
  for (const item of (data.workouts  || [])) await putItem('workouts',  item);
  for (const item of (data.settings  || [])) await putItem('settings',  item);
  for (const item of (data.advice    || [])) await putItem('advice',    item);
}

export { getAll, getOne, addItem, putItem, deleteItem, clearStore, exportDB, importDB };
