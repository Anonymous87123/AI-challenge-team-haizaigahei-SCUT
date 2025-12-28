/**
 * ========================================
 * 校园AI助手 - 主应用入口文件
 * 版本: 2.0 - 模块化重构版
 * 初始化所有模块，管理应用生命周期
 * ========================================
 */

const App = {
    // 应用配置
    config: {
        version: '2.0.0',
        name: '校园AI助手',
        debug: false,
        storagePrefix: 'campus_assistant_'
    },

    // 应用状态
    state: {
        isInitialized: false,
        isLoggedIn: false,
        currentUser: null,
        modules: {}
    },

    /**
     * 应用初始化
     */
    async init() {
        // 防止重复初始化
        if (this.state.isInitialized) {
            return;
        }

        try {
            this.log('🚀 开始应用初始化 - 彻底修复版');
            
            // 立即显示页面，不等待任何条件
            this.immediateShowPage();
            
            // 然后初始化模块
            setTimeout(() => {
                this.initializeModules();
            }, 100);

        } catch (error) {
            this.error('应用初始化失败', error);
            this.showLoadError(error);
        }
    },

    /**
     * 初始化模块 - 彻底修复版
     */
    async initializeModules() {
        console.log('📦 初始化模块...');
        
        try {
            // 检查是否在本地文件系统
            if (window.location.protocol === 'file:') {
                this.log('检测到本地文件系统，进入本地模式');
                await this.handleLocalFileSystem();
                return;
            }
            
            // 检查所有模块是否已加载
            await this.waitForModules();

            // 加载配置
            this.loadConfiguration();

            // 初始化数据
            this.initializeData();

            // 注册模块
            this.registerModules();

            // 初始化PWA模块
            this.initializePWA();

            // 检查登录状态
            this.checkLoginStatus();

            // 绑定全局事件
            this.bindGlobalEvents();

            this.state.isInitialized = true;
            this.log('✅ 应用初始化完成');

            // 隐藏加载动画
            this.hideLoadingAnimation();
            
            // 显示欢迎动画
            this.showWelcomeAnimation();

        } catch (error) {
            this.error('❌ 模块初始化失败', error);
        }
    },

    /**
     * 立即显示页面 - 彻底修复版
     */
    immediateShowPage() {
        console.log('📱 立即显示页面...');
        
        // 1. 立即隐藏加载动画
        const appLoading = document.getElementById('appLoading');
        if (appLoading) {
            appLoading.style.display = 'none';
            appLoading.classList.add('hidden');
            console.log('✅ 加载动画已隐藏');
        }
        
        // 2. 强制显示登录页面
        this.forceShowLoginPage();
        
        // 3. 应用关键样式（确保显示）
        this.applyCriticalStyles();
    },

    /**
     * 强制显示登录页面 - 彻底修复版
     */
    forceShowLoginPage() {
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');
        
        if (!loginPage) {
            console.error('❌ 登录页面元素未找到');
            this.createEmergencyLogin();
            return;
        }
        
        console.log('🔧 强制显示登录页面...');
        
        // 移除所有隐藏状态
        loginPage.classList.remove('hidden');
        loginPage.style.display = 'flex';
        loginPage.style.visibility = 'visible';
        loginPage.style.opacity = '1';
        loginPage.style.minHeight = '100vh';
        loginPage.style.width = '100vw';
        loginPage.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
        // 确保主应用隐藏
        if (mainApp) {
            mainApp.classList.add('hidden');
            mainApp.style.display = 'none';
        }
        
        console.log('✅ 登录页面强制显示完成');
    },

    /**
     * 应用关键样式 - 彻底修复版
     */
    applyCriticalStyles() {
        console.log('🎨 应用关键样式...');
        
        const style = document.createElement('style');
        style.id = 'critical-styles';
        style.textContent = `
            /* 关键样式修复 */
            #loginPage {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                min-height: 100vh !important;
                width: 100vw !important;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                padding: 20px !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 1000 !important;
            }
            
            .login-container {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 40px !important;
                max-width: 1000px !important;
                width: 100% !important;
            }
            
            .login-brand {
                color: white !important;
                text-align: center !important;
                padding: 40px !important;
            }
            
            .login-form-container {
                background: rgba(255, 255, 255, 0.95) !important;
                backdrop-filter: blur(20px) !important;
                border-radius: 20px !important;
                padding: 40px !important;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                .login-container {
                    grid-template-columns: 1fr !important;
                    gap: 20px !important;
                }
            }
            
            /* 覆盖所有可能的隐藏 */
            #loginPage.hidden {
                display: flex !important;
            }
            
            #mainApp {
                display: none !important;
            }
            
            #appLoading {
                display: none !important;
            }
        `;
        
        // 移除旧的关键样式
        const oldStyle = document.getElementById('critical-styles');
        if (oldStyle) oldStyle.remove();
        
        document.head.appendChild(style);
        console.log('✅ 关键样式已应用');
    },

    /**
     * 创建紧急登录页面 - 彻底修复版
     */
    createEmergencyLogin() {
        console.log('🆘 创建紧急登录页面...');
        
        const emergencyHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea, #764ba2);
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    max-width: 400px;
                    width: 100%;
                ">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 3rem; color: #667eea; margin-bottom: 20px;">🎓</div>
                        <h1 style="font-size: 1.5rem; font-weight: bold; color: #333; margin-bottom: 10px;">校园AI助手</h1>
                        <p style="color: #666;">系统初始化中...</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">学号</label>
                        <input type="text" placeholder="请输入学号" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 2px solid #e2e8f0;
                            border-radius: 10px;
                            font-size: 16px;
                        ">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">密码</label>
                        <input type="password" placeholder="请输入密码" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 2px solid #e2e8f0;
                            border-radius: 10px;
                            font-size: 16px;
                        ">
                    </div>
                    
                    <button style="
                        width: 100%;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 14px;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                    ">登录</button>
                    
                    <p style="text-align: center; margin-top: 20px; color: #666; font-size: 0.9rem;">
                        如果页面显示不正常，请刷新页面
                    </p>
                </div>
            </div>
        `;
        
        document.body.innerHTML = emergencyHTML;
        console.log('✅ 紧急登录页面已创建');
    },

    /**
     * 确保页面可见性
     */
    ensurePageVisibility() {
        console.log('确保页面可见...');
        
        // 立即隐藏加载动画
        const appLoading = document.getElementById('appLoading');
        if (appLoading) {
            appLoading.style.display = 'none';
            appLoading.classList.add('hidden');
            console.log('✓ 加载动画已隐藏');
        }
        
        // 根据登录状态显示相应页面
        const isLoggedIn = this.checkLoginStatus();
        console.log('当前登录状态:', isLoggedIn);
        
        if (isLoggedIn) {
            this.showMainApp();
        } else {
            this.showLoginPage();
        }
        
        // 备用检查：3秒后再次确认
        setTimeout(() => {
            this.doubleCheckVisibility();
        }, 3000);
    },

    /**
     * 双重检查可见性
     */
    doubleCheckVisibility() {
        console.log('执行页面可见性双重检查...');
        
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');
        
        const loginVisible = loginPage && !loginPage.classList.contains('hidden') && loginPage.style.display !== 'none';
        const mainVisible = mainApp && !mainApp.classList.contains('hidden') && mainApp.style.display !== 'none';
        
        console.log('可见性检查结果 - 登录页:', loginVisible, '主应用:', mainVisible);
        
        if (!loginVisible && !mainVisible) {
            console.warn('⚠️ 没有页面可见，应用紧急修复...');
            this.emergencyRepair();
        } else {
            console.log('✓ 页面可见性正常');
        }
    },

    /**
     * 紧急修复
     */
    emergencyRepair() {
        console.log('执行紧急修复...');
        
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            // 应用紧急修复样式
            loginPage.style.cssText = `
                display: flex !important;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                width: 100vw !important;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                position: fixed !important;
                top: 0;
                left: 0;
                z-index: 9999;
            `;
            
            // 清空并重新构建内容
            loginPage.innerHTML = this.getLoginPageHTML();
            
            console.log('✓ 紧急修复完成，登录页面已重新构建');
            
            // 重新绑定登录表单事件
            this.bindEmergencyLoginEvents();
        }
    },

    /**
     * 获取登录页面HTML
     */
    getLoginPageHTML() {
        return `
            <div class="emergency-login-container" style="max-width: 1000px; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;">
                <!-- 左侧品牌区域 -->
                <div style="color: white; text-align: center;">
                    <div style="margin-bottom: 30px;">
                        <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-graduation-cap" style="font-size: 2.5rem;"></i>
                        </div>
                        <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 15px;">校园AI助手</h1>
                        <p style="font-size: 1.1rem; opacity: 0.9; line-height: 1.6; margin-bottom: 30px;">
                            智能校园向导，让大学生活更便捷<br>
                            AI驱动的个性化服务，您的贴心助手
                        </p>
                        
                        <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 10px; font-size: 1rem;">
                                <i class="fas fa-robot" style="font-size: 1.2rem;"></i>
                                <span>智能课程管理与问答</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; font-size: 1rem;">
                                <i class="fas fa-calendar-alt" style="font-size: 1.2rem;"></i>
                                <span>个性化课表与提醒</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; font-size: 1rem;">
                                <i class="fas fa-map-marker-alt" style="font-size: 1.2rem;"></i>
                                <span>校园导航与服务查询</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 右侧登录表单 -->
                <div style="background: rgba(255,255,255,0.95); padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="font-size: 1.5rem; font-weight: 600; color: #333; margin-bottom: 10px;">用户登录</h2>
                        <p style="color: #666;">请输入您的账号信息</p>
                    </div>
                    
                    <form id="emergencyLoginForm">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">学号</label>
                            <input type="text" id="emergencyStudentId" placeholder="请输入8位学号"
                                   style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px;">
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">密码</label>
                            <input type="password" id="emergencyPassword" placeholder="请输入密码"
                                   style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px;">
                        </div>
                        
                        <button type="submit" id="emergencyLoginBtn"
                                style="width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 14px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
                            登录
                        </button>
                    </form>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <button id="emergencyGuestBtn"
                                style="background: transparent; border: 2px solid #667eea; color: #667eea; padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                            游客体验
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 绑定紧急登录表单事件
     */
    bindEmergencyLoginEvents() {
        const loginForm = document.getElementById('emergencyLoginForm');
        const guestBtn = document.getElementById('emergencyGuestBtn');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const studentId = document.getElementById('emergencyStudentId').value;
                const password = document.getElementById('emergencyPassword').value;
                const loginBtn = document.getElementById('emergencyLoginBtn');
                
                // 简单验证
                if (!studentId || !password) {
                    alert('请输入学号和密码');
                    return;
                }
                
                // 模拟登录
                loginBtn.textContent = '登录中...';
                loginBtn.disabled = true;
                
                setTimeout(() => {
                    // 模拟登录成功
                    localStorage.setItem('authToken', 'emergency_token_' + Date.now());
                    localStorage.setItem('studentId', studentId);
                    
                    alert('登录成功！');
                    location.reload();
                }, 1500);
            });
        }
        
        if (guestBtn) {
            guestBtn.addEventListener('click', () => {
                localStorage.setItem('guestMode', 'true');
                alert('欢迎进入游客模式！');
                location.reload();
            });
        }
    },
    
    /**
     * 处理本地文件系统环境
     */
    async handleLocalFileSystem() {
        console.log('进入本地文件系统处理流程');
        
        // 显示本地文件系统提示
        this.showLocalFileSystemWarning();
        
        // 标记为已初始化
        this.state.isInitialized = true;
        
        // 尝试初始化基础功能
        try {
            // 等待基础模块加载
            await this.waitForModules(['Utils', 'LoginModule', 'ChatModule', 'SidebarModule']);
            
            // 加载配置（跳过PWA相关）
            this.loadConfiguration();
            
            // 注册基础模块
            this.registerModules();
            
            // 检查登录状态
            this.checkLoginStatus();
            
            // 初始化UI
            this.initializeUI();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            console.log('本地文件系统模式初始化完成');
            
        } catch (error) {
            console.error('本地文件系统模式初始化失败:', error);
            // 即使失败也尝试显示登录界面
            this.startDemoMode();
        }
    },
    
    /**
     * 显示本地文件系统警告
     */
    showLocalFileSystemWarning() {
        const appLoading = document.getElementById('appLoading');
        if (!appLoading) return;
        
        // 检查URL参数，如果有 local=true 则跳过警告
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('local') === 'true') {
            return;
        }
        
        appLoading.innerHTML = `
            <div class="text-center text-white p-8 max-w-lg mx-auto">
                <div class="text-6xl mb-4">📁</div>
                <h2 class="text-2xl font-bold mb-4">本地文件模式</h2>
                <div class="bg-white bg-opacity-10 rounded-lg p-4 mb-4 text-left">
                    <p class="text-sm mb-3">⚠️ 您正在以本地文件方式运行，部分功能受限：</p>
                    <ul class="text-xs space-y-2 mb-4">
                        <li>• PWA功能不可用</li>
                        <li>• Service Worker无法注册</li>
                        <li>• 本地存储可能受限</li>
                        <li>• 部分API无法使用</li>
                    </ul>
                    <p class="text-sm font-semibold mb-2">💡 建议使用本地服务器运行：</p>
                    <div class="mt-2 space-y-1 text-xs font-mono bg-black bg-opacity-20 p-2 rounded">
                        <p>> npx http-server -p 8000</p>
                        <p>> python -m http.server 8000</p>
                        <p>> php -S localhost:8000</p>
                    </div>
                </div>
                <div class="flex gap-3 justify-center flex-wrap">
                    <button onclick="App.startDemoMode()" class="px-4 py-2 bg-green-500 bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-colors">
                        进入演示模式
                    </button>
                    <button onclick="App.dismissWarning()" class="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                        继续使用
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * 启动演示模式
     */
    startDemoMode() {
        console.log('启动演示模式');
        
        // 隐藏加载界面
        const appLoading = document.getElementById('appLoading');
        if (appLoading) {
            appLoading.style.opacity = '0';
            setTimeout(() => {
                appLoading.style.display = 'none';
            }, 500);
        }
        
        // 直接显示登录界面
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'grid';
            loginPage.classList.remove('hidden');
        }
        
        // 禁用PWA相关功能
        if (typeof PWAModule !== 'undefined') {
            PWAModule.state.isSupported = false;
        }
        
        // 显示提示
        if (typeof Utils !== 'undefined' && Utils.showInfo) {
            setTimeout(() => {
                Utils.showInfo('已进入演示模式，使用基础功能');
            }, 500);
        }
    },
    
    /**
     * 关闭警告并继续
     */
    dismissWarning() {
        console.log('关闭本地文件系统警告');
        
        // 隐藏加载界面
        const appLoading = document.getElementById('appLoading');
        if (appLoading) {
            appLoading.style.opacity = '0';
            setTimeout(() => {
                appLoading.style.display = 'none';
            }, 500);
        }
        
        // 开始应用初始化
        try {
            // 初始化UI
            this.initializeUI();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 检查登录状态
            this.checkLoginStatus();
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.startDemoMode();
        }
    },
    
    /**
     * 等待所有模块加载完成
     */
    async waitForModules() {
        const modules = ['Utils', 'PWAModule', 'LoginModule', 'ChatModule', 'SidebarModule'];
        const maxWaitTime = 5000; // 最多等待5秒
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            const allLoaded = modules.every(moduleName => typeof window[moduleName] !== 'undefined');
            
            if (allLoaded) {
                this.log('所有模块加载完成');
                return;
            }
            
            // 检查哪些模块还未加载
            const missingModules = modules.filter(moduleName => typeof window[moduleName] === 'undefined');
            this.log(`等待模块加载: ${missingModules.join(', ')}`);
            
            // 等待100毫秒后再检查
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 如果超时，抛出未加载的模块
        const missingModules = modules.filter(moduleName => typeof window[moduleName] === 'undefined');
        throw new Error(`以下模块加载失败或超时: ${missingModules.join(', ')}`);
    },

    /**
     * 加载配置
     */
    loadConfiguration() {
        // 加载用户配置
        const userSettings = Utils.Storage.get('userSettings', {
            nickname: '学生用户',
            avatar: null,
            theme: 'light',
            fontSize: 'medium'
        });

        this.config.userSettings = userSettings;

        // 加载应用设置
        const appSettings = Utils.Storage.get('appSettings', {
            theme: 'light',
            fontSize: 'medium',
            notifications: true,
            soundEffects: true,
            autoBackup: true
        });

        this.config.appSettings = appSettings;

        // 应用主题
        if (appSettings.theme === 'dark' || document.documentElement.classList.contains('dark')) {
            this.setTheme('dark');
        }
    },

    /**
     * 初始化数据
     */
    initializeData() {
        // 确保基本数据结构存在
        const defaults = {
            chatHistory: [],
            reminders: [],
            studentSchedule: { weeklySchedule: [] },
            userSettings: { nickname: '学生用户' },
            appSettings: {
                theme: 'light',
                notifications: true
            }
        };

        for (const [key, defaultValue] of Object.entries(defaults)) {
            if (!Utils.Storage.get(key, null)) {
                Utils.Storage.set(key, defaultValue);
                this.log(`初始化数据: ${key}`);
            }
        }
    },

    /**
     * 初始化PWA模块
     */
    initializePWA() {
        const pwaModule = this.state.modules.pwa;
        if (pwaModule) {
            try {
                pwaModule.init();
                this.log('PWA模块初始化成功');
            } catch (error) {
                this.error('PWA模块初始化失败', error);
            }
        }
    },

    /**
     * 注册模块
     */
    registerModules() {
        this.state.modules = {
            utils: typeof Utils !== 'undefined' ? Utils : null,
            pwa: typeof PWAModule !== 'undefined' ? PWAModule : null,
            login: typeof LoginModule !== 'undefined' ? LoginModule : null,
            chat: typeof ChatModule !== 'undefined' ? ChatModule : null,
            sidebar: typeof SidebarModule !== 'undefined' ? SidebarModule : null
        };

        // 检查模块依赖
        const missingModules = Object.entries(this.state.modules)
            .filter(([_, module]) => module === null)
            .map(([name, _]) => name);

        if (missingModules.length > 0) {
            throw new Error(`缺少必需的模块: ${missingModules.join(', ')}`);
        }

        this.log('所有模块注册成功');
    },

    /**
     * 检查登录状态
     */
    checkLoginStatus() {
        // 检查是否有认证token或访客模式
        const authToken = localStorage.getItem('authToken');
        const guestMode = localStorage.getItem('guestMode');
        const isLoggedIn = !!(authToken || guestMode);
        
        console.log('检查登录状态:', { authToken, guestMode, isLoggedIn });
        
        // 更新应用状态
        this.state.isLoggedIn = isLoggedIn;
        
        // 如果已登录，获取用户信息
        if (isLoggedIn && this.state.modules.login) {
            this.state.currentUser = this.state.modules.login.getCurrentUser();
        } else {
            this.state.currentUser = null;
        }

        this.log(`登录状态: ${isLoggedIn ? '已登录' : '未登录'}`);
        
        return isLoggedIn;
    },

    /**
     * 初始化UI
     */
    initializeUI() {
        console.log('初始化UI...');
        
        // 立即隐藏加载动画
        const appLoading = document.getElementById('appLoading');
        if (appLoading) {
            appLoading.style.display = 'none';
            appLoading.classList.add('hidden');
            console.log('隐藏加载动画');
        }
        
        // 检查登录状态
        const isLoggedIn = this.checkLoginStatus();
        console.log('当前登录状态:', isLoggedIn);
        
        // 根据登录状态显示相应页面
        if (isLoggedIn) {
            this.showMainApp();
        } else {
            this.showLoginPage();
        }
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.doInitializeUI());
        } else {
            this.doInitializeUI();
        }
    },

    /**
     * 显示登录页面
     */
    showLoginPage() {
        console.log('显示登录页面...');
        
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');
        
        if (loginPage) {
            // 移除隐藏类
            loginPage.classList.remove('hidden');
            // 设置显示样式
            loginPage.style.display = 'grid';
            loginPage.style.visibility = 'visible';
            loginPage.style.opacity = '1';
            console.log('登录页面已显示');
        }
        
        if (mainApp) {
            // 确保主应用隐藏
            mainApp.classList.add('hidden');
            mainApp.style.display = 'none';
        }
    },

    /**
     * 显示主应用
     */
    showMainApp() {
        console.log('显示主应用...');
        
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');
        
        if (mainApp) {
            // 移除隐藏类
            mainApp.classList.remove('hidden');
            // 设置显示样式
            mainApp.style.display = 'flex';
            mainApp.style.visibility = 'visible';
            mainApp.style.opacity = '1';
            console.log('主应用已显示');
        }
        
        if (loginPage) {
            // 确保登录页面隐藏
            loginPage.classList.add('hidden');
            loginPage.style.display = 'none';
        }
    },

    /**
     * 执行UI初始化
     */
    doInitializeUI() {
        // 初始化登录模块
        if (this.state.modules.login) {
            this.state.modules.login.init();
        }

        // 初始化侧边栏模块
        if (this.state.modules.sidebar) {
            this.state.modules.sidebar.init();
        }

        // 初始化聊天模块
        if (this.state.modules.chat) {
            this.state.modules.chat.init();
        }

        // 显示欢迎消息
        this.showWelcomeMessage();

        // 设置页面标题
        this.updatePageTitle();
    },

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 页面加载事件
        window.addEventListener('load', () => {
            this.log('页面加载完成');
            this.onPageLoad();
        });

        // 页面卸载事件
        window.addEventListener('beforeunload', () => {
            this.log('页面即将卸载');
            this.onPageUnload();
        });

        // 视窗可见性变化
        document.addEventListener('visibilitychange', () => {
            this.log(`文档可见性: ${document.visibilityState}`);
        });

        // 错误捕获
        window.addEventListener('error', (event) => {
            this.error('全局错误捕获', event.error);
        });

        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.error('未处理的Promise拒绝', event.reason);
        });

        // 在线/离线状态
        window.addEventListener('online', () => {
            this.log('网络已连接');
            Utils.showSuccess('网络已恢复');
        });

        window.addEventListener('offline', () => {
            this.log('网络已断开');
            Utils.showWarning('网络已断开，部分功能可能不可用');
        });
    },

    /**
     * 页面加载完成处理
     */
    onPageLoad() {
        console.log(`🎉 ${this.config.name} v${this.config.version} 已启动`);

        // 自动备份（如果启用）
        if (this.config.appSettings.autoBackup) {
            this.scheduleAutoBackup();
        }

        // 加载并显示上次未读的消息
        this.loadUnreadNotifications();
    },

    /**
     * 页面卸载处理
     */
    onPageUnload() {
        // 保存当前状态
        if (this.state.modules.chat) {
            this.state.modules.chat.saveHistory();
        }
    },

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        const container = document.getElementById('messageContainer');
        if (!container || container.children.length > 0) return;

        const welcomeHTML = `
            <div class="welcome-message text-center py-8">
                <div class="text-6xl mb-4">🎓</div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">欢迎使用校园AI助手</h2>
                <p class="text-gray-600 mb-6">您的智能校园生活管家</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <button onclick="App.sendQuickMessage('今天有什么课程')" 
                            class="quick-action p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <i class="fas fa-calendar-alt text-2xl text-blue-600 mb-2"></i>
                        <p class="text-sm text-gray-700">查询课程</p>
                    </button>
                    <button onclick="App.sendQuickMessage('食堂今天有什么菜')" 
                            class="quick-action p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        <i class="fas fa-utensils text-2xl text-green-600 mb-2"></i>
                        <p class="text-sm text-gray-700">食堂菜单</p>
                    </button>
                    <button onclick="App.sendQuickMessage('图书馆空位查询')" 
                            class="quick-action p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                        <i class="fas fa-book text-2xl text-purple-600 mb-2"></i>
                        <p class="text-sm text-gray-700">图书馆</p>
                    </button>
                    <button onclick="App.sendQuickMessage('设置上课提醒')" 
                            class="quick-action p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                        <i class="fas fa-bell text-2xl text-orange-600 mb-2"></i>
                        <p class="text-sm text-gray-700">设置提醒</p>
                    </button>
                </div>
                <p class="text-sm text-gray-500 mt-6">您可以问我任何校园相关的问题，我会尽力为您解答！</p>
            </div>
        `;

        container.innerHTML = welcomeHTML;
    },

    /**
     * 发送快捷消息
     * @param {string} message - 消息内容
     */
    sendQuickMessage(message) {
        if (this.state.modules.chat) {
            this.state.modules.chat.sendQuickMessage(message);
        }
    },

    /**
     * 显示欢迎动画
     */
    showWelcomeAnimation() {
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
            mainContainer.style.animation = 'fadeIn 0.5s ease';
        }
    },

    /**
     * 加载未读通知
     */
    loadUnreadNotifications() {
        try {
            const reminders = Utils.Storage.get('reminders', []);
            const now = new Date();

            // 检查即将到来的提醒
            reminders.forEach(reminder => {
                const reminderTime = new Date(reminder.time);
                const timeDiff = reminderTime - now;

                if (timeDiff > 0 && timeDiff <= 300000) { // 5分钟内
                    Utils.showWarning(`即将提醒: ${reminder.title}`);
                }
            });
        } catch (error) {
            this.error('加载通知失败', error);
        }
    },

    /**
     * 自动备份
     */
    scheduleAutoBackup() {
        // 每小时备份一次
        setInterval(() => {
            this.createBackup();
        }, 3600000);

        // 不备份时自动清理旧备份
        this.cleanupOldBackups();
    },

    /**
     * 创建备份
     */
    createBackup() {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                chatHistory: Utils.Storage.get('chatHistory', []),
                schedule: Utils.Storage.get('studentSchedule', {}),
                reminders: Utils.Storage.get('reminders', []),
                settings: {
                    userSettings: Utils.Storage.get('userSettings', {}),
                    appSettings: Utils.Storage.get('appSettings', {})
                }
            };

            const backups = Utils.Storage.get('backups', []);
            backups.unshift(backupData);

            // 只保留最近10个备份
            if (backups.length > 10) {
                backups.splice(10);
            }

            Utils.Storage.set('backups', backups);
            this.log('自动备份完成');

        } catch (error) {
            this.error('自动备份失败', error);
        }
    },

    /**
     * 清理旧备份
     */
    cleanupOldBackups() {
        const backups = Utils.Storage.get('backups', []);
        if (backups.length > 20) {
            const keepBackups = backups.slice(-10);
            Utils.Storage.set('backups', keepBackups);
        }
    },

    /**
     * 更新页面标题
     */
    updatePageTitle() {
        const user = this.state.currentUser;
        if (user && user.nickname) {
            document.title = `${this.config.name} - ${user.nickname}`;
        } else {
            document.title = this.config.name;
        }
    },

    /**
     * 设置主题
     * @param {string} theme - 主题名称
     */
    setTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.classList.add('dark');
            document.body.classList.add('bg-gray-900', 'text-white');
        } else {
            html.classList.remove('dark');
            document.body.classList.remove('bg-gray-900', 'text-white');
        }

        // 更新配置
        if (this.state.modules.sidebar) {
            this.state.modules.sidebar.setTheme(theme);
        }
    },

    /**
     * 显示错误页面
     * @param {Error} error - 错误对象
     */
    showLoadError(error) {
        const loadingDiv = document.getElementById('appLoading');
        if (!loadingDiv) return;

        loadingDiv.innerHTML = `
            <div class="text-center text-white">
                <div class="text-8xl mb-6">⚠️</div>
                <h2 class="text-3xl font-bold mb-4">应用启动失败</h2>
                <p class="text-gray-600 mb-6 text-white opacity-80">抱歉，应用遇到了一些问题</p>
                <div class="bg-white bg-opacity-10 p-4 rounded-lg max-w-md mx-auto text-left mb-6">
                    <p class="font-semibold mb-2 text-white">错误信息：</p>
                    <p class="text-sm text-white opacity-90">${error.message}</p>
                </div>
                <button onclick="window.location.reload()"
                        class="px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                    <i class="fas fa-redo mr-2"></i>重新加载页面
                </button>
                <div class="mt-4 text-sm opacity-60">
                    <p>错误详情（开发者模式）：</p>
                    <p class="mt-1">${error.stack?.split('\n')[0] || error.toString()}</p>
                </div>
            </div>
        `;
    },
    
    /**
     * 隐藏加载动画
     */
    hideLoadingAnimation() {
        const loadingDiv = document.getElementById('appLoading');
        if (loadingDiv) {
            loadingDiv.style.opacity = '0';
            setTimeout(() => {
                loadingDiv.style.display = 'none';
            }, 300);
        }
    },
    
    /**
     * 显示加载动画
     */
    showLoadingAnimation() {
        const loadingDiv = document.getElementById('appLoading');
        if (loadingDiv) {
            loadingDiv.style.display = 'flex';
            loadingDiv.style.opacity = '1';
        }
    },

    /**
     * 获取应用状态
     * @returns {Object} 应用状态
     */
    getState() {
        return {
            ...this.state,
            config: this.config
        };
    },

    /**
     * 重启应用
     */
    restart() {
        this.log('重启应用...');
        window.location.reload();
    },

    /**
     * 清理应用数据
     */
    clearData() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            Utils.Storage.clear();
            this.restart();
        }
    },

    /**
     * 日志记录
     */
    log(message, data = {}) {
        if (this.config.debug) {
            console.log(`[${this.config.name}] ${message}`, data);
        }
    },

    /**
     * 错误记录
     */
    error(message, error) {
        console.error(`[${this.config.name}] ${message}`, error);
    }
};

// DOM加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM加载完成，开始初始化应用...');
        App.init().catch(error => {
            console.error('应用初始化异常:', error);
            App.showLoadError(error);
        });
    });
} else {
    console.log('DOM已加载，开始初始化应用...');
    App.init().catch(error => {
        console.error('应用初始化异常:', error);
        App.showLoadError(error);
    });
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.App = App;
}

// 模块导出
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = App;
}