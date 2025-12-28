/**
 * ========================================
 * 校园AI助手 - 登录模块
 * 版本: 2.0 - 模块化重构版
 * 处理用户登录、注册、认证等逻辑
 * ========================================
 */

const LoginModule = {
    // 状态变量
    state: {
        currentLoginType: 'password',
        rememberDuration: 7,
        loginAttempts: 0,
        maxLoginAttempts: 3
    },

    /**
     * 初始化登录模块
     */
    init() {
        this.bindEvents();
        this.checkLoginStatus();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 记住我复选框
        const rememberMeCheckbox = document.getElementById('rememberMe');
        if (rememberMeCheckbox) {
            rememberMeCheckbox.addEventListener('change', (e) => {
                const durationDiv = document.getElementById('rememberDuration');
                if (durationDiv) {
                    durationDiv.style.display = e.target.checked ? 'flex' : 'none';
                }
            });
        }

        // 密码输入框验证
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.validatePassword(passwordInput));
        }

        // 学号输入框验证
        const studentIdInput = document.getElementById('studentId');
        if (studentIdInput) {
            studentIdInput.addEventListener('input', () => this.validateStudentId(studentIdInput));
        }
    },

    /**
     * 检查登录状态
     * @returns {boolean} 是否已登录
     */
    checkLoginStatus() {
        const token = Utils.Storage.get('authToken');
        const guestMode = Utils.Storage.get('guestMode');

        if (token || guestMode) {
            this.showMainApp();
            return true;
        }
        return false;
    },

    /**
     * 检查认证状态（兼容方法）
     * @returns {boolean} 是否已认证
     */
    checkAuth() {
        return this.checkLoginStatus();
    },

    /**
     * 检查登录是否过期
     * @returns {boolean} 是否有效
     */
    checkLoginExpiry() {
        const expiry = Utils.Storage.get('loginExpiry');
        if (expiry && new Date(expiry) < new Date()) {
            Utils.Storage.remove('authToken');
            Utils.Storage.remove('loginExpiry');
            Utils.Storage.remove('studentId');
            return false;
        }
        return true;
    },

    /**
     * 切换登录类型
     * @param {string} type - 登录类型: 'password', 'qr', 'guest'
     */
    switchLoginType(type) {
        this.state.currentLoginType = type;

        // 更新选项卡状态
        const options = document.querySelectorAll('.login-option');
        options.forEach(option => option.classList.remove('active'));
        event.target.closest('.login-option').classList.add('active');

        // 切换表单显示
        document.getElementById('passwordLogin').style.display = type === 'password' ? 'block' : 'none';
        document.getElementById('qrLogin').style.display = type === 'qr' ? 'block' : 'none';
        document.getElementById('guestLogin').style.display = type === 'guest' ? 'block' : 'none';
    },

    /**
     * 验证学号
     * @param {HTMLInputElement} input - 输入框元素
     * @returns {boolean} 是否有效
     */
    validateStudentId(input) {
        const value = input.value;
        const hint = document.getElementById('studentIdHint');

        if (value.length === 0) {
            input.classList.remove('error', 'success');
            hint.className = 'validation-hint info';
            hint.innerHTML = '<i class="fas fa-info-circle"></i><span>请输入8位数字学号</span>';
            return false;
        }

        if (value.length !== 8) {
            input.classList.add('error');
            input.classList.remove('success');
            hint.className = 'validation-hint error';
            hint.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>学号必须是8位数字</span>';
            return false;
        }

        if (!/^\d{8}$/.test(value)) {
            input.classList.add('error');
            input.classList.remove('success');
            hint.className = 'validation-hint error';
            hint.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>学号只能包含数字</span>';
            return false;
        }

        input.classList.remove('error');
        input.classList.add('success');
        hint.className = 'validation-hint success';
        hint.innerHTML = '<i class="fas fa-check-circle"></i><span>学号格式正确</span>';
        return true;
    },

    /**
     * 验证密码
     * @param {HTMLInputElement} input - 输入框元素
     * @returns {boolean} 是否有效
     */
    validatePassword(input) {
        const value = input.value;
        const hint = document.getElementById('passwordHint');
        const strengthBar = document.getElementById('passwordStrengthBar');

        if (value.length === 0) {
            input.classList.remove('error', 'success');
            hint.className = 'validation-hint info';
            hint.innerHTML = '<i class="fas fa-info-circle"></i><span>密码长度至少6位</span>';
            strengthBar.className = 'password-strength-bar';
            return false;
        }

        // 计算密码强度
        let strength = 0;
        if (value.length >= 6) strength++;
        if (value.length >= 10) strength++;
        if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
        if (/\d/.test(value)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strength++;

        const strengthInfo = {
            1: { text: '密码强度：弱', class: 'weak' },
            2: { text: '密码强度：弱', class: 'weak' },
            3: { text: '密码强度：中等', class: 'medium' },
            4: { text: '密码强度：强', class: 'strong' },
            5: { text: '密码强度：强', class: 'strong' }
        };

        if (value.length < 6) {
            input.classList.add('error');
            input.classList.remove('success');
            hint.className = 'validation-hint error';
            hint.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>密码长度至少6位</span>';
            strengthBar.className = 'password-strength-bar';
            return false;
        }

        input.classList.remove('error');
        input.classList.add('success');
        hint.className = 'validation-hint success';
        hint.innerHTML = `<i class="fas fa-check-circle"></i><span>${strengthInfo[strength].text}</span>`;
        strengthBar.className = `password-strength-bar ${strengthInfo[strength].class}`;
        return true;
    },

    /**
     * 切换密码显示
     */
    togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('passwordToggle');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    },

    /**
     * 设置记住时长
     * @param {number} days - 天数
     */
    setRememberDuration(days) {
        this.state.rememberDuration = days;
        const buttons = document.querySelectorAll('.duration-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    },

    /**
     * 处理登录
     * @param {Event} event - 表单提交事件
     */
    async handleLogin(event) {
        event.preventDefault();

        const studentId = document.getElementById('studentId').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const agreement = document.getElementById('agreement').checked;

        // 验证输入
        if (!this.validateStudentId(document.getElementById('studentId')) ||
            !this.validatePassword(document.getElementById('password'))) {
            return;
        }

        if (!agreement) {
            Utils.showError('请先阅读并同意用户协议');
            return;
        }

        // 显示加载状态
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.classList.add('loading');

        try {
            // 模拟登录请求
            await this.simulateLogin(studentId, password);

            // 登录成功
            if (rememberMe) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + this.state.rememberDuration);
                Utils.Storage.set('loginExpiry', expiry.toISOString());
            }

            // 保存登录信息
            const userData = {
                token: 'mock_token_' + Date.now(),
                studentId: studentId,
                loginDate: new Date().toISOString()
            };
            Utils.Storage.set('authToken', userData.token);
            Utils.Storage.set('studentId', studentId);
            Utils.Storage.set('loginDate', userData.loginDate);

            // 显示成功动画
            this.showLoginSuccess();

            // 切换页面显示
            setTimeout(() => {
                this.switchToMainApp();
            }, 1500);

        } catch (error) {
            loginBtn.classList.remove('loading');
            this.state.loginAttempts++;

            if (this.state.loginAttempts >= this.state.maxLoginAttempts) {
                Utils.showError(`登录失败次数过多，请稍后再试（${30}秒后重试）`);
                
                // 锁定30秒
                setTimeout(() => {
                    this.state.loginAttempts = 0;
                }, 30000);
            } else {
                Utils.showError('学号或密码错误，请重试');
            }
        }
    },

    /**
     * 模拟登录请求
     * @param {string} studentId - 学号
     * @param {string} password - 密码
     * @returns {Promise<void>}
     */
    simulateLogin(studentId, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 从用户数据中验证
                // 注意：这里是前端模拟，实际应用应该在服务端验证
                const validCredentials = [
                    { id: '20210001', pwd: '123456' },
                    { id: '20210002', pwd: 'password' },
                    { id: '20210003', pwd: 'abc123' }
                ];

                const isValid = validCredentials.some(
                    cred => cred.id === studentId && cred.pwd === password
                );

                if (isValid) {
                    resolve();
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1500);
        });
    },

    /**
     * 显示登录成功动画
     */
    showLoginSuccess() {
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.innerHTML = '<i class="fas fa-check"></i> 登录成功';
        loginBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
    },

    /**
     * 游客体验
     */
    guestExperience() {
        Utils.Storage.set('guestMode', true);
        this.showMainApp();
    },

    /**
     * 退出登录
     */
    logout() {
        if (confirm('确定要退出登录吗？\n\n退出后将清除所有本地存储的数据。')) {
            // 清除登录相关数据
            Utils.Storage.remove('authToken');
            Utils.Storage.remove('studentId');
            Utils.Storage.remove('loginExpiry');
            Utils.Storage.remove('guestMode');
            Utils.Storage.remove('loginDate');

            // 隐藏主应用，显示登录页面
            const mainApp = document.getElementById('mainApp');
            const loginPage = document.getElementById('loginPage');

            if (mainApp) mainApp.style.display = 'none';
            if (loginPage) {
                loginPage.classList.remove('hidden');
                loginPage.style.display = 'grid';
            }

            // 重置表单
            const studentIdInput = document.getElementById('studentId');
            const passwordInput = document.getElementById('password');
            if (studentIdInput) studentIdInput.value = '';
            if (passwordInput) passwordInput.value = '';

            Utils.showSuccess('已成功退出登录');

            // 重新初始化
            setTimeout(() => {
                location.reload();
            }, 500);
        }
    },

    /**
     * 忘记密码（模拟）
     */
    forgotPassword() {
        const studentId = document.getElementById('studentId').value;
        if (!studentId || !this.validateStudentId(document.getElementById('studentId'))) {
            Utils.showError('请先输入正确的学号');
            return;
        }

        Utils.showSuccess('密码重置链接已发送到您的邮箱');
    },

    /**
     * 显示用户协议
     * @param {string} type - 协议类型: 'privacy', 'terms'
     */
    showAgreement(type) {
        event.preventDefault();
        const title = type === 'privacy' ? '隐私政策' : '用户协议';
        const content = type === 'privacy'
            ? '我们重视您的隐私保护，所有数据都将得到妥善保管。' +
              '\n\n1. 我们收集的数据仅用于改善用户体验\n' +
              '2. 我们不会向第三方出售您的个人信息\n' +
              '3. 您可以随时删除您的账户和数据\n' +
              '4. 我们使用加密技术保护您的信息安全'
            : '使用本应用即表示您同意遵守以下条款：\n\n' +
              '1. 请妥善保管您的账户信息\n' +
              '2. 禁止任何恶意使用本系统\n' +
              '3. 系统数据仅供参考，具体以实际情况为准\n' +
              '4. 我们保留随时修改服务的权利';

        alert(`${title}\n\n${content}`);
    },

    /**
     * 切换到主应用
     */
    switchToMainApp() {
        console.log('切换到主应用...');
        
        // 隐藏登录页面
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.classList.add('hidden');
            loginPage.style.display = 'none';
        }
        
        // 显示主应用
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.remove('hidden');
            mainApp.style.display = 'flex';
            mainApp.style.visibility = 'visible';
            mainApp.style.opacity = '1';
            console.log('主应用已显示');
        }
        
        // 触发主应用初始化
        if (window.App && typeof App.initMainApp === 'function') {
            App.initMainApp();
        }
    },

    /**
     * 显示主应用界面
     */
    showMainApp() {
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');

        // 隐藏登录页面
        if (loginPage) {
            loginPage.classList.add('hidden');
            loginPage.style.display = 'none';
        }

        // 显示主应用
        if (mainApp) {
            mainApp.classList.remove('hidden');
            mainApp.style.display = 'flex';
            mainApp.style.visibility = 'visible';
            mainApp.style.opacity = '1';
        }

        // 初始化其他模块
        if (typeof SidebarModule !== 'undefined' && typeof SidebarModule.init === 'function') {
            SidebarModule.init();
        }

        if (typeof ChatModule !== 'undefined' && typeof ChatModule.init === 'function') {
            ChatModule.init();
        }
    },

    /**
     * 获取当前用户信息
     * @returns {Object|null} 用户信息
     */
    getCurrentUser() {
        const studentId = Utils.Storage.get('studentId');
        if (!studentId) return null;

        // 从数据中获取用户信息（实际应用中应该从API获取）
        const users = this.getUsersData();
        return users[studentId] || null;
    },

    /**
     * 获取用户数据（从内嵌数据或文件）
     * @returns {Object} 用户数据
     */
    getUsersData() {
        // 尝试从全局campusData获取
        if (typeof campusData !== 'undefined' && campusData.users) {
            return campusData.users;
        }

        // 默认用户数据
        return {
            '20210001': { password: '123456', name: '张三', major: '计算机科学', class: '计科2101', phone: '138****1234' },
            '20210002': { password: 'password', name: '李四', major: '软件工程', class: '软件2102', phone: '139****5678' },
            '20210003': { password: 'abc123', name: '王五', major: '人工智能', class: '人工2103', phone: '137****9012' }
        };
    }
};

// 导出到全局（供HTML直接使用）
if (typeof window !== 'undefined') {
    window.LoginModule = LoginModule;
}

// 模块导出
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LoginModule;
}