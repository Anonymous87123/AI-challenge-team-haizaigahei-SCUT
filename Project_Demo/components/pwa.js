/**
 * ========================================
 * 校园AI助手 - PWA模块
 * 版本: 1.0.0
 * 处理Service Worker注册、安装提示和离线功能
 * ========================================
 */

const PWAModule = {
    // 状态
    state: {
        serviceWorker: null,
        isOnline: navigator.onLine,
        deferredPrompt: null,
        isInstallable: false,
        hasPromptedInstall: false,
        offlineQueue: []
    },

    /**
     * 初始化PWA模块
     */
    init() {
        console.log('[PWA] 初始化PWA模块');
        
        // 检查PWA支持
        if (!this.isPwaSupported()) {
            console.warn('[PWA] 当前环境不支持PWA功能');
            this.showPwaUnsupportedMessage();
            return;
        }
        
        // 注册Service Worker
        this.registerServiceWorker();
        
        // 监听安装提示
        this.listenForInstallPrompt();
        
        // 监听网络状态
        this.listenForOnlineStatus();
        
        // 检查安装状态
        this.checkInstallStatus();
        
        // 处理用户交互后的延迟提示
        this.setupDelayedInstallPrompt();
    },
    
    /**
     * 显示PWA不支持消息
     */
    showPwaUnsupportedMessage() {
        if (window.location.protocol === 'file:') {
            console.info('[PWA] 本地文件系统不支持Service Worker，建议使用HTTP服务器运行');
        }
    },

    /**
     * 检查PWA支持
     * @returns {boolean}
     */
    isPwaSupported() {
        // 本地文件系统不支持Service Worker
        if (window.location.protocol === 'file:') {
            console.warn('[PWA] 本地文件系统不支持Service Worker，请使用HTTP服务器');
            return false;
        }
        
        // 检查必要的API支持
        return 'serviceWorker' in navigator &&
               'caches' in window &&
               'Storage' in window;
    },

    /**
     * 注册Service Worker
     */
    async registerServiceWorker() {
        if (!navigator.serviceWorker) {
            console.warn('[PWA] Service Worker不支持');
            return;
        }

        try {
            // 使用相对路径，确保在不同环境下都能正确加载
            const swPath = './service-worker.js';
            const swScope = './';
            
            console.log(`[PWA] 尝试注册Service Worker: ${swPath}`);
            
            const registration = await navigator.serviceWorker.register(swPath, {
                scope: swScope,
                updateViaCache: 'none' // 强制从网络获取更新
            });

            console.log('[PWA] Service Worker注册成功:', registration.scope);
            this.state.serviceWorker = registration;

            // 监听Service Worker更新
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[PWA] 发现新的Service Worker');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[PWA] 新的Service Worker已就绪');
                        this.showUpdatePrompt();
                    }
                });
            });

            // 监听Service Worker控制权变化
            if (navigator.serviceWorker.controller) {
                console.log('[PWA] 当前页面已被Service Worker控制');
            }

            // 监听控制权变化
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[PWA] Service Worker控制器已切换');
                // 自动刷新页面以应用最新版本
                window.location.reload();
            });

            return registration;
        } catch (error) {
            console.error('[PWA] Service Worker注册失败:', error);
            this.showRegistrationError(error);
            // 不抛出错误，让应用继续运行（只是没有PWA功能）
            return null;
        }
    },

    /**
     * 监听安装提示事件
     */
    listenForInstallPrompt() {
        // 监听beforeinstallprompt事件
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('[PWA] 检测到可安装的PWA');
            
            // 阻止默认的安装提示
            event.preventDefault();
            
            // 保存事件以便后续触发
            this.state.deferredPrompt = event;
            this.state.isInstallable = true;
            
            // 检查是否已经提示过
            const hasPrompted = Utils.Storage.get('pwaInstallPrompted', false);
            if (!hasPrompted) {
                console.log('[PWA] 可以显示安装提示');
            }
        });

        // 监听应用安装事件
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] 应用已安装');
            this.state.isInstallable = false;
            this.state.deferredPrompt = null;
            this.state.hasPromptedInstall = true;
            
            // 清除提示标记
            Utils.Storage.set('pwaInstallPrompted', true);
            
            // 显示安装成功提示
            Utils.showSuccess('应用已成功安装到主屏幕！');
            
            // 隐藏安装按钮
            this.hideInstallButton();
        });
    },

    /**
     * 设置延迟安装提示
     */
    setupDelayedInstallPrompt() {
        // 监听用户交互
        let userInteractions = 0;
        const INTERACTION_THRESHOLD = 3; // 需要3次交互后才显示
        
        const trackInteraction = () => {
            userInteractions++;
            
            // 达到交互阈值且可安装且未提示过
            if (userInteractions >= INTERACTION_THRESHOLD && 
                this.state.isInstallable && 
                !this.state.hasPromptedInstall) {
                
                // 检查是否已经提示过（使用localStorage）
                const hasPrompted = Utils.Storage.get('pwaInstallPrompted', false);
                if (!hasPrompted) {
                    // 延迟显示安装提示
                    setTimeout(() => {
                        this.showInstallPrompt();
                    }, 2000);
                }
            }
        };

        // 监听常见用户交互事件
        ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, trackInteraction, { once: false, passive: true });
        });
    },

    /**
     * 检查安装状态
     */
    checkInstallStatus() {
        // 检查是否已安装（通过检查运行模式）
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                            window.matchMedia('(display-mode: minimal-ui)').matches ||
                            document.referrer.includes('android-app://');

        if (isStandalone) {
            console.log('[PWA] 应用以独立模式运行');
            Utils.Storage.set('pwaInstallPrompted', true);
            this.hideInstallButton();
        }
    },

    /**
     * 显示安装提示
     */
    async showInstallPrompt() {
        if (!this.state.deferredPrompt) {
            console.warn('[PWA] 没有可用的安装提示事件');
            return;
        }

        try {
            // 触发安装提示
            const result = await this.state.deferredPrompt.prompt();
            console.log('[PWA] 用户安装选择:', result);

            // 重置延迟提示事件
            this.state.deferredPrompt = null;
            
            // 记录已提示
            Utils.Storage.set('pwaInstallPrompted', true);
            this.state.hasPromptedInstall = true;

            // 显示安装按钮（如果用户选择稍后安装）
            if (result.outcome === 'dismissed') {
                this.showInstallButton();
                Utils.showInfo('您可以稍后通过菜单中的"安装应用"选项来安装');
            }

        } catch (error) {
            console.error('[PWA] 显示安装提示失败:', error);
        }
    },

    /**
     * 显示安装按钮
     */
    showInstallButton() {
        const installButton = document.getElementById('pwaInstallBtn');
        if (installButton) {
            installButton.classList.remove('hidden');
            installButton.addEventListener('click', () => this.showInstallPrompt());
        }
    },

    /**
     * 隐藏安装按钮
     */
    hideInstallButton() {
        const installButton = document.getElementById('pwaInstallBtn');
        if (installButton) {
            installButton.classList.add('hidden');
        }
    },

    /**
     * 监听在线/离线状态
     */
    listenForOnlineStatus() {
        window.addEventListener('online', () => {
            console.log('[PWA] 网络已连接');
            this.state.isOnline = true;
            this.handleOnlineEvent();
        });

        window.addEventListener('offline', () => {
            console.log('[PWA] 网络已断开');
            this.state.isOnline = false;
            this.handleOfflineEvent();
        });

        // 初始状态
        this.updateOnlineStatusUI();
    },

    /**
     * 处理在线事件
     */
    async handleOnlineEvent() {
        // 显示在线提示
        Utils.showSuccess('网络已连接');
        
        // 更新UI
        this.updateOnlineStatusUI();
        
        // 同步离线队列
        await this.syncOfflineQueue();
        
        // 手动触发Service Worker同步
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SYNC',
                payload: { type: 'manual' }
            }, []);
        }
    },

    /**
     * 处理离线事件
     */
    handleOfflineEvent() {
        // 显示离线提示
        Utils.showWarning('您当前处于离线状态，部分功能可能受限');
        
        // 更新UI
        this.updateOnlineStatusUI();
        
        // 检查缓存数据
        this.checkCachedData();
    },

    /**
     * 更新在线状态UI
     */
    updateOnlineStatusUI() {
        const statusIndicator = document.getElementById('onlineStatus');
        const statusText = document.getElementById('onlineStatusText');
        
        if (statusIndicator && statusText) {
            if (this.state.isOnline) {
                statusIndicator.className = 'online-status online';
                statusText.textContent = '在线';
                statusText.className = 'online-status-text text-green-500';
            } else {
                statusIndicator.className = 'online-status offline';
                statusText.textContent = '离线';
                statusText.className = 'online-status-text text-red-500';
            }
        }

        // 更新body类名以便CSS响应
        if (this.state.isOnline) {
            document.body.classList.remove('offline-mode');
        } else {
            document.body.classList.add('offline-mode');
        }
    },

    /**
     * 检查缓存数据
     */
    async checkCachedData() {
        try {
            // 检查课程数据缓存
            const coursesCache = await caches.match('/data/courses.json');
            if (coursesCache) {
                console.log('[PWA] 使用缓存的课程数据');
            }

            // 检查FAQ数据缓存
            const faqCache = await caches.match('/data/faq.json');
            if (faqCache) {
                console.log('[PWA] 使用缓存的FAQ数据');
            }

            // 检查用户数据缓存
            const usersCache = await caches.match('/data/users.json');
            if (usersCache) {
                console.log('[PWA] 使用缓存的用户数据');
            }
        } catch (error) {
            console.error('[PWA] 检查缓存数据失败:', error);
        }
    },

    /**
     * 添加离线操作到队列
     * @param {object} operation - 操作对象
     */
    addToOfflineQueue(operation) {
        const queueItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...operation
        };

        this.state.offlineQueue.push(queueItem);
        
        // 持久化到localStorage
        Utils.Storage.set('offlineQueue', this.state.offlineQueue);
        
        console.log('[PWA] 添加离线操作到队列:', queueItem);
    },

    /**
     * 同步离线队列
     * @returns {Promise<void>}
     */
    async syncOfflineQueue() {
        if (this.state.offlineQueue.length === 0) {
            console.log('[PWA] 没有待同步的离线操作');
            return;
        }

        console.log('[PWA] 开始同步离线队列...');
        
        const queueToSync = [...this.state.offlineQueue];
        const syncedItems = [];
        const failedItems = [];

        for (const item of queueToSync) {
            try {
                // 根据操作类型执行同步
                switch (item.type) {
                    case 'add_chat':
                        await this.syncChat(item);
                        syncedItems.push(item.id);
                        break;
                    
                    case 'add_course':
                        await this.syncCourse(item);
                        syncedItems.push(item.id);
                        break;
                    
                    case 'delete_course':
                        await this.deleteCourse(item);
                        syncedItems.push(item.id);
                        break;
                    
                    default:
                        console.warn('[PWA] 未知操作类型:', item.type);
                }
            } catch (error) {
                console.error('[PWA] 同步操作失败:', item, error);
                failedItems.push(item);
            }
        }

        // 更新队列
        this.state.offlineQueue = failedItems;
        Utils.Storage.set('offlineQueue', this.state.offlineQueue);

        console.log(`[PWA] 同步完成 - 成功: ${syncedItems.length}, 失败: ${failedItems.length}`);
        
        if (syncedItems.length > 0) {
            Utils.showSuccess(`已同步 ${syncedItems.length} 条离线操作`);
        }
    },

    /**
     * 同步聊天记录
     * @param {object} item - 聊天项
     * @returns {Promise<void>}
     */
    async syncChat(item) {
        // 这里可以实现实际的API调用
        console.log('[PWA] 同步聊天记录:', item);
        // 模拟网络请求
        await new Promise(resolve => setTimeout(resolve, 500));
    },

    /**
     * 同步课程
     * @param {object} item - 课程项
     * @returns {Promise<void>}
     */
    async syncCourse(item) {
        // 这里可以实现实际的API调用
        console.log('[PWA] 同步课程:', item);
        // 模拟网络请求
        await new Promise(resolve => setTimeout(resolve, 500));
    },

    /**
     * 删除课程
     * @param {object} item - 课程项
     * @returns {Promise<void>}
     */
    async deleteCourse(item) {
        // 这里可以实现实际的API调用
        console.log('[PWA] 删除课程:', item);
        // 模拟网络请求
        await new Promise(resolve => setTimeout(resolve, 500));
    },

    /**
     * 显示更新提示
     */
    showUpdatePrompt() {
        const message = '应用有新版本可用，是否立即更新？';
        if (confirm(message)) {
            this.skipWaiting();
        }
    },

    /**
     * 跳过等待，激活新的Service Worker
     */
    skipWaiting() {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SKIP_WAITING'
            }, []);
        }
    },

    /**
     * 获取Service Worker版本
     * @returns {Promise<string|null>}
     */
    async getVersion() {
        if (navigator.serviceWorker.controller) {
            return new Promise((resolve) => {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.type === 'VERSION') {
                        resolve(event.data.payload.version);
                    }
                };
                
                navigator.serviceWorker.controller.postMessage({
                    type: 'GET_VERSION'
                }, [messageChannel.port2]);
            });
        }
        return null;
    },

    /**
     * 清除所有缓存
     * @returns {Promise<void>}
     */
    async clearAllCaches() {
        if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
            throw new Error('Service Worker未激活');
        }

        return new Promise((resolve, reject) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                if (event.data.type === 'CACHE_CLEARED') {
                    resolve(event.data.payload);
                }
            };
            
            messageChannel.port1.onmessageerror = (error) => {
                reject(error);
            };

            navigator.serviceWorker.controller.postMessage({
                type: 'CLEAR_CACHE',
                payload: {}
            }, [messageChannel.port2]);
        });
    },

    /**
     * 显示注册错误
     * @param {Error} error - 错误对象
     */
    showRegistrationError(error) {
        console.error('[PWA] 显示注册错误:', error);
        
        let errorMessage = 'Service Worker注册失败';
        
        // 根据错误类型提供更友好的提示
        if (error.message && error.message.includes('Failed to fetch')) {
            errorMessage = 'Service Worker文件未找到，请检查service-worker.js是否存在';
        } else if (error.message && error.message.includes('not allowed')) {
            errorMessage = '当前环境不支持Service Worker（需要HTTPS或localhost）';
        } else if (window.location.protocol === 'file:') {
            errorMessage = '本地文件系统不支持Service Worker，请使用HTTP服务器运行项目';
        } else if (error.message) {
            errorMessage = `Service Worker注册失败: ${error.message}`;
        }
        
        // 使用Utils显示错误（如果可用），否则使用console
        if (typeof Utils !== 'undefined' && Utils.showError) {
            Utils.showError(errorMessage);
        } else {
            console.error(errorMessage);
        }
    }
};

// 导出到全局作用域
window.PWAModule = PWAModule;