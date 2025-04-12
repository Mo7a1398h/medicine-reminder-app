const CACHE_NAME = 'medicine-reminder-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/notification.mp3',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // تفعيل التحكم بكل الصفحات المفتوحة
            clients.claim()
        ])
    );
});

// التعامل مع طلبات الشبكة
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then((response) => {
                        // تخزين النسخة الجديدة في الكاش
                        if (response.status === 200 && response.type === 'basic') {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // إذا فشل الاتصال، نعرض صفحة الخطأ المخزنة مسبقاً
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// التعامل مع التنبيهات
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        dir: 'rtl',
        lang: 'ar'
    };

    event.waitUntil(
        self.registration.showNotification('تذكير الدواء', options)
    );
});

// التعامل مع النقر على التنبيه
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                if (clientList.length > 0) {
                    let client = clientList[0];
                    for (let i = 0; i < clientList.length; i++) {
                        if (clientList[i].focused) {
                            client = clientList[i];
                        }
                    }
                    return client.focus();
                }
                return clients.openWindow('/');
            })
    );
});

// جدولة التنبيهات
function scheduleNotification(medicine, time) {
    const timeUntilNotification = new Date(time) - new Date();
    if (timeUntilNotification > 0) {
        setTimeout(() => {
            self.registration.showNotification('تذكير بموعد الدواء', {
                body: `حان موعد أخذ ${medicine.name}\nالجرعة: ${medicine.dosage}`,
                icon: '/icons/icon.svg',
                badge: '/icons/icon.svg',
                dir: 'rtl',
                lang: 'ar',
                vibrate: [200, 100, 200],
                data: {
                    medicineId: medicine.id,
                    timestamp: new Date().getTime()
                }
            });
        }, timeUntilNotification);
    }
}

// التعامل مع النقر على التنبيه
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) {
                clientList[0].focus();
            } else {
                clients.openWindow('/');
            }
        })
    );
});
