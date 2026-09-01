/**
 * QR3D Studio - Service Worker (Network-First with Offline Cache Fallback)
 * Ensures desktop and mobile browsers always get the newest HTML/CSS immediately.
 */
const CACHE_NAME = 'qr3d-v2.0.0';
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
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

// Network-First for HTML/CSS/JS, Cache Fallback if offline
self.addEventListener('fetch', event => {
  if (event.request.url.includes('google') || event.request.url.includes('adsbygoogle') || event.request.url.includes('amazon')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
