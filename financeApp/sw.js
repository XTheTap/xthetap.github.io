var CACHE_NAME = 'finance-offline-cache';
var urlsToCache = [
  '/financeApp',
  '/financeApp/sw.js',
  '../js/default.js',
  '../js/financeApp.js',
  '../css/default.css'
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