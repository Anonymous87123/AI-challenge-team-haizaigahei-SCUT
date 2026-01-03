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
    async init() {
        // 先初始化对话引擎
        if (typeof DialogEngine !== 'undefined') {
            await DialogEngine.init();
            console.log('✅ 智能对话引擎已加载');
        }
        
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
            '游泳馆开放时间',
            '健身房开放时间',
            '网球场开放时间',
            '羽毛球场开放时间',
            '篮球场开放时间',
            '所有场馆开放时间',
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
    async generateAIResponse(userMessage) {
        // 优先检查校园服务查询（保持原有功能）
        const serviceIntent = this.checkServiceIntent(userMessage);
        if (serviceIntent) {
            await this.handleServiceQuery(serviceIntent, userMessage);
            return;
        }
        
        // 如果没有匹配到校园服务，使用智能对话引擎
        if (typeof DialogEngine !== 'undefined') {
            try {
                const dialogResponse = await DialogEngine.generateResponse(userMessage);
                
                // 添加AI回复到上下文
                this.state.conversationContext.push({
                    type: 'ai',
                    content: dialogResponse.text,
                    timestamp: Date.now()
                });
                
                // 限制上下文长度
                if (this.state.conversationContext.length > this.state.maxContextLength) {
                    this.state.conversationContext = this.state.conversationContext.slice(-8);
                }
                
                this.addMessage('ai', dialogResponse.text);
                return;
            } catch (error) {
                console.error('对话引擎错误:', error);
                // 降级到原有逻辑
            }
        }
        
        // 降级处理：使用原有的规则系统
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
                
            // 场馆意图处理（直接返回场馆信息）
            case 'gymnasium':
            case 'swimming_pool':
            case 'fitness_center':
            case 'tennis_court':
            case 'badminton_court':
            case 'basketball_court':
            case 'table_tennis':
            case 'yoga_studio':
                response = this.handleVenueQuery(context);
                break;
                
            case 'canteen':
            case 'canteen_menu':
                response = this.handleCanteenQuery(context);
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
                response = this.handleVenueQuery('gymnasium');
                break;
                
            case 'swimming_pool_hours':
                response = this.handleVenueQuery('swimming_pool');
                break;
                
            case 'fitness_center_hours':
                response = this.handleVenueQuery('fitness_center');
                break;
                
            case 'tennis_court_hours':
                response = this.handleVenueQuery('tennis_court');
                break;
                
            case 'badminton_court_hours':
                response = this.handleVenueQuery('badminton_court');
                break;
                
            case 'basketball_court_hours':
                response = this.handleVenueQuery('basketball_court');
                break;
                
            case 'table_tennis_hours':
                response = this.handleVenueQuery('table_tennis');
                break;
                
            case 'yoga_studio_hours':
                response = this.handleVenueQuery('yoga_studio');
                break;
                
            case 'all_venues':
                response = this.handleAllVenuesQuery();
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
     * 检查校园服务意图
     * @param {string} userMessage - 用户消息
     * @returns {string|null} 服务类型
     */
    checkServiceIntent(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        const serviceKeywords = {
            course: ['课', '课程', '上课', '课程表'],
            canteen: ['食堂', '吃饭', '餐厅', '今天有什么菜'],
            library: ['图书馆', '借书', '学习'],
            shuttle: ['校车', '班车', '校车时刻表'],
            express: ['快递', '包裹', '快递站'],
            venue: ['体育馆', '游泳馆', '健身房', '球场'],
            // 注释掉homework相关关键词，让DialogEngine处理作业请求
            // homework: ['作业', '交作业'],  // 移除，使用DialogEngine处理
            classroom: ['教室', '教室在哪'],
            // 注释掉reminder相关关键词，让DialogEngine处理提醒请求
            // reminder: ['提醒', '设置提醒'],  // 移除，使用DialogEngine处理
            hospital: ['校医院', '校医院电话'],
            print: ['打印', '哪里打印']
        };
            
        for (const [service, keywords] of Object.entries(serviceKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return service;
            }
        }
            
        return null;
    },
    
    /**
     * 处理校园服务查询
     * @param {string} service - 服务类型
     * @param {string} userMessage - 用户消息
     */
    async handleServiceQuery(service, userMessage) {
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
                
            case 'gymnasium':
            case 'swimming_pool':
            case 'fitness_center':
            case 'tennis_court':
            case 'badminton_court':
            case 'basketball_court':
            case 'table_tennis':
            case 'yoga_studio':
                response = this.handleVenueQuery(context);
                break;
                
            case 'canteen':
            case 'canteen_menu':
                response = this.handleCanteenQuery(context);
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
                
            // 作业查询 - 移除，使用DialogEngine处理
            // case 'homework':
            //     response = this.handleHomeworkQuery();
            //     break;
            
            case 'classroom':
                const classroomInfo = this.handleClassroomQuery();
                response = classroomInfo.text;
                extraData = classroomInfo.extraData;
                break;
                
            case 'borrowing_process':
                response = `## 📖 借书流程\n\n${(typeof campusData !== 'undefined' && campusData.campus_services?.library?.borrowing_process || []).map((step, index) => `${index + 1}. ${step}`).join('\n\n')}\n\n**注意事项**：\n• 请爱护书籍，不得涂画\n• 按期归还，逾期每天罚款0.5元\n• 书籍遗失需照价赔偿`;
                break;
                
            case 'gym_hours':
                response = this.handleVenueQuery('gymnasium');
                break;
                
            case 'swimming_pool_hours':
                response = this.handleVenueQuery('swimming_pool');
                break;
                
            case 'fitness_center_hours':
                response = this.handleVenueQuery('fitness_center');
                break;
                
            case 'tennis_court_hours':
                response = this.handleVenueQuery('tennis_court');
                break;
                
            case 'badminton_court_hours':
                response = this.handleVenueQuery('badminton_court');
                break;
                
            case 'basketball_court_hours':
                response = this.handleVenueQuery('basketball_court');
                break;
                
            case 'table_tennis_hours':
                response = this.handleVenueQuery('table_tennis');
                break;
                
            case 'yoga_studio_hours':
                response = this.handleVenueQuery('yoga_studio');
                break;
                
            case 'all_venues':
                response = this.handleAllVenuesQuery();
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
        
        // 意图关键词映射 - 按优先级排序，具体关键词在前
        // 优先级：场馆名称 > 开放时间关键词
        const intentKeywords = {
            // 场馆相关（最具体，优先级最高）
            swimming_pool: ['游泳馆', '游泳池', '游泳', 'swimming'],
            fitness_center: ['健身房', '健身中心', 'fitness', '力量训练'],
            tennis_court: ['网球场', '网球', 'tennis'],
            badminton_court: ['羽毛球场', '羽毛球', 'badminton'],
            basketball_court: ['篮球场', '篮球', 'basketball'],
            table_tennis: ['乒乓球', 'table tennis', '乒乓'],
            yoga_studio: ['瑜伽', '瑜伽室', 'yoga'],
            gymnasium: ['体育馆', 'gym'],
            // 其他校园服务
            course: ['课', '课程', '上课', '课程表', 'schedule', 'class'],
            canteen: ['食堂', '吃饭', '餐厅', '美食', '菜单', 'food', '今天有什么菜', '菜'],
            library: ['图书馆', '借书', '学习', '自习', 'library'],
            shuttle: ['校车', '巴士', '班车', 'shuttle', 'bus', '几点发车', '时刻表'],
            express: ['快递', '包裹', 'express', 'package', '快递站', '取件码'],
            activity: ['活动', '演出', '比赛', 'event', 'activity'],
            // homework: ['作业', '交', '高数', 'homework'],  // 移除，使用DialogEngine处理作业请求
            classroom: ['教室', '计算机课', '计算机', 'classroom'],
            hospital: ['校医院', '医生', '看病', '电话'],
            print: ['打印', 'copy', '打印店', '哪里可以打印'],
            // 通用关键词（优先级最低）
            gym: ['健身', '运动', '体育'],
            reminder: ['提醒', '闹钟', 'reminder', 'alarm'],
            location: ['哪里', '位置', '怎么走', 'location', 'where'],
            time: ['几点', '时间', '什么时候', 'time', 'when'],
            venue: ['场馆', '运动场地', '体育场地', '所有场馆', '全部场馆'],
            // 开放时间相关 - 单独处理，不放在任何具体意图中
            hours: ['开放时间', '开门', '几点开门', '什么时候开门']
        };
        
        // 找出所有匹配的意图和最长关键词
        const matchedIntents = [];
        
        for (const [intent, keywords] of Object.entries(intentKeywords)) {
            let maxKeywordLength = 0;
            let matchedKeyword = '';
            
            for (const keyword of keywords) {
                if (lowerMessage.includes(keyword) && keyword.length > maxKeywordLength) {
                    maxKeywordLength = keyword.length;
                    matchedKeyword = keyword;
                }
            }
            
            if (maxKeywordLength > 0) {
                matchedIntents.push({
                    intent,
                    keywordLength: maxKeywordLength,
                    keyword: matchedKeyword
                });
            }
        }
        
        // 如果没有匹配到任何意图
        if (matchedIntents.length === 0) {
            return 'unknown';
        }
        
        // 返回最长关键词匹配的意图（更精确的匹配）
        matchedIntents.sort((a, b) => b.keywordLength - a.keywordLength);
        return matchedIntents[0].intent;
    },

    /**
     * 理解上下文
     * @param {string} message - 用户消息
     * @param {string} intent - 意图
     * @returns {string} 上下文类型
     */
    
    understandContext(message, intent) {
        const lowerMessage = message.toLowerCase();
        
        // 检查是否包含"开放时间"、"开门"等关键词
        const hasHoursKeyword = ['开放时间', '开门', '几点开门', '什么时候开门'].some(keyword =>
            lowerMessage.includes(keyword)
        );
        
        // 如果意图是场馆相关，且包含开放时间关键词，返回场馆开放时间上下文
        if (hasHoursKeyword) {
            const hoursContextMap = {
                'library': 'library_hours',
                'gymnasium': 'gym_hours',
                'swimming_pool': 'swimming_pool_hours',
                'fitness_center': 'fitness_center_hours',
                'tennis_court': 'tennis_court_hours',
                'badminton_court': 'badminton_court_hours',
                'basketball_court': 'basketball_court_hours',
                'table_tennis': 'table_tennis_hours',
                'yoga_studio': 'yoga_studio_hours',
                'venue': 'all_venues',
                'gym': 'gym_hours'  // 映射旧的gym意图
            };
            
            if (hoursContextMap[intent]) {
                return hoursContextMap[intent];
            }
        }
        
        // 检查是否包含电话查询
        if (lowerMessage.includes('电话') || lowerMessage.includes('联系方式')) {
            const phoneContextMap = {
                'hospital': 'hospital_phone'
            };
            if (phoneContextMap[intent]) {
                return phoneContextMap[intent];
            }
        }
        
        // 检查是否包含位置查询
        if (['哪里', '位置', '怎么走', 'where'].some(keyword => lowerMessage.includes(keyword))) {
            const locationContextMap = {
                'express': 'express_location',
                'classroom': 'classroom',
                'print': 'print_location'
            };
            if (locationContextMap[intent]) {
                return locationContextMap[intent];
            }
        }
        
        // 上下文理解 - 基于对话历史
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
        
        // 特定问题精确匹配（最后手段）
        const quickMatches = [
            // '高数作业什么时候交',  // 移除，使用DialogEngine处理作业查询
            '今天有什么菜',
            '今日菜单',
            '校车几点发车',
            '怎么借书',
            '校医院电话多少',
            '计算机课的教室在哪',
            '有哪些运动场地',
            '运动场地开放时间'
        ];
        
        const contextMap = {
            // '高数作业什么时候交': 'homework',  // 移除，使用DialogEngine处理作业查询
            '今天有什么菜': 'canteen_menu',
            '今日菜单': 'canteen_menu',
            '校车几点发车': 'shuttle_schedule',
            '怎么借书': 'borrowing_process',
            '校医院电话多少': 'hospital_phone',
            '计算机课的教室在哪': 'classroom',
            '有哪些运动场地': 'all_venues',
            '运动场地开放时间': 'all_venues'
        };
        
        for (const pattern of quickMatches) {
            if (message === pattern || message.includes(pattern)) {
                return contextMap[pattern];
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
        return `## 🍽️ 今日食堂菜单\n\n### 第一食堂\n#### 🌅 早餐\n- 鲜肉包子 - ¥2.0\n- 豆浆 - ¥1.5\n- 油条 - ¥1.0\n\n#### ☀️ 午餐推荐\n- 红烧肉 - ¥12.0 ⭐推荐\n- 宫保鸡丁 - ¥10.0\n- 麻婆豆腐 - ¥8.0\n\n### 第二食堂\n#### ☀️ 午餐特色\n- 麻辣香锅 - ¥15.0 🌶️\n- 铁板烧 - ¥18.0\n- 日式拉面 - ¥16.0\n\n### 第三食堂\n#### ☀️ 精品套餐\n- 粤菜套餐 - ¥20.0\n- 川菜套餐 - ¥18.0\n- 东北水饺 - ¥15.0\n\n💡 **温馨提示**：菜品可能因季节调整，具体以食堂供应为准。建议错峰就餐，避开11:30-12:30高峰期。`;
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
        return this.handleVenueQuery('gymnasium');
    },
    
    /**
     * 处理场馆查询（通用方法）
     * @param {string} venueId - 场馆ID
     * @returns {string} 场馆信息
     */
    handleVenueQuery(venueId) {
        let venueData = null;
        
        // 优先从faqData获取数据
        if (typeof faqData !== 'undefined' && faqData.campus_services?.venues?.[venueId]) {
            venueData = faqData.campus_services.venues[venueId];
        }
        
        if (!venueData) {
            return '抱歉，暂无该场馆的详细信息。';
        }
        
        const venue = {
            gymnasium: { icon: '🏟️', title: '体育馆' },
            swimming_pool: { icon: '🏊', title: '游泳馆' },
            fitness_center: { icon: '💪', title: '健身房' },
            tennis_court: { icon: '🎾', title: '网球场' },
            badminton_court: { icon: '🏸', title: '羽毛球场' },
            basketball_court: { icon: '🏀', title: '篮球场' },
            table_tennis: { icon: '🏓', title: '乒乓球室' },
            yoga_studio: { icon: '🧘', title: '瑜伽室' }
        };
        
        const info = venue[venueId] || { icon: '🏟️', title: venueData.name };
        
        let response = `## ${info.icon} ${info.title}\n\n`;
        response += `📍 **位置**：${venueData.location}\n`;
        response += `⏰ **开放时间**：${venueData.hours}\n`;
        response += `📞 **联系电话**：${venueData.contact}\n\n`;
        
        if (venueData.facilities) {
            response += `**设施**：\n${venueData.facilities.map(f => `• ${f}`).join('\n')}\n\n`;
        }
        
        if (venueData.equipment) {
            response += `**设备**：\n${venueData.equipment.map(e => `• ${e}`).join('\n')}\n\n`;
        }
        
        if (venueData.pool_types) {
            response += `**泳池类型**：\n${venueData.pool_types.map(p => `• ${p}`).join('\n')}\n\n`;
        }
        
        if (venueData.court_count) {
            response += `**场地数量**：${venueData.court_count}个\n\n`;
        }
        
        if (venueData.class_types) {
            response += `**课程类型**：\n${venueData.class_types.map(c => `• ${c}`).join('\n')}\n\n`;
        }
        
        if (venueData.price) {
            response += `💰 **收费标准**：${venueData.price}\n\n`;
        }
        
        if (venueData.rules) {
            response += `⚠️ **使用规则**：${venueData.rules}\n\n`;
        }
        
        if (venueData.reservation) {
            response += `📝 **预约信息**：${venueData.reservation}\n\n`;
        }
        
        if (venueData.equipment_rental) {
            response += `🎾 **器材租赁**：${venueData.equipment_rental}\n\n`;
        }
        
        if (venueData.classes) {
            response += `📚 **开设课程**：\n${venueData.classes.map(c => `• ${c}`).join('\n')}\n\n`;
        }
        
        return response;
    },
    
    /**
     * 处理所有场馆查询
     * @returns {string} 所有场馆信息
     */
    handleAllVenuesQuery() {
        let venues = [];
        
        if (typeof faqData !== 'undefined' && faqData.campus_services?.venues) {
            venues = Object.entries(faqData.campus_services.venues);
        }
        
        if (venues.length === 0) {
            return '抱歉，暂无场馆信息。';
        }
        
        const venueIcons = {
            gymnasium: '🏟️',
            swimming_pool: '🏊',
            fitness_center: '💪',
            tennis_court: '🎾',
            badminton_court: '🏸',
            basketball_court: '🏀',
            table_tennis: '🏓',
            yoga_studio: '🧘'
        };
        
        let response = `## 🏟️ 校园体育场馆一览\n\n`;
        response += `我校共设有 **${venues.length}** 个体育场馆，为您提供多样化的运动选择：\n\n`;
        
        venues.forEach(([venueId, venue]) => {
            const icon = venueIcons[venueId] || '🏟️';
            response += `### ${icon} ${venue.name}\n`;
            response += `📍 **位置**：${venue.location}\n`;
            response += `⏰ **开放时间**：${venue.hours}\n`;
            response += `📞 **联系电话**：${venue.contact}\n`;
            
            if (venue.court_count) {
                response += `🎯 **场地数量**：${venue.court_count}个\n`;
            }
            
            if (venue.price) {
                response += `💰 **收费标准**：${venue.price}\n`;
            }
            
            if (venue.reservation) {
                response += `📝 **预约信息**：${venue.reservation}\n`;
            }
            
            response += `\n`;
        });
        
        response += `---\n\n`;
        response += `💡 **温馨提示**：\n`;
        response += `• 部分场馆需要提前预约，请拨打相应电话咨询\n`;
        response += `• 使用场馆时请遵守相关规定，爱护设施\n`;
        response += `• 如需了解具体场馆详情，可单独询问，如"游泳馆开放时间"\n`;
        response += `• 运动前请做好热身，注意安全`;
        
        return response;
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
            <div class="message-bubble ai-message relative">
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