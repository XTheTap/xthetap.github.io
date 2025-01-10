var CACHE_NAME = 'offline-cache';
var urlsToCache = [
  '/',
  '/css/default.css',
  '/js/default.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function(cache) {
          return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
      fetch(event.request)
          .catch(function() {
              return caches.match(event.request);
          })
  );
});