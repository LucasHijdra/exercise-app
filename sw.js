// =====================================================
// sw.js — Service Worker (offline support)
// Cache-first strategy: app works fully offline after first visit
// =====================================================

const CACHE = 'fysio-app-v3';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/i18n.js',
  './js/screens/home.js',
  './js/screens/exercises.js',
  './js/screens/workouts.js',
  './js/screens/advice.js',
  './js/screens/settings.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Install: cache all app files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', (e) => {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
