/**
 * QR3D Studio - Service Worker (Offline PWA Cache)
 */
const CACHE_NAME = 'qr3d-v1.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './privacidad.html',
  './css/styles.css',
  './js/i18n.js',
  './js/contrast-checker.js',
  './js/qr-core.js',
  './js/geometry-builder.js',
  './js/threemf-export.js',
  './js/stl-export.js',
  './js/viewer3d.js',
  './js/app.js',
  './manifest.json',
  './img/icon-192.svg',
  './img/icon-512.svg',
  './img/og-preview.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Pass-through for analytics and external CDNs if online, fallback to cache
  if (event.request.url.includes('google') || event.request.url.includes('adsbygoogle')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
