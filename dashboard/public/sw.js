const CACHE_NAME = 'dashboard-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/dashboard.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls for fresh data
  if (event.request.url.includes('/api/')) return;
  
  // Skip JavaScript modules and assets to prevent MIME type issues
  if (event.request.url.includes('.js') || 
      event.request.url.includes('.css') ||
      event.request.url.includes('assets/')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});