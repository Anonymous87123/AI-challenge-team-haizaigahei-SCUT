/**
 * ========================================
 * 校园AI助手 - 聊天模块
 * 版本: 2.0 - 模块化重构版
 * 处理聊天逻辑、AI响应生成、消息管理等
 * ========================================
 */

const ChatModule = {
    // 状态变量
    state: {
        messageHistory: [],
        conversationContext: [],
        isLoading: false,
        maxHistoryLength: 50,
        maxContextLength: 10
    },

    /**
     * 初始化聊天模块
     */
    init() {
        this.bindEvents();
        this.loadHistory();
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 60000);
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 输入框事件
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
            messageInput.addEventListener('input', (e) => {
                this.autoResize(e.target);
                this.showSuggestions(e.target.value);
            });
        }

        // 发送按钮
        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        // 快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter 或 Cmd+Enter 发送
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
            // Escape 清空输入
            if (e.key === 'Escape' && document.activeElement === messageInput) {
                messageInput.value = '';
                this.autoResize(messageInput);
                document.getElementById('suggestions').classList.add('hidden');
            }
        });
    },

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    },

    /**
     * 自动调整输入框高度
     * @param {HTMLTextAreaElement} textarea - 文本框元素
     */
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    },

    /**
     * 显示智能建议
     * @param {string} value - 输入值
     */
    showSuggestions(value) {
        const suggestionsDiv = document.getElementById('suggestions');

        if (value.length < 1) {
            suggestionsDiv.classList.add('hidden');
            return;
        }

        const suggestions = this.getSuggestions(value);

        if (suggestions.length > 0) {
            suggestionsDiv.innerHTML = suggestions.map(suggestion => `
                <button onclick="ChatModule.selectSuggestion('${suggestion}')" 
                        class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                    ${Utils.escapeHtml(suggestion)}
                </button>
            `).join('');
            suggestionsDiv.classList.remove('hidden');
        } else {
            suggestionsDiv.classList.add('hidden');
        }
    },

    /**
     * 获取建议
     * @param {string} input - 输入文本
     * @returns {string[]} 建议列表
     */
    getSuggestions(input) {
        const allSuggestions = [
            '今天有什么课程',
            '明天课程安排',
            '本周课程表',
            '食堂今天有什么菜',
            '图书馆什么时候开门',
            '校车几点发车',
            '快递站在哪里',
            '高数作业什么时候交',
            '计算机课的教室在哪',
            '怎么借书',
            '体育馆开放时间',
            '校医院电话多少',
            '哪里可以打印',
            '设置上课提醒',
            '图书馆空位查询'
        ];

        return allSuggestions
            .filter(suggestion => Utils.String.fuzzyMatch(input, suggestion))
            .slice(0, 4);
    },

    /**
     * 选择建议
     * @param {string} suggestion - 选中的建议
     */
    selectSuggestion(suggestion) {
        const input = document.getElementById('messageInput');
        input.value = suggestion;
        document.getElementById('suggestions').classList.add('hidden');
        this.sendMessage();
    },

    /**
     * 发送消息
     */
    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (!message || this.state.isLoading) return;

        // 添加用户消息
        this.addMessage('user', message);
        this.state.conversationContext.push({
            type: 'user',
            content: message,
            timestamp: Date.now()
        });

        // 清空输入框
        input.value = '';
        this.autoResize(input);
        document.getElementById('suggestions').classList.add('hidden');

        // 显示加载状态
        this.showLoadingState();

        // 模拟AI响应
        const responseTime = 800 + Math.random() * 1200;
        setTimeout(() => {
            this.hideLoadingState();
            this.generateAIResponse(message);
        }, responseTime);
    },

    /**
     * 快速回复
     * @param {string} message - 消息内容
     */
    sendQuickMessage(message) {
        const input = document.getElementById('messageInput');
        input.value = message;
        this.sendMessage();
    },

    /**
     * 添加消息到界面
     * @param {string} type - 消息类型: 'user' | 'ai'
     * @param {string} content - 消息内容
     * @param {Object} extraData - 额外数据
     */
    addMessage(type, content, extraData = null) {
        const container = document.getElementById('messageContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-3 slide-in-up ${type === 'user' ? 'justify-end' : ''}`;

        const userSettings = Utils.Storage.get('userSettings', { nickname: '学生用户' });

        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="max-w-xl">
                    <div class="message-bubble user-message">
                        <p>${Utils.escapeHtml(content)}</p>
                        <button onclick="ChatModule.copyMessage('${Utils.escapeHtml(content)}')" 
                                class="absolute top-2 right-2 text-white text-xs opacity-0 hover:opacity-100 transition-opacity copy-btn"
                                title="复制消息">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="text-xs text-gray-500 mt-1 text-right">${Utils.getCurrentTime()}</div>
                </div>
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-white font-bold">${userSettings.nickname.charAt(0)}</span>
                </div>
            `;
        } else {
            let messageContent = '';
            
            if (extraData) {
                messageContent = this.generateSpecialContent(extraData);
            } else {
                if (typeof marked !== 'undefined') {
                    messageContent = `<div class="markdown-content">${marked.parse(content)}</div>`;
                } else {
                    messageContent = `<div class="markdown-content">${Utils.escapeHtml(content).replace(/\n/g, '<br>')}</div>`;
                }
            }
            
            messageDiv.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white"></i>
                </div>
                <div class="max-w-2xl">
                    <div class="message-bubble ai-message relative">
                        ${messageContent}
                        <button onclick="ChatModule.copyMessage(this.parentElement.innerText)"
                                class="absolute top-2 right-2 text-gray-400 text-xs opacity-0 hover:opacity-100 transition-opacity copy-btn"
                                title="复制消息">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${Utils.getCurrentTime()}</div>
                </div>
            `;
        }

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;

        // 保存到历史记录
        this.state.messageHistory.push({
            type,
            content,
            extraData,
            timestamp: Date.now()
        });

        // 限制历史记录长度
        if (this.state.messageHistory.length > this.state.maxHistoryLength) {
            this.state.messageHistory = this.state.messageHistory.slice(-this.state.maxHistoryLength);
        }

        this.saveHistory();
    },

    /**
     * 复制消息
     * @param {string} text - 要复制的文本
     */
    async copyMessage(text) {
        const success = await Utils.copyToClipboard(text);
        if (success) {
            Utils.showSuccess('消息已复制到剪贴板');
        } else {
            Utils.showError('复制失败，请手动复制');
        }
    },

    /**
     * 生成特殊内容
     * @param {Object} extraData - 额外数据
     * @returns {string} HTML内容
     */
    generateSpecialContent(extraData) {
        switch (extraData.type) {
            case 'schedule':
                return this.generateScheduleHTML(extraData.data);
            case 'canteen':
                return this.generateCanteenHTML(extraData.data);
            case 'library':
                return this.generateLibraryHTML(extraData.data);
            case 'shuttle':
                return this.generateShuttleHTML(extraData.data);
            case 'express':
                return this.generateExpressHTML(extraData.data);
            case 'activity':
                return this.generateActivityHTML(extraData.data);
            case 'location':
                return this.generateLocationHTML(extraData.data);
            default:
                if (typeof marked !== 'undefined') {
                    return `<div class="markdown-content">${marked.parse(extraData.content || '')}</div>`;
                }
                return Utils.escapeHtml(extraData.content || '');
        }
    },

    /**
     * 生成课程表HTML
     * @param {Array} courses - 课程列表
     * @returns {string} HTML
     */
    generateScheduleHTML(courses) {
        return `
            <div class="space-y-3">
                <h4 class="font-bold text-lg mb-3">📅 课程安排</h4>
                ${courses.map(course => `
                    <div class="course-card">
                        <div class="flex items-start justify-between relative z-10">
                            <div class="flex-1">
                                <h5 class="font-bold text-lg">${Utils.escapeHtml(course.name)}</h5>
                                <p class="text-sm opacity-90 mt-1">📍 ${Utils.escapeHtml(course.location)}</p>
                                <p class="text-sm opacity-90">⏰ ${Utils.escapeHtml(course.time)}</p>
                                <p class="text-sm opacity-90">👨‍🏫 ${Utils.escapeHtml(course.teacher)}</p>
                            </div>
                            <span class="px-3 py-1 text-xs rounded-full bg-white bg-opacity-20 backdrop-blur">
                                ${Utils.escapeHtml(course.status)}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * 生成食堂HTML
     * @param {Object} canteenData - 食堂数据
     * @returns {string} HTML
     */
    generateCanteenHTML(canteenData) {
        return `
            <div class="space-y-4">
                <h4 class="font-bold text-lg">🍽️ 食堂信息</h4>
                ${Object.entries(canteenData).map(([key, canteen]) => `
                    <div class="info-card">
                        <h5 class="font-bold text-lg mb-2">${Utils.escapeHtml(canteen.name)}</h5>
                        <p class="text-sm opacity-90">📍 ${Utils.escapeHtml(canteen.location)}</p>
                        <p class="text-sm opacity-90">⏰ ${Utils.escapeHtml(canteen.hours)}</p>
                        <div class="mt-3">
                            <p class="text-sm font-semibold mb-2">今日推荐：</p>
                            <div class="flex flex-wrap gap-2">
                                ${canteen.menu.slice(0, 3).map(item => `
                                    <span class="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">${Utils.escapeHtml(item)}</span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * 生成图书馆HTML
     * @param {Object} libraryData - 图书馆数据
     * @returns {string} HTML
     */
    generateLibraryHTML(libraryData) {
        const occupancyRate = ((libraryData.seats.total - libraryData.seats.available) / libraryData.seats.total * 100).toFixed(1);
        
        return `
            <div class="space-y-4">
                <h4 class="font-bold text-lg">📚 图书馆信息</h4>
                <div class="info-card">
                    <h5 class="font-bold text-lg mb-3">${Utils.escapeHtml(libraryData.name)}</h5>
                    <p class="text-sm opacity-90">📍 ${Utils.escapeHtml(libraryData.location)}</p>
                    <p class="text-sm opacity-90">⏰ ${Utils.escapeHtml(libraryData.hours)}</p>
                    
                    <div class="mt-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-semibold">座位使用情况</span>
                            <span class="text-sm">${libraryData.seats.available}/${libraryData.seats.total} 可用</span>
                        </div>
                        <div class="w-full bg-white bg-opacity-20 rounded-full h-2">
                            <div class="bg-white rounded-full h-2" style="width: ${100 - occupancyRate}%"></div>
                        </div>
                        <p class="text-xs opacity-75 mt-1">使用率: ${occupancyRate}%</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 生成AI响应
     * @param {string} userMessage - 用户消息
     */
    generateAIResponse(userMessage) {
        const intent = this.recognizeIntent(userMessage);
        const context = this.understandContext(userMessage, intent);
        
        let response = '';
        let extraData = null;
        
        // 根据上下文生成响应
        switch(context) {
            case 'course':
            case 'course_location':
            case 'course_time':
                response = this.handleCourseQuery(context, userMessage);
                break;
                
            case 'canteen':
            case 'canteen_menu':
                response = this.handleCanteenQuery(context);
                if (typeof campusData !== 'undefined' && campusData.todayMenu) {
                    extraData = { type: 'menu', data: campusData.todayMenu };
                }
                break;
                
            case 'library':
            case 'library_hours':
                response = this.handleLibraryQuery(context);
                break;
                
            case 'shuttle':
            case 'shuttle_schedule':
                response = `## 🚌 校车时刻表详情\n\n${this.generateDetailedSchedule()}`;
                if (typeof campusData !== 'undefined' && campusData.shuttle) {
                    extraData = { type: 'shuttle', data: campusData.shuttle.routes };
                }
                break;
                
            case 'express':
            case 'express_location':
                response = this.handleExpressQuery();
                if (typeof campusData !== 'undefined' && campusData.express) {
                    extraData = { type: 'express', data: campusData.express.points };
                }
                break;
                
            case 'homework':
                response = this.handleHomeworkQuery();
                break;
                
            case 'classroom':
                const classroomInfo = this.handleClassroomQuery();
                response = classroomInfo.text;
                extraData = classroomInfo.extraData;
                break;
                
            case 'borrowing_process':
                response = `## 📖 借书流程\n\n${(typeof campusData !== 'undefined' && campusData.campus_services?.library?.borrowing_process || []).map((step, index) => `${index + 1}. ${step}`).join('\n\n')}\n\n**注意事项**：\n• 请爱护书籍，不得涂画\n• 按期归还，逾期每天罚款0.5元\n• 书籍遗失需照价赔偿`;
                break;
                
            case 'gym_hours':
                response = this.handleGymQuery();
                break;
                
            case 'hospital_phone':
                response = this.handleHospitalQuery();
                break;
                
            case 'print_location':
                response = this.handlePrintQuery();
                break;
                
            case 'reminder':
                response = '我来帮您设置提醒。请问您需要设置什么内容的提醒？\n\n您可以告诉我：\n• 提醒内容（如：上课、会议等）\n• 提醒时间\n\n或者直接说"设置上课提醒"，我会为您设置下一节课的提醒。';
                setTimeout(() => {
                    Utils.Modal.open('reminderModal');
                }, 1000);
                break;
                
            case 'unknown':
                const responses = [
                    '我理解您的问题。作为校园AI助手，我可以帮您查询课程表、校园位置、食堂信息、图书馆空位、校车时刻等。请问需要什么具体帮助？',
                    '感谢您的提问！我可以为您提供全方位的校园信息服务，包括课程安排、地点导航、提醒设置、食堂推荐等功能。您想了解哪个方面？',
                    '我正在不断学习中，目前可以为您提供丰富的校园服务。您可以尝试询问:\n• "今天有什么课"\n• "食堂今天有什么菜"\n• "图书馆空位查询"\n• "设置上课提醒"\n\n有什么需要帮助的吗？'
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
                break;
                
            default:
                response = this.handleDefaultQuery(context);
        }
        
        // 添加AI回复到上下文
        this.state.conversationContext.push({
            type: 'ai',
            content: response,
            timestamp: Date.now()
        });
        
        // 限制上下文长度
        if (this.state.conversationContext.length > this.state.maxContextLength) {
            this.state.conversationContext = this.state.conversationContext.slice(-8);
        }
        
        this.addMessage('ai', response, extraData);
    },

    /**
     * 意图识别
     * @param {string} message - 用户消息
     * @returns {string} 意图类型
     */
    recognizeIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // 意图关键词映射
        const intentKeywords = {
            course: ['课', '课程', '上课', '课程表', 'schedule', 'class'],
            canteen: ['食堂', '吃饭', '餐厅', '美食', '菜单', 'food', '今天有什么菜', '菜'],
            library: ['图书馆', '借书', '学习', '自习', 'library', '开放时间', '开门'],
            shuttle: ['校车', '巴士', '班车', 'shuttle', 'bus', '几点发车', '时刻表'],
            express: ['快递', '包裹', 'express', 'package', '快递站', '取件码'],
            activity: ['活动', '演出', '比赛', 'event', 'activity'],
            reminder: ['提醒', '闹钟', 'reminder', 'alarm'],
            location: ['哪里', '位置', '怎么走', 'location', 'where'],
            time: ['几点', '时间', '什么时候', 'time', 'when'],
            homework: ['作业', '交', '高数', 'homework'],
            classroom: ['教室', '计算机课', '计算机', 'classroom'],
            gym: ['体育馆', '健身', 'gym'],
            hospital: ['校医院', '医生', '看病', '电话'],
            print: ['打印', 'copy', '打印店', '哪里可以打印']
        };
        
        for (const [intent, keywords] of Object.entries(intentKeywords)) {
            for (const keyword of keywords) {
                if (lowerMessage.includes(keyword)) {
                    return intent;
                }
            }
        }
        
        return 'unknown';
    },

    /**
     * 理解上下文
     * @param {string} message - 用户消息
     * @param {string} intent - 意图
     * @returns {string} 上下文类型
     */
    
    understandContext(message, intent) {
        const lastContext = this.state.conversationContext[this.state.conversationContext.length - 2];
        
        if (lastContext && lastContext.type === 'ai') {
            if (intent === 'time' && (lastContext.content.includes('图书馆') || lastContext.content.includes('library'))) {
                return 'library_hours';
            }
            if (intent === 'time' && (lastContext.content.includes('课程') || lastContext.content.includes('course'))) {
                return 'course_time';
            }
            if (intent === 'location' && (lastContext.content.includes('快递') || lastContext.content.includes('express'))) {
                return 'express_location';
            }
        }
        
        // 特定问题直接匹配
        const quickMatches = {
            '今天有什么菜': 'canteen_menu',
            '今日菜单': 'canteen_menu',
            '图书馆什么时候开门': 'library_hours',
            '图书馆开放时间': 'library_hours',
            '校车几点发车': 'shuttle_schedule',
            '快递站在哪里': 'express_location',
            '高数作业什么时候交': 'homework',
            '怎么借书': 'borrowing_process',
            '体育馆开放时间': 'gym_hours',
            '校医院电话多少': 'hospital_phone',
            '哪里可以打印': 'print_location'
        };
        
        for (const [pattern, context] of Object.entries(quickMatches)) {
            if (message.includes(pattern)) {
                return context;
            }
        }
        
        return intent;
    },

    /**
     * 查询处理器方法
     */
    handleCourseQuery(context, message) {
        // 实现课程查询逻辑
        return '根据您的课程表，今天的安排如下：';
    },

    handleCanteenQuery(context) {
        // 实现食堂查询逻辑
        return '校园食堂信息已为您查询';
    },

    handleLibraryQuery(context) {
        if (context === 'library_hours') {
            return `## 📚 图书馆开放时间\n\n**开放时间**：周一至周日 08:00-22:00\n\n**联系方式**：021-12345678\n\n**服务项目**：借阅图书、自习座位、电子阅览、打印复印、学术讲座\n\n**借阅规则**：每人最多借阅10本书，借期30天，可续借2次`;
        }
        return '图书馆实时信息：';
    },

    handleExpressQuery() {
        return `## 📦 快递站位置信息\n\n### 菜鸟驿站\n📍 **位置**：学生宿舍1号楼下\n⏰ **营业时间**：09:00-21:00\n🚚 **支持快递**：中通、圆通、申通、韵达\n\n### 顺丰快递\n📍 **位置**：行政楼东侧\n⏰ **营业时间**：08:30-18:00\n🚚 **支持快递**：顺丰速运\n\n### 京东快递\n📍 **位置**：体育馆南侧\n⏰ **营业时间**：09:00-19:00\n🚚 **支持快递**：京东物流\n\n**取件码提示**：取件码会通过短信发送，请携带校园卡领取。`;
    },

    handleHomeworkQuery() {
        return `## 📝 作业提醒\n\n### ⚠️ 紧急提醒\n\n#### 高等数学
⏰ **截止时间**：本周五 23:59
📋 **作业内容**：完成第三章习题1-15
📊 **状态**：未完成\n\n### 📌 其他作业\n\n#### 计算机科学导论
⏰ **截止时间**：下周三 12:00
📋 **作业内容**：提交期中项目报告
📊 **状态**：进行中\n\n#### 数据结构
⏰ **截止时间**：下周日 18:00
📋 **作业内容**：完成链表实现作业
📊 **状态**：未开始`;
    },

    handleClassroomQuery() {
        return {
            text: `## 🏫 计算机课教室信息\n\n📍 **教室位置**：理科楼 A301\n🏢 **所在楼层**：3楼 理科楼\n⏰ **上课时间**：08:00-09:40\n👨‍🏫 **任课教师**：张教授\n👥 **座位容量**：80人\n🎯 **教学设备**：投影仪、空调、音响\n\n🧭 **导航建议**：建议提前10分钟到达教室，理科楼位于校园南部区域。`,
            extraData: null
        };
    },

    handleGymQuery() {
        return `## 🏟️ 体育馆信息\n\n**开放时间**：周一至周五 06:00-22:00, 周末 08:00-21:00\n\n**设施**：室内篮球场、羽毛球馆、乒乓球室、健身房、瑜伽室、游泳池\n\n**联系电话**：021-87654321\n\n**使用规则**：需穿运动鞋，禁止携带食物入内`;
    },

    handleHospitalQuery() {
        return `## 🏥 校医院信息\n\n**联系电话**：📞 123-4567-8902\n\n**位置**：行政楼北侧\n\n**服务时间**：周一至周日 08:00-21:00, 急诊24小时\n\n**服务项目**：门急诊、体检中心、心理咨询、疫苗接种、药房`;
    },

    handlePrintQuery() {
        return `## 🖨️ 校园打印点\n\n### 图书馆打印室\n📍 **位置**：图书馆一楼西侧\n⏰ **开放时间**：08:00-22:00\n💰 **价格**：A4: 0.3元/页, A3: 0.5元/页\n\n### 学生服务中心\n📍 **位置**：行政楼一楼\n⏰ **开放时间**：09:00-18:00\n💰 **价格**：A4: 0.2元/页, A3: 0.4元/页\n\n### 教学楼自助打印\n📍 **位置**：各教学楼走廊\n⏰ **开放时间**：24小时\n💰 **价格**：A4: 0.25元/页`;
    },

    handleDefaultQuery(context) {
        return '我理解您的问题。作为校园AI助手，我可以帮您查询课程表、校园位置、食堂信息、图书馆空位、校车时刻等。请问需要什么具体帮助？';
    },

    /**
     * 生成详细校车时刻表
     * @returns {string} 时刻表文本
     */
    generateDetailedSchedule() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        let scheduleText = '';
        
        const routes = [
            {
                name: '主校区-东校区',
                schedule: ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'],
                duration: '15分钟'
            },
            {
                name: '主校区-西校区',
                schedule: ['07:15', '07:45', '08:15', '08:45', '09:15', '09:45', '10:15', '10:45', '11:15', '11:45', '12:15', '12:45', '13:15', '13:45', '14:15', '14:45', '15:15', '15:45', '16:15', '16:45', '17:15', '17:45', '18:15', '18:45', '19:15', '19:45', '20:15', '20:45', '21:15'],
                duration: '20分钟'
            }
        ];
        
        routes.forEach(route => {
            const nextBus = route.schedule.find(time => time > currentTime) || route.schedule[0];
            scheduleText += `### ${route.name}\n`;
            scheduleText += `- **车程**：${route.duration}\n`;
            scheduleText += `- **下一班**：${nextBus}\n`;
            scheduleText += `- **主要班次**：${route.schedule.filter((_, index) => index % 4 === 0).slice(0, 6).join(', ')}\n\n`;
        });
        
        scheduleText += `**当前时间**：${currentTime}\n\n`;
        scheduleText += `📢 **提醒**：校车可能因天气、路况等因素延误，请提前候车！`;
        
        return scheduleText;
    },

    /**
     * 显示加载状态
     */
    showLoadingState() {
        this.state.isLoading = true;
        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // 添加加载消息
        const container = document.getElementById('messageContainer');
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingMessage';
        loadingDiv.className = 'flex items-start space-x-3 slide-in-up';
        loadingDiv.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-white"></i>
            </div>
            <div class="message-bubble ai-message">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        container.appendChild(loadingDiv);
        container.scrollTop = container.scrollHeight;
    },

    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        this.state.isLoading = false;
        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        
        // 移除加载消息
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    },

    /**
     * 更新倒计时
     */
    updateCountdown() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        let nextEvent = '';
        let minutesUntil = 0;

        if (currentHour < 8) {
            nextEvent = '第一节课开始';
            minutesUntil = (8 - currentHour) * 60 - currentMinute;
        } else if (currentHour >= 8 && currentHour < 9) {
            nextEvent = '第一节课结束';
            minutesUntil = (9 - currentHour) * 60 - currentMinute + 40;
        } else if (currentHour >= 9 && currentHour < 10) {
            nextEvent = '第二节课开始';
            minutesUntil = (10 - currentHour) * 60 - currentMinute;
        } else if (currentHour >= 10 && currentHour < 12) {
            nextEvent = '午休时间';
            minutesUntil = (12 - currentHour) * 60 - currentMinute;
        } else if (currentHour >= 12 && currentHour < 14) {
            nextEvent = '下午课程开始';
            minutesUntil = (14 - currentHour) * 60 - currentMinute;
        } else if (currentHour >= 14 && currentHour < 18) {
            nextEvent = '晚餐时间';
            minutesUntil = (18 - currentHour) * 60 - currentMinute;
        } else {
            nextEvent = '明天课程开始';
            minutesUntil = (24 - currentHour + 8) * 60 - currentMinute;
        }

        const hours = Math.floor(minutesUntil / 60);
        const minutes = minutesUntil % 60;

        let timeText = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
        document.getElementById('countdownText').textContent = `距离${nextEvent}还有 ${timeText}`;
    },

    /**
     * 保存聊天历史
     */
    saveHistory() {
        Utils.Storage.set('chatHistory', this.state.messageHistory);
    },

    /**
     * 加载聊天历史
     */
    loadHistory() {
        const saved = Utils.Storage.get('chatHistory', []);
        this.state.messageHistory = saved;
    },

    /**
     * 清空聊天历史
     */
    clearHistory() {
        if (confirm('确定要清空所有聊天记录吗？')) {
            this.state.messageHistory = [];
            this.state.conversationContext = [];
            Utils.Storage.remove('chatHistory');
            
            // 保留欢迎消息
            const container = document.getElementById('messageContainer');
            const welcomeMessage = container.firstElementChild;
            container.innerHTML = '';
            if (welcomeMessage) {
                container.appendChild(welcomeMessage);
            }
            
            this.addMessage('ai', '聊天记录已清空。有什么可以帮助您的吗？');
        }
    },

    /**
     * 搜索聊天历史
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的消息列表
     */
    searchHistory(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return this.state.messageHistory.filter(msg => 
            msg.content.toLowerCase().includes(lowerKeyword)
        );
    }
};

// 导出到全局
if (typeof window !== 'undefined') {
    window.ChatModule = ChatModule;
}

// 模块导出
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ChatModule;
}