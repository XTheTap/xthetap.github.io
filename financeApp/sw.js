var CACHE_NAME = 'finance-offline-cache';
var urlsToCache = [
  './sw.js',
  './index.html',
  './manifest.json',
  'css/default.css',
  'css/financeApp.css',
  'js/bills.js',
  'js/common.js',
  'js/default.js',
  'js/operations.js',
  'js/selector.js',
  'js/style.js',
  'json/currencies.json',
  'json/tags.json',
  '../ico.webp'
];

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log('Service worker зарегистрирован', reg))
    .catch(err => console.error('Ошибка регистрации service worker:', err));
}

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