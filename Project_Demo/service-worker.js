/**
 * ========================================
 * 校园AI助手 - Service Worker
 * 版本: 1.0.1 - 修复运行时缓存配置错误
 * 实现离线缓存、资源预加载和后台同步
 * ========================================
 */

// Service Worker 版本号 - 修改此版本号会触发缓存更新
const SW_VERSION = '1.0.1';
const CACHE_PREFIX = 'campus-ai';
const CACHE_VERSION = `${CACHE_PREFIX}-v${SW_VERSION}`;

// 预缓存资源列表 - 这些资源会在安装时立即缓存
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/campus-ai-assistant.html',
    '/css/style.css',
    '/components/utils.js',
    '/components/login.js',
    '/components/chat.js',
    '/components/sidebar.js',
    '/js/app.js',
    '/data/courses.json',
    '/data/faq.json',
    '/data/users.json',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// 运行时缓存配置 - 这些资源会在首次访问时缓存
const RUNTIME_CACHE_CONFIG = {
    // 外部CDN资源 - 缓存优先，网络回退
    cdn: {
        pattern: /^https:\/\/cdn\.tailwindcss\.com/,
        strategy: 'CacheFirst',
        cacheName: `${CACHE_VERSION}-cdn`,
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 7 // 7天
    },
    // Font Awesome图标库
    fontawesome: {
        pattern: /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/,
        strategy: 'CacheFirst',
        cacheName: `${CACHE_VERSION}-fontawesome`,
        maxEntries: 5,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
    },
    // Marked.js Markdown解析库
    marked: {
        pattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/marked/,
        strategy: 'CacheFirst',
        cacheName: `${CACHE_VERSION}-marked`,
        maxEntries: 2,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
    },
    // 图片资源
    images: {
        pattern: /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
        strategy: 'CacheFirst',
        cacheName: `${CACHE_VERSION}-images`,
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
    },
    // API请求 - 网络优先，缓存回退
    api: {
        pattern: /^https?:\/\/.*\/api\//,
        strategy: 'NetworkFirst',
        cacheName: `${CACHE_VERSION}-api`,
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 // 1天
    },
    // JSON数据文件 - 缓存优先
    data: {
        pattern: /\.json$/,
        strategy: 'StaleWhileRevalidate',
        cacheName: `${CACHE_VERSION}-data`,
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 // 1天
    }
};

// 安装事件 - 预缓存核心资源
self.addEventListener('install', (event) => {
    console.log(`[Service Worker] 安装中 - 版本 ${SW_VERSION}`);
    
    event.waitUntil(
        (async () => {
            try {
                // 打开缓存并添加资源
                const cache = await caches.open(CACHE_VERSION);
                await cache.addAll(PRECACHE_ASSETS);
                console.log(`[Service Worker] 预缓存完成 - ${PRECACHE_ASSETS.length} 个资源`);
                
                // 立即激活新的Service Worker
                await self.skipWaiting();
            } catch (error) {
                console.error('[Service Worker] 预缓存失败:', error);
                throw error;
            }
        })()
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    console.log(`[Service Worker] 激活中 - 版本 ${SW_VERSION}`);
    
    event.waitUntil(
        (async () => {
            // 获取所有缓存名称
            const cacheNames = await caches.keys();
            
            // 删除旧版本的缓存
            const cachesToDelete = cacheNames.filter((cacheName) => {
                return cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_VERSION;
            });
            
            if (cachesToDelete.length > 0) {
                console.log(`[Service Worker] 清理 ${cachesToDelete.length} 个旧缓存:`, cachesToDelete);
                await Promise.all(
                    cachesToDelete.map((cacheName) => {
                        console.log(`[Service Worker] 删除缓存: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
            }
            
            // 立即控制所有客户端
            await self.clients.claim();
            console.log('[Service Worker] 激活完成');
        })()
    );
});

// 获取请求 - 实现缓存策略
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 跳过非HTTP请求（如chrome-extension、data等）
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // 跳过Service Worker本身的请求
    if (url.pathname === '/service-worker.js') {
        return;
    }
    
    // 根据请求类型确定缓存策略和缓存名称
    const cacheConfig = determineCacheStrategy(url, request);
    
    if (cacheConfig.strategy === 'NetworkFirst' || cacheConfig.strategy === 'NetworkOnly') {
        event.respondWith(networkFirstStrategy(request, cacheConfig.cacheName));
    } else if (cacheConfig.strategy === 'CacheFirst' || cacheConfig.strategy === 'CacheOnly') {
        event.respondWith(cacheFirstStrategy(request, cacheConfig.cacheName));
    } else if (cacheConfig.strategy === 'StaleWhileRevalidate') {
        event.respondWith(staleWhileRevalidateStrategy(request, cacheConfig.cacheName));
    } else {
        event.respondWith(networkFirstStrategy(request, CACHE_VERSION));
    }
});

/**
 * 根据URL确定缓存策略和缓存名称
 * @param {URL} url - 请求URL
 * @param {Request} request - 请求对象
 * @returns {object} 包含策略名称和缓存名称的对象
 */
function determineCacheStrategy(url, request) {
    // 检查运行时缓存配置
    for (const [name, config] of Object.entries(RUNTIME_CACHE_CONFIG)) {
        if (config.pattern.test(url.href)) {
            return {
                strategy: config.strategy,
                cacheName: config.cacheName
            };
        }
    }
    
    // 同页面导航请求使用网络优先
    if (request.mode === 'navigate') {
        return {
            strategy: 'NetworkFirst',
            cacheName: CACHE_VERSION
        };
    }
    
    // 其他静态资源使用缓存优先
    return {
        strategy: 'CacheFirst',
        cacheName: CACHE_VERSION
    };
}

/**
 * 网络优先策略
 * @param {Request} request - 请求对象
 * @param {string} cacheName - 缓存名称
 * @returns {Promise<Response>}
 */
async function networkFirstStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        // 尝试从网络获取
        const networkResponse = await fetch(request);
        
        // 如果网络请求成功，更新缓存
        if (networkResponse.ok || networkResponse.type === 'opaque') {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] 网络请求失败，尝试从缓存获取:', request.url);
        
        // 网络失败，尝试从缓存获取
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('[Service Worker] 从缓存返回:', request.url);
            return cachedResponse;
        }
        
        // 缓存也没有，返回离线页面
        return getOfflineResponse(request);
    }
}

/**
 * 缓存优先策略
 * @param {Request} request - 请求对象
 * @param {string} cacheName - 缓存名称
 * @returns {Promise<Response>}
 */
async function cacheFirstStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    // 尝试从缓存获取
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        console.log('[Service Worker] 从缓存返回:', request.url);
        
        // 后台更新缓存
        fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse);
            }
        }).catch(() => {
            // 忽略网络错误
        });
        
        return cachedResponse;
    }
    
    try {
        // 缓存中没有，从网络获取
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok || networkResponse.type === 'opaque') {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] 网络请求失败:', request.url);
        
        // 返回离线响应
        return getOfflineResponse(request);
    }
}

/**
 * 过期同时重新验证策略
 * @param {Request} request - 请求对象
 * @param {string} cacheName - 缓存名称
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    // 并行执行：从缓存获取和从网络获取
    const cachedResponsePromise = cache.match(request);
    const networkResponsePromise = fetch(request);
    
    // 首先返回缓存响应（如果有）
    const cachedResponse = await cachedResponsePromise;
    
    // 然后更新缓存
    try {
        const networkResponse = await networkResponsePromise;
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] 网络请求失败，使用缓存:', request.url);
        return cachedResponse || getOfflineResponse(request);
    }
}

/**
 * 获取离线响应
 * @param {Request} request - 请求对象
 * @returns {Promise<Response>}
 */
async function getOfflineResponse(request) {
    // 如果是页面导航请求，返回离线页面
    if (request.mode === 'navigate' || request.destination === 'document') {
        // 检查是否有缓存的离线页面
        const cache = await caches.open(CACHE_VERSION);
        const offlinePage = await cache.match('/offline.html');
        
        if (offlinePage) {
            console.log('[Service Worker] 返回离线页面');
            return offlinePage;
        }
        
        // 返回内联的离线HTML
        return new Response(
            `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>离线 - 校园AI助手</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        color: white;
                    }
                    .container {
                        text-align: center;
                        padding: 2rem;
                        max-width: 500px;
                    }
                    .icon {
                        font-size: 5rem;
                        margin-bottom: 1.5rem;
                    }
                    h1 {
                        font-size: 2rem;
                        margin-bottom: 1rem;
                    }
                    p {
                        font-size: 1.1rem;
                        margin-bottom: 2rem;
                        opacity: 0.9;
                    }
                    button {
                        background: white;
                        color: #667eea;
                        border: none;
                        padding: 12px 32px;
                        font-size: 1rem;
                        font-weight: bold;
                        border-radius: 25px;
                        cursor: pointer;
                        transition: transform 0.2s;
                    }
                    button:hover {
                        transform: scale(1.05);
                    }
                    .status {
                        margin-top: 2rem;
                        padding: 1rem;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                        font-size: 0.9rem;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">📶</div>
                    <h1>您当前处于离线状态</h1>
                    <p>请检查您的网络连接，稍后再试</p>
                    <button onclick="location.reload()">重新连接</button>
                    <div class="status">
                        部分功能仍可离线使用
                    </div>
                </div>
            </body>
            </html>
            `,
            {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                }
            }
        );
    }
    
    // 其他资源返回空响应
    return new Response('离线状态下无法加载此资源', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    });
}

// 消息事件 - 处理来自主线程的消息
self.addEventListener('message', (event) => {
    const { type, payload } = event.data || {};
    
    switch (type) {
        case 'SKIP_WAITING':
            // 跳过等待，立即激活新的Service Worker
            self.skipWaiting().then(() => {
                event.ports[0].postMessage({ type: 'SKIPPED_WAITING' });
            });
            break;
            
        case 'GET_VERSION':
            // 返回当前Service Worker版本
            event.ports[0].postMessage({
                type: 'VERSION',
                payload: { version: SW_VERSION }
            });
            break;
            
        case 'CLEAR_CACHE':
            // 清除指定缓存
            clearCache(payload.cacheName).then(() => {
                event.ports[0].postMessage({
                    type: 'CACHE_CLEARED',
                    payload: { cacheName: payload.cacheName }
                });
            });
            break;
            
        case 'SYNC':
            // 后台同步
            syncData(payload).then(() => {
                event.ports[0].postMessage({ type: 'SYNC_COMPLETE' });
            });
            break;
            
        default:
            console.log('[Service Worker] 未知消息类型:', type);
    }
});

/**
 * 清除指定缓存
 * @param {string} cacheName - 缓存名称
 * @returns {Promise<void>}
 */
async function clearCache(cacheName) {
    if (cacheName) {
        await caches.delete(cacheName);
        console.log(`[Service Worker] 已清除缓存: ${cacheName}`);
    } else {
        // 清除所有以CACHE_PREFIX开头的缓存
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter((name) => name.startsWith(CACHE_PREFIX))
                .map((name) => {
                    console.log(`[Service Worker] 删除缓存: ${name}`);
                    return caches.delete(name);
                })
        );
    }
}

/**
 * 后台同步数据
 * @param {object} payload - 同步数据
 * @returns {Promise<void>}
 */
async function syncData(payload) {
    console.log('[Service Worker] 后台同步:', payload);
    
    try {
        // 这里可以实现实际的数据同步逻辑
        // 例如：同步未发送的聊天记录、离线操作等
        
        // 模拟同步延迟
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        console.log('[Service Worker] 同步完成');
    } catch (error) {
        console.error('[Service Worker] 同步失败:', error);
        throw error;
    }
}

// 后台同步事件
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] 后台同步触发:', event.tag);
    
    if (event.tag === 'sync-chats') {
        event.waitUntil(
            syncData({ type: 'chats' }).catch((error) => {
                console.error('[Service Worker] 同步失败:', error);
            })
        );
    }
});

// 推送通知事件
self.addEventListener('push', (event) => {
    console.log('[Service Worker] 收到推送通知');
    
    const options = {
        body: '您有新的消息',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        }
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            options.body = data.body || options.body;
            options.data.url = data.url || '/';
        } catch (error) {
            console.error('[Service Worker] 解析推送数据失败:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification('校园AI助手', options)
    );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] 点击通知');
    
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // 如果有打开的窗口，聚焦到该窗口
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // 否则打开新窗口
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url || '/');
            }
        })
    );
});

// 定期清理过期缓存
const CLEAN_UP_INTERVAL = 24 * 60 * 60 * 1000; // 24小时
let cleanUpTimer;

self.addEventListener('activate', () => {
    cleanUpTimer = setInterval(async () => {
        console.log('[Service Worker] 定期清理过期缓存');
        
        try {
            const cacheNames = await caches.keys();
            
            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const requests = await cache.keys();
                
                for (const request of requests) {
                    const response = await cache.match(request);
                    if (response) {
                        const dateHeader = response.headers.get('date');
                        if (dateHeader) {
                            const cacheDate = new Date(dateHeader);
                            const now = new Date();
                            const age = now - cacheDate;
                            
                            // 检查缓存配置
                            const config = Object.values(RUNTIME_CACHE_CONFIG).find(
                                (cfg) => cfg.pattern.test(request.url)
                            );
                            
                            if (config && config.maxAgeSeconds && age > config.maxAgeSeconds * 1000) {
                                console.log(`[Service Worker] 删除过期缓存: ${request.url}`);
                                cache.delete(request);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[Service Worker] 清理缓存失败:', error);
        }
    }, CLEAN_UP_INTERVAL);
});

// Service Worker终止时清理定时器
self.addEventListener('beforeinstallprompt', () => {
    if (cleanUpTimer) {
        clearInterval(cleanUpTimer);
    }
});

console.log(`[Service Worker] 已加载 - 版本 ${SW_VERSION}`);