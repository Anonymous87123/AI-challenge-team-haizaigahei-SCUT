/**
 * ========================================
 * 校园AI助手 - 侧边栏模块
 * 版本: 2.0 - 模块化重构版
 * 管理侧边栏导航、视图切换、快捷功能
 * ========================================
 */

const SidebarModule = {
    // 状态变量
    state: {
        currentTab: 'chat',
        isSidebarCollapsed: false,
        isMobileMenuOpen: false
    },

    /**
     * 初始化侧边栏模块
     */
    init() {
        this.bindEvents();
        this.loadSettings();
        this.initTab('chat');
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 侧边栏折叠
        const collapseBtn = document.getElementById('collapseSidebar');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // 移动端菜单按钮
        const mobileMenuBtn = document.getElementById('mobileMenuButton');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // 标签页切换
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // 快捷功能按钮
        this.bindQuickActions();

        // 响应式处理
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));

        // 点击外部关闭移动端菜单
        document.addEventListener('click', (e) => {
            if (this.state.isMobileMenuOpen) {
                const sidebar = document.getElementById('sidebar');
                const menuBtn = document.getElementById('mobileMenuButton');
                if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    },

    /**
     * 绑定快捷功能按钮
     */
    bindQuickActions() {
        // 添加课程
        document.getElementById('addCourseBtn')?.addEventListener('click', () => this.openAddCourseModal());
        
        // 导出数据
        document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportData());
        
        // 清空记录
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            if (typeof ChatModule !== 'undefined') {
                ChatModule.clearHistory();
            }
        });
        
        // 反馈功能
        document.getElementById('feedbackBtn')?.addEventListener('click', () => this.openFeedbackModal());
        
        // 关于
        document.getElementById('aboutBtn')?.addEventListener('click', () => this.showAbout());
        
        // 设置
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.openSettings());
    },

    /**
     * 切换标签页
     * @param {string} tabName - 标签名
     */
    switchTab(tabName) {
        // 移除所有活跃状态
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white', 'ring-2', 'ring-blue-300');
            btn.classList.add('text-gray-600', 'hover:bg-gray-100');
        });
        
        document.querySelectorAll('[id^="tabPanel"]').forEach(panel => {
            panel.classList.add('hidden');
        });
        
        // 添加活跃状态
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('text-gray-600', 'hover:bg-gray-100');
            activeBtn.classList.add('bg-blue-500', 'text-white', 'ring-2', 'ring-blue-300');
            
            // 添加图标动画
            const icon = activeBtn.querySelector('i');
            if (icon) {
                icon.style.animation = 'pulse 0.3s ease';
                setTimeout(() => icon.style.animation = '', 300);
            }
        }
        
        // 显示对应面板
        const panel = document.getElementById(`tabPanel-${tabName}`);
        if (panel) {
            panel.classList.remove('hidden');
            panel.style.animation = 'fadeIn 0.3s ease';
        }
        
        this.state.currentTab = tabName;
        
        // 标签页特定初始化
        this.initTab(tabName);
        
        // 移动端切换后关闭菜单
        if (this.state.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    },

    /**
     * 初始化标签页
     * @param {string} tabName - 标签名
     */
    initTab(tabName) {
        switch (tabName) {
            case 'schedule':
                this.initScheduleTab();
                break;
            case 'qa':
                this.initQATab();
                break;
            case 'settings':
                this.initSettingsTab();
                break;
            default:
                // chat tab is default
                break;
        }
    },

    /**
     * 初始化课程表标签页
     */
    initScheduleTab() {
        this.renderSchedule();
    },

    /**
     * 渲染课程表
     */
    renderSchedule() {
        const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const today = new Date().getDay();
        const todayIndex = today === 0 ? 6 : today - 1;
        
        let scheduleHTML = '<div class="space-y-4">';
        
        // 加载课程数据
        const coursesData = this.loadCourseData();
        
        weekDays.forEach((day, index) => {
            const isToday = index === todayIndex;
            const dayCourses = coursesData[index] || [];
            
            scheduleHTML += `
                <div class="schedule-day ${isToday ? 'today-highlight' : ''}">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-semibold ${isToday ? 'text-blue-600' : ''}">${day} ${isToday ? '(今天)' : ''}</h4>
                        ${dayCourses.length > 0 ? `<span class="text-sm text-gray-500">${dayCourses.length} 节课</span>` : ''}
                    </div>
                    
                    ${dayCourses.length > 0 ? `
                        <div class="space-y-2">
                            ${dayCourses.map(course => this.renderCourseCard(course)).join('')}
                        </div>
                    ` : `
                        <div class="text-center text-gray-400 py-4 text-sm">
                            无课程安排
                        </div>
                    `}
                </div>
            `;
        });
        
        scheduleHTML += '</div>';
        
        const scheduleContainer = document.getElementById('scheduleContainer');
        if (scheduleContainer) {
            scheduleContainer.innerHTML = scheduleHTML;
        }
    },

    /**
     * 渲染课程卡片
     * @param {Object} course - 课程对象
     * @returns {string} HTML
     */
    renderCourseCard(course) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMin] = course.time.split('-')[0].split(':').map(Number);
        const courseStartTime = startHour * 60 + startMin;
        
        let statusClass = 'bg-gray-100';
        let statusText = '未开始';
        
        if (currentTime > courseStartTime) {
            statusClass = 'bg-red-100';
            statusText = '已结束';
        } else if (currentTime >= courseStartTime - 15) {
            statusClass = 'bg-green-100';
            statusText = '即将开始';
        }
        
        return `
            <div class="course-item ${statusClass} p-3 rounded-lg transition-all hover:shadow-md group">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h5 class="font-medium text-sm">${Utils.escapeHtml(course.name)}</h5>
                        <p class="text-xs text-gray-600 mt-1">
                            <i class="fas fa-map-marker-alt mr-1"></i>${Utils.escapeHtml(course.location)}
                        </p>
                        <p class="text-xs text-gray-600">
                            <i class="fas fa-clock mr-1"></i>${Utils.escapeHtml(course.time)}
                        </p>
                    </div>
                    <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="SidebarModule.editCourse('${course.id}')" 
                                class="text-blue-500 hover:text-blue-700 p-1"
                                title="编辑">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="SidebarModule.deleteCourse('${course.id}')" 
                                class="text-red-500 hover:text-red-700 p-1"
                                title="删除">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-2">
                    <span class="inline-block px-2 py-1 text-xs rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </div>
            </div>
        `;
    },

    /**
     * 加载课程数据
     * @returns {Array} 课程数据
     */
    loadCourseData() {
        // 尝试从localStorage加载
        const saved = Utils.Storage.get('studentSchedule', null);
        
        if (saved && saved.weeklySchedule) {
            return saved.weeklySchedule;
        }
        
        // 返回默认数据
        return [
            [ // 周一
                { id: '1', name: '计算机科学导论', location: '理科楼 A301', time: '08:00-09:40', teacher: '张教授' },
                { id: '2', name: '高等数学', location: '理科楼 B102', time: '10:00-11:40', teacher: '李教授' },
                { id: '3', name: '英语', location: '文科楼 C201', time: '14:00-15:40', teacher: '王教授' }
            ],
            [ // 周二
                { id: '4', name: '数据结构', location: '理科楼 A401', time: '08:00-09:40', teacher: '陈教授' },
                { id: '5', name: '计算机科学导论', location: '理科楼 A301', time: '10:00-11:40', teacher: '张教授' }
            ],
            [ // 周三
                { id: '6', name: '高等数学', location: '理科楼 B102', time: '08:00-09:40', teacher: '李教授' },
                { id: '7', name: '数据结构', location: '理科楼 A401', time: '14:00-15:40', teacher: '陈教授' },
                { id: '8', name: '物理实验', location: '实验楼 D101', time: '16:00-17:40', teacher: '刘教授' }
            ],
            [ // 周四
                { id: '9', name: '计算机网络', location: '理科楼 A501', time: '08:00-09:40', teacher: '周教授' },
                { id: '10', name: '数据库原理', location: '理科楼 A401', time: '10:00-11:40', teacher: '赵教授' }
            ],
            [ // 周五
                { id: '11', name: '软件工程', location: '理科楼 A601', time: '08:00-09:40', teacher: '吴教授' },
                { id: '12', name: '高等数学', location: '理科楼 B102', time: '10:00-11:40', teacher: '李教授' }
            ],
            [ // 周六
                { id: '13', name: '社团活动', location: '活动中心', time: '14:00-16:00', teacher: '' }
            ],
            [ // 周日
                []
            ]
        ];
    },

    /**
     * 编辑课程
     * @param {string} courseId - 课程ID
     */
    editCourse(courseId) {
        const courses = this.loadCourseData();
        let course = null;
        let dayIndex = -1;
        
        // 查找课程
        for (let i = 0; i < courses.length; i++) {
            const found = courses[i].find(c => c.id === courseId);
            if (found) {
                course = found;
                dayIndex = i;
                break;
            }
        }
        
        if (!course) {
            Utils.showError('课程未找到');
            return;
        }
        
        // 打开编辑表单
        Utils.Modal.open('courseModal', {
            title: '编辑课程',
            course: course,
            dayIndex: dayIndex,
            onSave: (formData) => this.saveCourse(formData)
        });
    },

    /**
     * 删除课程
     * @param {string} courseId - 课程ID
     */
    deleteCourse(courseId) {
        if (!confirm('确定要删除这门课程吗？')) return;
        
        const courses = this.loadCourseData();
        
        // 查找并删除课程
        for (let i = 0; i < courses.length; i++) {
            const index = courses[i].findIndex(c => c.id === courseId);
            if (index !== -1) {
                courses[i].splice(index, 1);
                break;
            }
        }
        
        // 保存并重新渲染
        const schedule = Utils.Storage.get('studentSchedule', { weeklySchedule: [] });
        schedule.weeklySchedule = courses;
        Utils.Storage.set('studentSchedule', schedule);
        
        this.renderSchedule();
        Utils.showSuccess('课程已删除');
    },

    /**
     * 保存课程
     * @param {Object} formData - 表单数据
     */
    saveCourse(formData) {
        const courses = this.loadCourseData();
        
        if (formData.editMode) {
            // 更新现有课程
            for (let i = 0; i < courses.length; i++) {
                const index = courses[i].findIndex(c => c.id === formData.id);
                if (index !== -1) {
                    courses[i][index] = {
                        ...courses[i][index],
                        name: formData.name,
                        location: formData.location,
                        time: formData.time,
                        teacher: formData.teacher
                    };
                    break;
                }
            }
        } else {
            // 添加新课程
            const newId = Date.now().toString();
            courses[formData.day].push({
                id: newId,
                name: formData.name,
                location: formData.location,
                time: formData.time,
                teacher: formData.teacher
            });
        }
        
        // 保存并重新渲染
        const schedule = Utils.Storage.get('studentSchedule', { weeklySchedule: [] });
        schedule.weeklySchedule = courses;
        Utils.Storage.set('studentSchedule', schedule);
        
        this.renderSchedule();
        Utils.showSuccess(formData.editMode ? '课程已更新' : '课程已添加');
        
        Utils.Modal.close('courseModal');
    },

    /**
     * 打开添加课程模态框
     */
    openAddCourseModal() {
        Utils.Modal.open('courseModal', {
            title: '添加课程',
            course: null,
            onSave: (formData) => this.saveCourse(formData)
        });
    },

    /**
     * 初始化问答标签页
     */
    initQATab() {
        this.renderFAQ();
    },

    /**
     * 渲染FAQ
     */
    renderFAQ() {
        const categories = [
            {
                name: '校园服务',
                icon: 'fas fa-university',
                items: [
                    { q: '食堂今天有什么菜？', a: '您可以询问"食堂今天有什么菜"或"今日菜单"，我会为您展示各食堂的今日推荐菜品。' },
                    { q: '图书馆什么时候开门？', a: '图书馆周一至周日08:00-22:00开放，您可以随时自习或借阅书籍。' },
                    { q: '校车几点发车？', a: '校车从早上7:00开始运营，每30分钟一班。询问"校车几点发车"可获取完整时刻表。' },
                    { q: '快递站在哪里？', a: '校园内有多个快递点：菜鸟驿站在宿舍1号楼下，顺丰在行政楼东侧，京东在体育馆南侧。' }
                ]
            },
            {
                name: '学习相关',
                icon: 'fas fa-book',
                items: [
                    { q: '高数作业什么时候交？', a: '高数作业本周五23:59截止，请记得按时完成哦！' },
                    { q: '计算机课的教室在哪？', a: '计算机课在理科楼A301，上课时间是08:00-09:40。' },
                    { q: '怎么借书？', a: '携带校园卡到图书馆服务台办理借阅手续，每人最多可借10本书，借期30天。' }
                ]
            },
            {
                name: '生活服务',
                icon: 'fas fa-heart',
                items: [
                    { q: '体育馆开放时间？', a: '体育馆周一至周五06:00-22:00开放，周末08:00-21:00开放。' },
                    { q: '校医院电话多少？', a: '校医院电话是123-4567-8902，急诊24小时服务。' },
                    { q: '哪里可以打印？', a: '图书馆一楼、学生服务中心、各教学楼走廊都有自助打印机。' }
                ]
            }
        ];
        
        let faqHTML = '<div class="space-y-6">';
        
        categories.forEach(category => {
            faqHTML += `
                <div class="faq-category">
                    <h4 class="font-semibold mb-3 flex items-center">
                        <i class="${category.icon} mr-2 text-blue-600"></i>
                        ${category.name}
                    </h4>
                    <div class="space-y-2">
            `;
            
            category.items.forEach((item, index) => {
                faqHTML += `
                    <div class="faq-item">
                        <button onclick="SidebarModule.toggleFAQItem(${categories.indexOf(category)}, ${index})"
                                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex justify-between items-center">
                            <span class="font-medium text-sm">${Utils.escapeHtml(item.q)}</span>
                            <i class="fas fa-chevron-down text-gray-400 transition-transform faq-chevron"></i>
                        </button>
                        <div class="faq-answer hidden p-3 bg-blue-50 rounded-b-lg border-t border-blue-100">
                            <p class="text-sm text-gray-700">${Utils.escapeHtml(item.a)}</p>
                        </div>
                    </div>
                `;
            });
            
            faqHTML += '</div></div>';
        });
        
        faqHTML += '</div>';
        
        const faqContainer = document.getElementById('faqContainer');
        if (faqContainer) {
            faqContainer.innerHTML = faqHTML;
        }
    },

    /**
     * 切换FAQ项
     * @param {number} categoryIndex - 分类索引
     * @param {number} itemIndex - 项索引
     */
    toggleFAQItem(categoryIndex, itemIndex) {
        const allItems = document.querySelectorAll('.faq-item');
        
        allItems.forEach((item, index) => {
            const answer = item.querySelector('.faq-answer');
            const chevron = item.querySelector('.faq-chevron');
            
            if (Math.floor(index / 7) === categoryIndex && (index % 7) === itemIndex) {
                answer.classList.toggle('hidden');
                chevron.classList.toggle('rotate-180');
            } else {
                answer.classList.add('hidden');
                chevron.classList.remove('rotate-180');
            }
        });
    },

    /**
     * 初始化设置标签页
     */
    initSettingsTab() {
        this.loadSettings();
    },

    /**
     * 加载设置
     */
    loadSettings() {
        const settings = Utils.Storage.get('appSettings', {
            theme: 'light',
            fontSize: 'medium',
            notifications: true,
            soundEffects: true,
            autoBackup: true
        });
        
        // 加载主题
        this.setTheme(settings.theme);
        
        // 加载表单值
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.checked = radio.value === settings.theme;
        });
        
        document.querySelectorAll('input[name="fontSize"]').forEach(radio => {
            radio.checked = radio.value === settings.fontSize;
        });
        
        document.getElementById('notifications')?.setAttribute('checked', settings.notifications ? 'checked' : '');
        document.getElementById('soundEffects')?.setAttribute('checked', settings.soundEffects ? 'checked' : '');
        document.getElementById('autoBackup')?.setAttribute('checked', settings.autoBackup ? 'checked' : '');
    },

    /**
     * 保存设置
     */
    saveSettings() {
        const settings = {
            theme: document.querySelector('input[name="theme"]:checked')?.value || 'light',
            fontSize: document.querySelector('input[name="fontSize"]:checked')?.value || 'medium',
            notifications: document.getElementById('notifications')?.checked || false,
            soundEffects: document.getElementById('soundEffects')?.checked || false,
            autoBackup: document.getElementById('autoBackup')?.checked || false
        };
        
        Utils.Storage.set('appSettings', settings);
        this.setTheme(settings.theme);
        Utils.showSuccess('设置已保存');
    },

    /**
     * 设置主题
     * @param {string} theme - 主题名称
     */
    setTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    },

    /**
     * 打开设置
     */
    openSettings() {
        this.switchTab('settings');
    },

    /**
     * 打开反馈模态框
     */
    openFeedbackModal() {
        Utils.Modal.open('feedbackModal');
    },

    /**
     * 显示关于信息
     */
    showAbout() {
        const aboutHTML = `
            <div class="space-y-4">
                <h3 class="text-xl font-bold text-center">校园AI助手</h3>
                <p class="text-center text-gray-600">版本 2.0</p>
                <div class="text-sm text-gray-700 space-y-2">
                    <p>一个智能的校园助手，帮助您：</p>
                    <ul class="list-disc list-inside ml-4 space-y-1">
                        <li>查询课程和日程安排</li>
                        <li>获取校园服务和位置信息</li>
                        <li>设置智能提醒</li>
                        <li>管理个人学习计划</li>
                    </ul>
                </div>
                <p class="text-xs text-gray-500 text-center mt-4">© 2024 校园AI助手团队</p>
            </div>
        `;
        
        Utils.Modal.open('customModal', {
            title: '关于我们',
            content: aboutHTML
        });
    },

    /**
     * 导出数据
     */
    exportData() {
        const ask_multiple_choice = {
            title: '导出数据',
            questions: [{
                id: 'exportType',
                prompt: '请选择要导出的数据类型：',
                options: [
                    { id: 'chat', label: '聊天记录' },
                    { id: 'schedule', label: '课程表' },
                    { id: 'settings', label: '所有数据' }
                ]
            }]
        };
        
        // 在实际项目中，这里应该调用 ask_multiple_choice 工具
        // 简化实现，弹出选择对话框
        const exportType = prompt('请输入导出类型 (chat/schedule/all):', 'chat');
        
        switch (exportType) {
            case 'chat':
                const chatHistory = Utils.Storage.get('chatHistory', []);
                if (chatHistory.length === 0) {
                    Utils.showError('没有聊天记录可导出');
                    return;
                }
                let chatText = '=== 校园AI助手 - 聊天记录 ===\n\n';
                chatText += `导出时间: ${new Date().toLocaleString()}\n\n`;
                chatHistory.forEach(msg => {
                    const time = new Date(msg.timestamp).toLocaleString();
                    chatText += `[${time}] ${msg.type === 'user' ? '用户' : 'AI'}:\n${msg.content}\n\n`;
                });
                Utils.Exporter.downloadText(chatText, 'chat-history.txt');
                break;
                
            case 'schedule':
                const schedule = Utils.Storage.get('studentSchedule', { weeklySchedule: [] });
                Utils.Exporter.downloadJSON(schedule, 'schedule.json');
                break;
                
            case 'all':
                const allData = {
                    chatHistory: Utils.Storage.get('chatHistory', []),
                    schedule: Utils.Storage.get('studentSchedule', {}),
                    reminders: Utils.Storage.get('reminders', []),
                    settings: Utils.Storage.get('appSettings', {}),
                    exportTime: new Date().toISOString()
                };
                Utils.Exporter.downloadJSON(allData, 'campus-assistant-backup.json');
                break;
                
            default:
                Utils.showError('无效的导出类型');
        }
        
        Utils.showSuccess('数据导出成功');
    },

    /**
     * 切换侧边栏折叠状态
     */
    toggleSidebar() {
        this.state.isSidebarCollapsed = !this.state.isSidebarCollapsed;
        const sidebar = document.getElementById('sidebar');
        
        sidebar.classList.toggle('w-64', !this.state.isSidebarCollapsed);
        sidebar.classList.toggle('w-16', this.state.isSidebarCollapsed);
        
        // 保存状态
        Utils.Storage.set('sidebarCollapsed', this.state.isSidebarCollapsed);
    },

    /**
     * 切换移动端菜单
     */
    toggleMobileMenu() {
        this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');
        
        if (this.state.isMobileMenuOpen) {
            sidebar.classList.add('fixed', 'inset-0', 'z-50', 'w-64');
            sidebar.classList.remove('hidden', 'md:block');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            this.closeMobileMenu();
        }
    },

    /**
     * 关闭移动端菜单
     */
    closeMobileMenu() {
        this.state.isMobileMenuOpen = false;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');
        
        sidebar.classList.remove('fixed', 'inset-0', 'z-50', 'w-64');
        sidebar.classList.add('hidden', 'md:block');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    },

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        const width = window.innerWidth;
        
        if (width >= 768) {
            // 桌面模式，恢复侧边栏
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('fixed', 'inset-0', 'z-50', 'w-64');
            sidebar.classList.add('md:block');
            document.getElementById('mobileOverlay').classList.add('hidden');
            
            if (this.state.isMobileMenuOpen) {
                this.state.isMobileMenuOpen = false;
            }
        } else {
            // 移动模式，默认隐藏侧边栏
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.add('hidden');
        }
    },

    /**
     * 处理键盘快捷键
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + 数字键切换标签
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3') {
            e.preventDefault();
            const tabs = ['schedule', 'qa', 'settings'];
            this.switchTab(tabs[parseInt(e.key) - 1]);
        }
        
        // Ctrl/Cmd + S 保存设置
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && this.state.currentTab === 'settings') {
            e.preventDefault();
            this.saveSettings();
        }
        
        // Esc 关闭模态框
        if (e.key === 'Escape') {
            Utils.Modal.closeAll();
        }
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// 导出到全局
if (typeof window !== 'undefined') {
    window.SidebarModule = SidebarModule;
}

// 模块导出
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SidebarModule;
}