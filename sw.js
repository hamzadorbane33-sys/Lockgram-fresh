// LockGram Service Worker
// PWA functionality and offline support

const CACHE_NAME = 'lockgram-v1.0.0';
const STATIC_CACHE = 'lockgram-static-v1.0.0';
const DYNAMIC_CACHE = 'lockgram-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap'
];

// Installation event
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Service Worker: Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('✅ Service Worker: Static resources cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker: Failed to cache resources', error);
            })
    );
});

// Activation event
self.addEventListener('activate', event => {
    console.log('🔧 Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Claim all clients
            self.clients.claim()
        ])
            .then(() => {
                console.log('✅ Service Worker: Activated');
            })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

// Handle fetch requests
async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache first for static resources
        if (isStaticResource(request)) {
            return await cacheFirst(request);
        }
        
        // Strategy 2: Network first for dynamic content
        if (isDynamicResource(request)) {
            return await networkFirst(request);
        }
        
        // Strategy 3: Stale while revalidate for API calls
        if (isAPIRequest(request)) {
            return await staleWhileRevalidate(request);
        }
        
        // Default: Network first
        return await networkFirst(request);
        
    } catch (error) {
        console.error('❌ Service Worker: Fetch failed', error);
        
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match('/');
            if (offlinePage) {
                return offlinePage;
            }
        }
        
        // Return a basic offline response
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Cache first strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        throw error;
    }
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
    }).catch(() => {
        // Network failed, return cached if available
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Check if request is for static resources
function isStaticResource(request) {
    const url = new URL(request.url);
    return (
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.woff') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname === '/' ||
        url.pathname === '/index.html' ||
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com')
    );
}

// Check if request is for dynamic content
function isDynamicResource(request) {
    const url = new URL(request.url);
    return (
        url.pathname === '/' ||
        url.pathname === '/index.html' ||
        (url.hostname === location.hostname && !isStaticResource(request))
    );
}

// Check if request is for API
function isAPIRequest(request) {
    const url = new URL(request.url);
    return (
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/v1/') ||
        url.hostname.includes('api.') ||
        url.searchParams.has('api') ||
        request.headers.get('accept')?.includes('application/json')
    );
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Service Worker: Background sync triggered');
        event.waitUntil(performBackgroundSync());
    }
});

async function performBackgroundSync() {
    try {
        // Get stored offline actions from IndexedDB
        const offlineActions = await getStoredOfflineActions();
        
        for (const action of offlineActions) {
            try {
                const response = await fetch(action.url, {
                    method: action.method,
                    headers: action.headers,
                    body: action.body
                });
                
                if (response.ok) {
                    // Remove successfully synced action
                    await removeOfflineAction(action.id);
                    console.log('✅ Service Worker: Synced offline action', action.id);
                }
            } catch (error) {
                console.error('❌ Service Worker: Failed to sync action', action.id, error);
            }
        }
    } catch (error) {
        console.error('❌ Service Worker: Background sync failed', error);
    }
}

// Store offline actions
async function storeOfflineAction(action) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LockGramOfflineDB', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['actions'], 'readwrite');
            const store = transaction.objectStore('actions');
            
            const addRequest = store.add({
                ...action,
                id: Date.now().toString(),
                timestamp: Date.now()
            });
            
            addRequest.onsuccess = () => resolve(addRequest.result);
            addRequest.onerror = () => reject(addRequest.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('actions')) {
                const store = db.createObjectStore('actions', { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

// Get stored offline actions
async function getStoredOfflineActions() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LockGramOfflineDB', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['actions'], 'readonly');
            const store = transaction.objectStore('actions');
            const index = store.index('timestamp');
            const getAllRequest = index.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
    });
}

// Remove offline action
async function removeOfflineAction(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LockGramOfflineDB', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['actions'], 'readwrite');
            const store = transaction.objectStore('actions');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

// Push notifications
self.addEventListener('push', event => {
    console.log('📱 Service Worker: Push received');
    
    const options = {
        body: 'New update available!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/explore-icon.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/close-icon.png'
            }
        ]
    };
    
    if (event.data) {
        const payload = event.data.json();
        options.body = payload.body || options.body;
        options.data = { ...options.data, ...payload.data };
    }
    
    event.waitUntil(
        self.registration.showNotification('LockGram', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('👆 Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('💬 Service Worker: Message received', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            case 'CLEAR_CACHE':
                clearCache().then(() => {
                    event.ports[0].postMessage({ success: true });
                });
                break;
            default:
                console.log('❓ Service Worker: Unknown message type', event.data.type);
        }
    }
});

// Clear all caches
async function clearCache() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// Update available notification
function showUpdateNotification() {
    self.registration.showNotification('Update Available', {
        body: 'A new version of LockGram is available. Click to update.',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'update-available',
        requireInteraction: true,
        actions: [
            {
                action: 'update',
                title: 'Update Now'
            },
            {
                action: 'dismiss',
                title: 'Later'
            }
        ]
    });
}

// Analytics tracking from service worker
function trackServiceWorkerEvent(eventName, eventData = {}) {
    // Send analytics data to main thread
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'ANALYTICS_EVENT',
                event: eventName,
                data: eventData
            });
        });
    });
}

// Log service worker events
console.log('🔧 Service Worker: Script loaded');

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CACHE_NAME,
        STATIC_CACHE,
        DYNAMIC_CACHE,
        handleFetch,
        cacheFirst,
        networkFirst,
        staleWhileRevalidate
    };
}