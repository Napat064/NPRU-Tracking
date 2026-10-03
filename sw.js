const CACHE_NAME = 'npru-ev-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/mqtt/dist/mqtt.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Kanit:wght@300;400;500&display=swap'
];

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// ล้าง Cache เก่าเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// กลไก Network-First สำหรับ HTML/CSS และ Cache-First สำหรับ Libs
self.addEventListener('fetch', event => {
  // ข้ามการ Cache สำหรับ WebSocket หรือ OSRM API
  if (event.request.url.includes('hivemq') || event.request.url.includes('project-osrm')) {
    return;
  }

  // ใช้ Network First สำหรับหน้า HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ใช้ Cache First สำหรับ static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});