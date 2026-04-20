/* ========================================
   小道的小窝 - Service Worker
   PWA离线缓存 + 推送支持
   ======================================== */

const CACHE_NAME = 'chenzong-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求 - Stale-while-revalidate 策略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // 同时发起网络请求
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // 如果网络请求成功，更新缓存
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // 网络失败时返回 null，后续会返回 cachedResponse
          return null;
        });
        
        // 立即返回缓存（无论是否过期），同时在后台更新缓存
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// 推送通知（预留）
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '小道的小窝有新内容啦！',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'view', title: '查看' },
      { action: 'close', title: '关闭' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('小道的小窝', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});