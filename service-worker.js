const CACHE_NAME = 'chuangxun-offline-v2';
const ASSET_LIST_URL = new URL('./offline-assets.json', self.location.href);

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const response = await fetch(ASSET_LIST_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('无法读取离线资源清单');
        const assets = await response.json();
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(assets.map(path => new URL(path, self.registration.scope).href));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) return;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
            const response = await fetch(event.request);
            if (response && response.ok) await cache.put(event.request, response.clone());
            return response;
        } catch (error) {
            const cached = await cache.match(event.request, { ignoreSearch: true });
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
                return cache.match(new URL('./index.html', self.registration.scope).href);
            }
            throw error;
        }
    })());
});
