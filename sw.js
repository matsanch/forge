const CACHE = 'forge-v1';
const ASSETS = [
  '/', '/index.html', '/iron.html', '/anvil.html', '/vault.html',
  '/guild.html', '/library.html', '/quick-input.html', '/login.html',
  '/forge-shared.css', '/forge-shared.js', '/supabase-config.js',
  '/data-layer.js', '/input-parser.js', '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Skip Supabase API calls — let them go to network
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
