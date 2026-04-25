const CACHE_NAME = 'meditation-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/AudioEngine.js',
  '/js/VisualTheme.js',
  '/js/ParticleSystem.js',
  '/js/BreathingGuide.js',
  '/js/Timer.js',
  '/js/GestureController.js',
  '/js/Stats.js',
  '/js/UI.js',
  '/js/app.js'
];

const AUDIO_ASSETS = [
  '/audio/guqin.mp3',
  '/audio/yushan.mp3',
  '/audio/shuinian.mp3',
  '/audio/yinchang.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (AUDIO_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((fetchResponse) => {
          if (fetchResponse.status === 200) {
            const clone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return fetchResponse;
        }).catch(() => {
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((fetchResponse) => {
        if (fetchResponse.status === 200 && request.method === 'GET') {
          const clone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return fetchResponse;
      });
    })
  );
});
