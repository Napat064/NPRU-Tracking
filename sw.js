const CACHE_NAME = 'npru-ev-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/mqtt/dist/mqtt.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Kanit:wght@300;400;500&display=swap'
];

// ติดตั้ง Service Worker และ Caching ไฟล์เบื้องต้น
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ดึงข้อมูลจาก Cache (ข้ามการ Cache สำหรับ WebSocket หรือ OSRM API)
self.addEventListener('fetch', event => {
  // ไม่ดักจับ Request ที่เป็น MQTT/WSS หรือ OSRM Snap to road เพื่อให้ข้อมูล real-time เสมอ
  if (event.request.url.includes('hivemq') || event.request.url.includes('project-osrm')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});