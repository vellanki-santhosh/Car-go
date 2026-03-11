const CACHE_NAME = 'cargo-pro-v2';
const APP_ASSETS = [
  './',
  './index.html',
  './cargo.html',
  './manifest.json',
  './CarGo_Pro.jsx',
  './sprites/car_sprite_01.png',
  './sprites/car_sprite_02.png',
  './sprites/car_sprite_03.png',
  './sprites/car_sprite_04.png',
  './sprites/car_sprite_05.png',
  './sprites/car_sprite_06.png',
  './sprites/car_sprite_07.png',
  './sprites/car_sprite_08.png',
  './sprites/car_sprite_09.png',
  './sprites/car_sprite_10.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_ASSETS.map((asset) => cache.add(asset)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (_) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  if (!isSameOrigin && !url.hostname.includes('unpkg.com') && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      if (fresh && (fresh.status === 200 || fresh.type === 'opaque')) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (_) {
      if (isSameOrigin) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
      throw _;
    }
  })());
});

