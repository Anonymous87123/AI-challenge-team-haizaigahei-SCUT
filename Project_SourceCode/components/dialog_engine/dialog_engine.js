/**
 * ========================================
 * 智能仿真对话引擎
 * 版本: 2.0 - 增强版
 * 功能：支持意图识别、实体抽取、多轮对话管理的智能对话生成系统
 * ========================================
 */

const DialogEngine = {
    // 状态管理
    state: {
        dialogData: {},
        userProfile: null,
        conversationHistory: [],
        currentContext: null,
        lastTopic: null,
        sessionStartTime: null,
        isInitialized: false,
        // 新增：对话状态机管理
        activeDialogState: null,
        // 新增：支持的多轮对话意图列表
        multiTurnIntents: ['add_homework', 'set_reminder', 'query_homework', 'ask_schedule']
    },

    // 初始化
    async init() {
        this.state.sessionStartTime = Date.now();
        this.loadDialogData();
        this.loadUserProfile();
        this.state.isInitialized = true;
        console.log('🤖 对话引擎初始化完成');
        console.log('📊 已加载的对话数据:', Object.keys(this.state.dialogData));
    },

    /**
     * 加载对话数据 - 使用内嵌数据避免CORS问题
     */
    loadDialogData() {
        try {
            // 基础社交对话
            this.state.dialogData.greetings = window.EMBEDDED_DIALOG_DATA.greetings;

            // 校园生活对话
            this.state.dialogData.study = window.EMBEDDED_DIALOG_DATA.study;

            // 兴趣爱好对话
            this.state.dialogData.entertainment = window.EMBEDDED_DIALOG_DATA.entertainment;

            // 情感支持对话
            this.state.dialogData.emotional = window.EMBEDDED_DIALOG_DATA.emotional;

            // 新增：校园服务对话 - 作业管理
            if (window.EMBEDDED_DIALOG_DATA.homework_management) {
                this.state.dialogData.homework_management = window.EMBEDDED_DIALOG_DATA.homework_management;
                // 为add_homework和query_homework创建专用触发词
                this.state.dialogData.add_homework = {
                    ...window.EMBEDDED_DIALOG_DATA.homework_management,
                    trigger_keywords: ['添加作业', '添加', '记录', '写作业', '做作业', '交作业', '提交', '提交作业', '新作业']
                };
                this.state.dialogData.query_homework = {
                    ...window.EMBEDDED_DIALOG_DATA.homework_management,
                    trigger_keywords: ['查询作业', '查看作业', '作业查询', '有什么作业', '作业列表', '查看作业', '看看作业']
                };
                console.log('✅ 作业管理对话数据加载完成');
            }

            // 新增：校园服务对话 - 课程查询
            if (window.EMBEDDED_DIALOG_DATA.course_query) {
                this.state.dialogData.course_query = window.EMBEDDED_DIALOG_DATA.course_query;
                this.state.dialogData.ask_schedule = {
                    ...window.EMBEDDED_DIALOG_DATA.course_query,
                    trigger_keywords: ['课程', '课表', '上课', '课程表', '时间表', '今天课', '明天课', '本周课', '下周课', '课程安排', '今天有什么课', '明天有什么课', '本周有什么课', '下周有什么课', '今天上什么', '今天有课吗', '明天有课吗']
                };
                this.state.dialogData.query_course = {
                    ...window.EMBEDDED_DIALOG_DATA.course_query,
                    trigger_keywords: ['查询课程', '查看课程', '课程信息', '课程详情', '课程介绍']
                };
                console.log('✅ 课程查询对话数据加载完成');
            }

            // 新增：校园服务对话 - 提醒设置
            if (window.EMBEDDED_DIALOG_DATA.reminder) {
                this.state.dialogData.reminder = window.EMBEDDED_DIALOG_DATA.reminder;
                this.state.dialogData.set_reminder = {
                    ...window.EMBEDDED_DIALOG_DATA.reminder,
                    trigger_keywords: ['提醒', '设置提醒', '添加提醒', '创建提醒', '提前提醒', '提醒我', '别忘了提醒', '时间提醒', '作业提醒', '课程提醒', '闹钟']
                };
                console.log('✅ 提醒设置对话数据加载完成');
            }

            // 新增：校园生活服务 - 为每个意图创建专用trigger_keywords
            if (window.EMBEDDED_DIALOG_DATA.campus_life) {
                this.state.dialogData.campus_life = window.EMBEDDED_DIALOG_DATA.campus_life;
                this.state.dialogData.ask_canteen = {
                    ...window.EMBEDDED_DIALOG_DATA.campus_life,
                    trigger_keywords: ['食堂', '餐厅', '吃饭', '用餐', '菜单', '菜谱', '今天吃什么', '有什么菜', '推荐菜']
                };
                this.state.dialogData.ask_library = {
                    ...window.EMBEDDED_DIALOG_DATA.campus_life,
                    trigger_keywords: ['图书馆', '自习', '座位', '借书']
                };
                this.state.dialogData.ask_shuttle = {
                    ...window.EMBEDDED_DIALOG_DATA.campus_life,
                    trigger_keywords: ['校车', '班车', '交通', '时刻表', '发车']
                };
                this.state.dialogData.ask_express = {
                    ...window.EMBEDDED_DIALOG_DATA.campus_life,
                    trigger_keywords: ['快递', '取件', '菜鸟驿站', '快递站', '包裹', '快递点']
                };
                this.state.dialogData.ask_facility = {
                    ...window.EMBEDDED_DIALOG_DATA.campus_life,
                    trigger_keywords: ['体育馆', '运动', '健身房', '游泳馆', '球场', '场地', '场馆', '开放时间']
                };
                console.log('✅ 校园生活服务对话数据加载完成');
            }

            // 基础社交意图映射
            this.state.dialogData.thanks = window.EMBEDDED_DIALOG_DATA.greetings;
            this.state.dialogData.goodbye = window.EMBEDDED_DIALOG_DATA.greetings;

            console.log('✅ 对话数据加载完成');
            console.log('📊 已加载的对话类型:', Object.keys(this.state.dialogData));
        } catch (error) {
            console.error('❌ 对话数据加载失败:', error);
        }
    },

    /**
     * 加载用户画像 - 使用内嵌数据避免CORS问题
     */
    loadUserProfile() {
        try {
            const profiles = window.EMBEDDED_DIALOG_DATA.profiles;
            
            // 默认使用外向友好型
            this.state.userProfile = profiles.extroverted_friendly;
            
            // 尝试从本地存储获取用户画像
            const savedProfile = Utils.Storage.get('userPersona');
            if (savedProfile && profiles[savedProfile]) {
                this.state.userProfile = profiles[savedProfile];
            }
            
            console.log('✅ 用户画像加载完成:', this.state.userProfile.name);
        } catch (error) {
            console.error('❌ 用户画像加载失败:', error);
            // 使用默认画像
            this.state.userProfile = {
                name: "默认性格",
                personality_tags: ["友好"],
                dialog_style: {
                    greeting_style: "友好",
                    emoji_usage: "适中",
                    response_speed: "快",
                    formality: "随意"
                }
            };
        }
    },

    /**
     * 生成对话响应
     * @param {string} userInput - 用户输入
     * @param {string} contextHint - 上下文提示（可选）
     * @returns {Object} 响应对象
     */
    async generateResponse(userInput, contextHint = null) {
        console.log('🔍 [DialogEngine] 收到输入:', userInput);
        
        const lowerInput = userInput.toLowerCase().trim();
        
        // 验证输入有效性
        const validationResult = this.validateInput(userInput);
        if (!validationResult.isValid) {
            console.log('⚠️ [DialogEngine] 输入验证失败:', validationResult.reason);
            const errorResponse = this.generateErrorResponse(userInput, validationResult);
            this.updateConversationHistory('user', userInput, 'error', 'neutral');
            this.updateConversationHistory('ai', errorResponse.text, 'error', 'neutral');
            return errorResponse;
        }

        // 如果未初始化，先尝试初始化
        if (!this.state.isInitialized) {
            console.log('⚠️ [DialogEngine] 未初始化，开始初始化...');
            await this.init();
        }

        // 如果有活跃的多轮对话状态，优先处理
        if (this.state.activeDialogState && this.state.activeDialogState.isDialogActive) {
            console.log('🔄 [DialogEngine] 继续多轮对话');
            const multiTurnResponse = this.handleMultiTurnDialog(userInput);
            if (multiTurnResponse) {
                this.updateConversationHistory('user', userInput, this.state.activeDialogState.currentIntent, 'neutral');
                this.updateConversationHistory('ai', multiTurnResponse.text, this.state.activeDialogState.currentIntent, multiTurnResponse.emotion);
                return multiTurnResponse;
            }
        }
        
        // 意图识别
        const intent = this.recognizeIntent(lowerInput);
        console.log('🎯 [DialogEngine] 识别意图:', intent);
        
        // 实体抽取
        let entities = {};
        if (typeof EntityExtractor !== 'undefined') {
            entities = EntityExtractor.extract(userInput);
            console.log('🏷️ [DialogEngine] 提取实体:', entities);
        }
        
        // 情感分析
        const emotion = this.analyzeEmotion(lowerInput);
        console.log('😊 [DialogEngine] 情感分析:', emotion);
        
        // 检查是否需要启动多轮对话
        if (this.state.multiTurnIntents.includes(intent)) {
            console.log('💬 [DialogEngine] 启动多轮对话');
            return this.startMultiTurnDialog(intent, entities, userInput, emotion);
        }
        
        // 选择合适的对话场景
        const dialogScene = this.selectDialogScene(intent, emotion, contextHint);
        console.log('📋 [DialogEngine] 对话场景:', dialogScene ? dialogScene.dialog_type : 'null');
        
        // 生成响应
        let response;
        if (dialogScene) {
            response = this.generateDialogResponse(dialogScene, userInput, emotion, entities);
        } else {
            // 降级处理
            console.log('⚠️ [DialogEngine] 未找到匹配场景，使用降级处理');
            response = this.generateFallbackResponse(userInput);
        }
        
        // 更新对话历史
        this.updateConversationHistory('user', userInput, intent, emotion);
        this.updateConversationHistory('ai', response.text, intent, response.emotion);
        
        console.log('✅ [DialogEngine] 生成回复:', response.text);
        
        return {
            text: response.text,
            emotion: response.emotion,
            intent: intent,
            strategy: response.strategy,
            suggestedTopics: response.suggestedTopics || [],
            confidence: response.confidence || 0.8,
            entities: entities
        };
    },

    /**
     * 意图识别
     * @param {string} input - 输入文本
     * @returns {string} 意图类型
     */
    recognizeIntent(input) {
        const lowerInput = input.toLowerCase();
        
        console.log('🔍 [Intent] 检查可用对话数据:', Object.keys(this.state.dialogData));
        
        // 特殊意图快速匹配
        const specialIntents = {
            'thanks': ['谢谢', '感谢', '谢了', '多谢', 'thank', 'thanks', '感谢你'],
            'goodbye': ['再见', '拜拜', 'bye', 'goodbye', '先走了', '回见', '下次见']
        };

        for (const [intent, keywords] of Object.entries(specialIntents)) {
            for (const keyword of keywords) {
                if (lowerInput.includes(keyword)) {
                    console.log(`✅ [Intent] 快速匹配到特殊意图: ${intent}`);
                    return intent;
                }
            }
        }
        
        // 收集所有对话数据中的触发关键词
        const keywordMatches = [];
        
        // 意图优先级配置（数字越小优先级越高）
        const intentPriority = {
            'add_homework': 1,
            'query_homework': 1,
            'ask_schedule': 1,
            'query_course': 2,
            'set_reminder': 1,
            'ask_canteen': 1,
            'ask_library': 1,
            'ask_shuttle': 1,
            'ask_express': 1,
            'ask_facility': 1,
            'homework_management': 3,
            'course_query': 3,
            'reminder': 3,
            'campus_life': 3,
            'study': 4,
            'greetings': 5
        };
        
        for (const [dataType, dialogData] of Object.entries(this.state.dialogData)) {
            if (dialogData && dialogData.trigger_keywords) {
                for (const keyword of dialogData.trigger_keywords) {
                    if (lowerInput.includes(keyword)) {
                        // 专用意图加分（add_*, ask_*等）
                        const isSpecificIntent = dataType.startsWith('add_') ||
                                              dataType.startsWith('query_') ||
                                              dataType.startsWith('ask_') ||
                                              dataType.startsWith('set_');
                        const specificityBonus = isSpecificIntent ? 1.5 : 1.0;
                        
                        // 关键词越长，得分越高
                        const matchScore = (keyword.length / input.length) *
                                         (keyword.length > 1 ? 1.1 : 1.0) *
                                         specificityBonus;
                        
                        // 获取优先级（未定义的优先级默认为10）
                        const priority = intentPriority[dataType] || 10;
                        
                        keywordMatches.push({
                            intent: dataType,
                            keyword: keyword,
                            score: matchScore,
                            priority: priority
                        });
                        console.log(`✅ [Intent] 匹配到关键词: "${keyword}" (${dataType}), score: ${matchScore.toFixed(3)}, priority: ${priority}${isSpecificIntent ? ' [专用意图]' : ''}`);
                    }
                }
            }
        }
        
        // 如果有匹配，先按优先级排序，再按分数排序
        if (keywordMatches.length > 0) {
            keywordMatches.sort((a, b) => {
                // 优先级高的排前面
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                // 优先级相同时，分数高的排前面
                return b.score - a.score;
            });
            console.log('🎯 [Intent] 匹配结果:', keywordMatches[0]);
            return keywordMatches[0].intent;
        }
        
        console.log('⚠️ [Intent] 未找到匹配，使用默认意图: greetings');
        // 默认意图
        return 'greetings';
    },

    /**
     * 情感分析（简化版）
     * @param {string} input - 输入文本
     * @returns {string} 情感类型
     */
    analyzeEmotion(input) {
        const emotionKeywords = {
            positive: ['开心', '高兴', '快乐', '太棒了', '赞', '喜欢', '爱', 'good', 'great', 'happy', 'exciting', '😊', '😄'],
            negative: ['难过', '伤心', '不开心', '郁闷', '烦', '累', 'sad', 'bad', 'tired', '😢', '😭', '😔'],
            anxious: ['担心', '害怕', '紧张', '焦虑', 'worried', 'nervous', '😰', '😨'],
            angry: ['生气', '愤怒', '气死', 'annoyed', 'angry', '😠', '😡'],
            question: ['?', '吗', '什么', '怎么', '如何', 'why', 'how', 'what', '?']
        };
        
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            for (const keyword of keywords) {
                if (input.includes(keyword)) {
                    return emotion;
                }
            }
        }
        
        return 'neutral';
    },

    /**
     * 选择对话场景
     * @param {string} intent - 意图
     * @param {string} emotion - 情感
     * @param {string} contextHint - 上下文提示
     * @returns {Object|null} 对话场景
     */
    selectDialogScene(intent, emotion, contextHint) {
        console.log('🔍 [Scene] Select Scene - intent:', intent, 'emotion:', emotion, 'contextHint:', contextHint);
        
        // 如果有上下文提示，优先使用
        if (contextHint && this.state.dialogData[contextHint]) {
            console.log('✅ [Scene] 使用上下文提示:', contextHint);
            return this.state.dialogData[contextHint];
        }
        
        // 根据意图和情感选择
        if (emotion === 'positive' || emotion === 'negative' || emotion === 'anxious' || emotion === 'angry') {
            if (this.state.dialogData.emotional) {
                console.log('✅ [Scene] 使用情感支持场景');
                return this.state.dialogData.emotional;
            }
        }
        
        // 根据意图选择对话数据
        if (this.state.dialogData[intent]) {
            console.log('✅ [Scene] 使用意图匹配场景:', intent);
            return this.state.dialogData[intent];
        }
        
        console.log('⚠️ [Scene] 未找到匹配场景');
        return null;
    },

    /**
     * 生成对话响应
     * @param {Object} dialogData - 对话数据
     * @param {string} userInput - 用户输入
     * @param {string} emotion - 用户情感
     * @returns {Object} 响应对象
     */
    generateDialogResponse(dialogData, userInput, emotion, entities) {
        console.log('🎨 [DialogEngine] generateDialogResponse - dialogData:', dialogData.dialog_type, 'entities:', entities);
        
        const personality = this.state.userProfile.name;
        let responses = [];
        
        // 优先使用响应生成器（如果可用且包含意图定义）
        if (typeof ResponseGenerator !== 'undefined' && dialogData.intents) {
            const intentKey = Object.keys(dialogData.intents)[0];
            const intentData = dialogData.intents[intentKey];
            
            console.log('🎨 [DialogEngine] 使用意图:', intentKey, '模板:', intentData.response_templates);
            
            if (intentData && intentData.response_templates) {
                const generated = ResponseGenerator.generate(
                    intentKey,
                    entities,
                    this.state.userProfile
                );
                
                console.log('🎨 [DialogEngine] 生成的响应:', generated);
                
                if (generated) {
                    return {
                        text: generated,
                        emotion: emotion === 'neutral' ? '友好' : emotion,
                        strategy: '模板生成',
                        confidence: 0.9
                    };
                }
            }
        }
        
        // 如果有情感分析，优先选择情感相关的回复模板
        if (['positive', 'negative', 'anxious', 'angry'].includes(emotion)) {
            if (dialogData.response_templates) {
                const emotionTemplate = dialogData.response_templates.find(
                    template => template.emotion === emotion || template.scenarios?.includes(emotion)
                );
                if (emotionTemplate) {
                    responses = emotionTemplate.responses;
                }
            }
        }
        
        // 如果没有找到情感匹配，根据个性选择
        if (responses.length === 0 && dialogData.response_templates) {
            const personalityTemplate = dialogData.response_templates.find(
                template => template.personality.includes(personality) ||
                           template.personality === personality
            );
             
            if (personalityTemplate) {
                responses = personalityTemplate.responses;
            } else {
                // 使用第一个模板作为备选
                responses = dialogData.response_templates[0]?.responses || [];
            }
        }
        
        // 从响应池中随机选择一个
        let responseText = responses.length > 0
            ? responses[Math.floor(Math.random() * responses.length)]
            : this.getGenericResponse(dialogData);
        
        // 智能填充占位符
        responseText = this.fillPlaceholders(responseText, emotion, userInput, entities);
        
        // 添加表情符号（根据用户画像的设置）
        responseText = this.addEmojis(responseText);
        
        return {
            text: responseText,
            emotion: this.determineResponseEmotion(emotion),
            strategy: this.getResponseStrategy(dialogData),
            confidence: responses.length > 0 ? 0.85 : 0.5
        };
    },

    /**
     * 填充占位符
     * @param {string} text - 原始文本
     * @param {string} emotion - 情感
     * @param {string} userInput - 用户输入
     * @returns {string} 填充后的文本
     */
    fillPlaceholders(text, emotion, userInput, entities) {
        const hour = new Date().getHours();
        let timeGreeting = '你好';
        
        if (hour < 12) timeGreeting = '早上好';
        else if (hour < 18) timeGreeting = '下午好';
        else timeGreeting = '晚上好';
        
        const replacements = {
            '{time_greeting}': timeGreeting,
            '{subject}': this.extractSubject(userInput),
            '{emotion}': emotion,
            '{user}': '你'
        };
        
        // 添加实体替换
        if (entities) {
            for (const [key, value] of Object.entries(entities)) {
                if (value) {
                    replacements[`{${key}}`] = value;
                }
            }
        }
        
        let result = text;
        for (const [placeholder, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(placeholder, 'g'), value);
        }
        
        return result;
    },

    /**
     * 提取主题
     * @param {string} input - 输入文本
     * @returns {string} 主题
     */
    extractSubject(input) {
        const subjects = ['高数', '英语', '计算机', '数据结构', '编程', '考试', '作业'];
        for (const subject of subjects) {
            if (input.includes(subject)) {
                return subject;
            }
        }
        return '这门课';
    },

    /**
     * 添加表情符号
     * @param {string} text - 文本
     * @returns {string} 添加表情后的文本
     */
    addEmojis(text) {
        const usageLevel = this.state.userProfile?.dialog_style?.emoji_usage || '适中';
        
        if (usageLevel === '频繁' || usageLevel === '非常频繁') {
            return this.addRandomEmoji(text);
        } else if (usageLevel === '适中') {
            return this.addOccasionalEmoji(text);
        }
        
        return text;
    },

    /**
     * 添加随机表情
     */
    addRandomEmoji(text) {
        const emojis = ['😊', '😂', '🤔', '👍', '✨', '😄', '🎉', '💪', '🌟', '🔥'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        return text + randomEmoji;
    },

    /**
     * 偶尔添加表情
     */
    addOccasionalEmoji(text) {
        if (Math.random() > 0.7) {
            const emojis = ['😊', '👍', '✨'];
            return text + emojis[Math.floor(Math.random() * emojis.length)];
        }
        return text;
    },

    /**
     * 分析对话上下文
     * @returns {Object} 上下文分析结果
     */
    analyzeConversationContext() {
        const history = this.state.conversationHistory;
        if (history.length < 2) {
            return {
                currentTopic: '闲聊',
                topicContinuity: 0,
                conversationDepth: 0,
                recentIntent: 'greetings'
            };
        }

        // 获取最近的对话
        const recentMessages = history.slice(-6);
        
        // 分析当前话题
        const currentTopic = this.detectCurrentTopic(recentMessages);
        
        // 计算话题连贯性
        const topicContinuity = this.calculateTopicContinuity(recentMessages);
        
        // 计算对话深度
        const conversationDepth = this.calculateConversationDepth(recentMessages);
        
        // 获取最近的意图
        const recentIntent = recentMessages[recentMessages.length - 1]?.intent || 'unknown';

        return {
            currentTopic,
            topicContinuity,
            conversationDepth,
            recentIntent
        };
    },

    /**
     * 检测当前话题
     * @param {Array} messages - 消息列表
     * @returns {string} 话题
     */
    detectCurrentTopic(messages) {
        const topicKeywords = {
            '学习': ['学习', '考试', '复习', '作业', '课程', '上课', '成绩', '绩点'],
            '生活': ['食堂', '宿舍', '图书馆', '校车', '快递', '天气', '运动'],
            '娱乐': ['游戏', '电影', '音乐', '动漫', '追剧', '唱歌', '跳舞'],
            '情感': ['开心', '难过', '生气', '焦虑', '烦恼', '担心', '害怕'],
            '社交': ['朋友', '同学', '社团', '活动', '聚会', '聊天'],
            '闲聊': ['你好', '在吗', '嗨', 'hello', 'hi']
        };

        const topicCounts = {};
        
        messages.forEach(msg => {
            for (const [topic, keywords] of Object.entries(topicKeywords)) {
                for (const keyword of keywords) {
                    if (msg.content.toLowerCase().includes(keyword)) {
                        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                    }
                }
            }
        });

        // 返回出现次数最多的话题
        let maxCount = 0;
        let currentTopic = '闲聊';
        
        for (const [topic, count] of Object.entries(topicCounts)) {
            if (count > maxCount) {
                maxCount = count;
                currentTopic = topic;
            }
        }
        
        return currentTopic;
    },

    /**
     * 计算话题连贯性
     * @param {Array} messages - 消息列表
     * @returns {number} 连贯性分数 (0-1)
     */
    calculateTopicContinuity(messages) {
        if (messages.length < 2) return 0;
        
        const topics = messages.map(msg => this.detectIndividualTopic(msg.content));
        let continuityScore = 0;
        
        for (let i = 1; i < topics.length; i++) {
            if (topics[i] === topics[i-1]) {
                continuityScore += 1;
            }
        }
        
        return continuityScore / (topics.length - 1);
    },

    /**
     * 检测单个消息的话题
     * @param {string} content - 消息内容
     * @returns {string} 话题
     */
    detectIndividualTopic(content) {
        if (content.match(/学习|考试|复习|作业|课程|上课|成绩|绩点/)) return '学习';
        if (content.match(/食堂|宿舍|图书馆|校车|快递|天气|运动/)) return '生活';
        if (content.match(/游戏|电影|音乐|动漫|追剧|唱歌|跳舞/)) return '娱乐';
        if (content.match(/开心|难过|生气|焦虑|烦恼|担心|害怕/)) return '情感';
        if (content.match(/朋友|同学|社团|活动|聚会|聊天/)) return '社交';
        return '闲聊';
    },

    /**
     * 计算对话深度
     * @param {Array} messages - 消息列表
     * @returns {number} 深度等级 (0-3)
     */
    calculateConversationDepth(messages) {
        const userMessages = messages.filter(msg => msg.role === 'user');
        const avgMessageLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
        
        if (avgMessageLength < 5) return 0; // 简短问候
        if (avgMessageLength < 20) return 1; // 简单交流
        if (avgMessageLength < 50) return 2; // 深入交流
        return 3; // 深度讨论
    },

    /**
     * 生成话题转换建议
     * @param {string} currentTopic - 当前话题
     * @returns {string[]} 建议的话题
     */
    generateTopicSuggestions(currentTopic) {
        const suggestionMap = {
            '学习': ['最近有什么有趣的活动', '周末想去哪里放松一下', '听听音乐吧'],
            '生活': ['最近学习怎么样', '有没有什么好看的电影', '想不想运动一下'],
            '娱乐': ['别玩太久，要注意学习', '最近有没有什么校园新闻', '要不要一起去图书馆'],
            '情感': ['有什么心事可以跟我说', '要不要转换一下心情', '做点喜欢的事情吧'],
            '社交': ['社团活动怎么样', '最近认识了新朋友吗', '班级里有什么趣事'],
            '闲聊': ['最近在忙什么呢', '有什么兴趣爱好吗', '校园生活怎么样']
        };
        
        return suggestionMap[currentTopic] || ['想聊点什么？', '有什么我可以帮助你的吗？'];
    },

    /**
     * 确定响应情感
     */
    determineResponseEmotion(userEmotion) {
        const emotionMap = {
            'positive': '开心',
            'negative': '关心',
            'anxious': '安抚',
            'angry': '平静',
            'neutral': '友好'
        };
        return emotionMap[userEmotion] || '友好';
    },

    /**
     * 获取响应策略
     */
    getResponseStrategy(dialogData) {
        if (dialogData.response_templates && dialogData.response_templates[0]) {
            return dialogData.response_templates[0].response_strategy || '标准回复';
        }
        return '标准回复';
    },

    /**
     * 获取通用响应
     */
    getGenericResponse(dialogData) {
        const genericResponses = [
            '我明白你的意思，能详细说说吗？',
            '这个话题很有意思，我也想了解更多',
            '嗯...让我想想如何回答更好',
            '你说的对，还有其他想聊的吗？'
        ];
        return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    },

    /**
     * 生成降级响应
     */
    generateFallbackResponse(userInput) {
        // 检查是否是多轮对话中的输入
        if (this.state.activeDialogState && this.state.activeDialogState.isDialogActive) {
            return this.generateClarificationResponse(userInput);
        }

        const fallbackResponses = [
            '嗯嗯，我明白你的意思~',
            '这个话题很有意思！能多跟我说说吗？',
            '原来是这样！🤔',
            '我还在学习中，不过这个话题听起来很有趣',
            '哈哈，说得对！'
        ];
        
        return {
            text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
            emotion: '友好',
            strategy: '模糊回复',
            suggestedTopics: ['聊天', '学习', '娱乐'],
            confidence: 0.5
        };
    },

    /**
     * 生成澄清响应
     * @param {string} userInput - 用户输入
     * @returns {Object} 响应对象
     */
    generateClarificationResponse(userInput) {
        const clarificationResponses = [
            '抱歉，我没有完全理解。能换个说法吗？',
            '不好意思，我需要更多信息。请告诉我：',
            '嗯...这个问题有点模糊，你能具体说明一下吗？',
            '我理解得不太准确，能再详细描述一下吗？'
        ];

        // 获取当前等待的实体
        const waitingFor = this.state.activeDialogState?.waitingFor || [];
        
        let clarificationText = clarificationResponses[Math.floor(Math.random() * clarificationResponses.length)];
        
        // 添加具体的询问
        if (waitingFor.length > 0) {
            const entityQuestions = {
                'homework_name': '作业的具体内容是什么（比如：习题、报告、论文等）？',
                'due_date': '这个作业的截止日期是什么时候？',
                'course_name': '这是哪门课程的作业呢？',
                'reminder_time': '想什么时候提醒你（比如：提前1天或具体时间）？',
                'time_range': '想查询什么时间范围的（比如：今天、本周、下周）？',
                'location': '具体是哪个地点（比如：一食堂、图书馆等）？'
            };
            
            const question = entityQuestions[waitingFor[0]];
            if (question) {
                clarificationText += `\n\n${question}`;
            }
        }
        
        // 添加示例帮助
        clarificationText += '\n\n💡 你可以这样跟我说：';
        const examples = this.generateClarificationExamples();
        if (examples.length > 0) {
            clarificationText += examples.slice(0, 2).join('\n- ');
        }

        return {
            text: clarificationText,
            emotion: '友好',
            strategy: '澄清',
            confidence: 0.6,
            suggestedTopics: ['作业', '课程', '提醒']
        };
    },

    /**
     * 生成澄清示例
     * @returns {Array<string>} 示例数组
     */
    generateClarificationExamples() {
        const intent = this.state.activeDialogState?.currentIntent;
        
        const examples = {
            'add_homework': [
                '完成习题册第5章，周五截止',
                '写3000字论文，下周三交',
                '高数作业，明天截止'
            ],
            'set_reminder': [
                '提前1天提醒我',
                '明天上午9点提醒',
                '截止前2小时提醒'
            ],
            'query_homework': [
                '查询我本周的作业',
                '高数作业什么时候截止',
                '这周有什么作业要交'
            ],
            'ask_schedule': [
                '今天有什么课程',
                '明天上午的课表',
                '本周五的安排'
            ]
        };
        
        return examples[intent] || [
            '今天有什么课程',
            '记录一个作业',
            '设置提醒'
        ];
    },

    /**
     * 处理解析错误
     * @param {Error} error - 错误对象
     * @returns {Object} 错误响应
     */
    handleError(error) {
        console.error('❌ [DialogEngine] 发生错误:', error);
        
        const errorResponses = {
            'SyntaxError': '抱歉，输入格式有误。请检查一下你的表达。',
            'TypeError': '抱歉，处理出现了一些问题。请换个说法试试。',
            'ReferenceError': '抱歉，系统出现了一些错误。请刷新页面重试。',
            'default': '抱歉，出现了一些问题。请稍后再试。'
        };
        
        const responseText = errorResponses[error.name] || errorResponses['default'];
        
        return {
            text: responseText,
            emotion: '歉意',
            strategy: '错误处理',
            confidence: 0.3,
            error: error.message
        };
    },

    /**
     * 验证实体有效性
     * @param {Object} entities - 实体对象
     * @param {string} intent - 意图类型
     * @returns {Object} 验证结果
     */
    validateEntities(entities, intent) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };
        
        // 验证时间实体
        if (entities.due_date) {
            const timePatterns = [
                /^\d{4}[-/年]\d{1,2}[-/月]\d{1,2}/,  // 2024-01-01
                /^\d{1,2}[-/月]\d{1,2}[日号]?/,       // 1-1或1月1日
                /^(今天|明天|后天|这[周月]|下[周月])/,  // 相对时间
                /^\d+天后/                               // n天后
            ];
            
            const isValidTime = timePatterns.some(pattern => pattern.test(entities.due_date));
            if (!isValidTime) {
                validation.warnings.push(`时间格式可能不规范：${entities.due_date}，建议使用"今天"、"明天"、"本周五"等格式`);
            }
        }
        
        // 验证课程名称
        if (entities.course_name && entities.course_name.length < 2) {
            validation.warnings.push('课程名称可能不完整，请提供完整的课程名称');
        }
        
        // 验证作业名称
        if (entities.homework_name && entities.homework_name.length < 2) {
            validation.warnings.push('作业描述太短，请提供更详细的内容');
        }
        
        validation.isValid = validation.errors.length === 0;
        
        return validation;
    },

    /**
     * 更新对话历史
     */
    updateConversationHistory(role, content, intent, emotion) {
        this.state.conversationHistory.push({
            role,
            content,
            intent,
            emotion,
            timestamp: Date.now()
        });
        
        // 限制历史长度
        if (this.state.conversationHistory.length > 20) {
            this.state.conversationHistory = this.state.conversationHistory.slice(-20);
        }
    },

    /**
     * 获取对话历史
     */
    getConversationHistory() {
        return this.state.conversationHistory;
    },

    /**
     * 设置用户画像
     */
    setUserProfile(profileId) {
        Utils.Storage.set('userPersona', profileId);
        this.loadUserProfile();
    },

    /**
     * 获取当前用户画像
     */
    getCurrentUserProfile() {
        return this.state.userProfile;
    },

    /**
     * 获取对话统计信息
     */
    getDialogStats() {
        return {
            sessionDuration: Date.now() - this.state.sessionStartTime,
            messageCount: this.state.conversationHistory.length,
            lastIntent: this.state.conversationHistory.length > 0 
                ? this.state.conversationHistory[this.state.conversationHistory.length - 2]?.intent 
                : null,
            userProfile: this.state.userProfile?.name || '未设置'
        };
    },

    /**
     * 辅助方法：获取JSON数据
     */
    async fetchJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch JSON:', path, error);
            return null;
        }
    },

    /**
     * 启动多轮对话
     * @param {string} intent - 意图
     * @param {Object} entities - 实体对象
     * @param {string} userInput - 用户输入
     * @param {string} emotion - 情感
     * @returns {Object} 响应对象
     */
    startMultiTurnDialog(intent, entities, userInput, emotion) {
        if (typeof DialogStateMachine === 'undefined') {
            console.warn('⚠️ [DialogEngine] DialogStateMachine 未加载，使用单轮对话');
            const dialogScene = this.selectDialogScene(intent, emotion, null);
            return this.generateDialogResponse(dialogScene, userInput, emotion, entities);
        }

        // 启动对话状态机
        const dialogState = DialogStateMachine.startDialog(intent, entities);
        
        console.log('🎬 [DialogEngine] 启动多轮对话，waitingFor:', dialogState.waitingFor);
        
        // 检查是否需要询问缺失信息
        if (dialogState.waitingFor && dialogState.waitingFor.length > 0) {
            const question = DialogStateMachine.askNextQuestion();
            
            this.state.activeDialogState = dialogState;
            
            return {
                text: question.message,
                emotion: '询问',
                intent: intent,
                strategy: '多轮对话-询问',
                confidence: 0.9,
                isMultiTurn: true,
                waitingFor: question.waitingFor,
                progress: question.progress,
                entities: entities
            };
        }
        
        // 如果信息完整，直接使用响应生成器
        let responseText = '';
        if (typeof ResponseGenerator !== 'undefined') {
            responseText = ResponseGenerator.generate(intent, dialogState.collectedEntities, this.state.userProfile);
        } else {
            responseText = '好的，已记录你的请求';
        }
        
        this.state.activeDialogState = null;
        
        return {
            text: responseText,
            emotion: '友好',
            intent: intent,
            strategy: '多轮对话-完成',
            confidence: 0.95,
            isMultiTurn: false,
            entities: dialogState.collectedEntities
        };
    },

    /**
     * 处理多轮对话中的用户输入
     * @param {string} userInput - 用户输入
     * @returns {Object|null} 响应对象
     */
    handleMultiTurnDialog(userInput) {
        if (!this.state.activeDialogState || !DialogStateMachine) {
            return null;
        }

        // 提取新实体
        const newEntities = typeof EntityExtractor !== 'undefined'
            ? EntityExtractor.extract(userInput)
            : {};

        // 处理输入
        const response = DialogStateMachine.processInput(userInput, newEntities);
        
        console.log('🔄 [DialogEngine] 多轮对话处理，response:', response);
        
        // 检查是否完成
        if (response.isComplete) {
            // 使用响应生成器生成最终响应
            let finalResponse = '';
            if (typeof ResponseGenerator !== 'undefined') {
                finalResponse = ResponseGenerator.generate(
                    this.state.activeDialogState.currentIntent,
                    response.entities,
                    this.state.userProfile
                );
            } else {
                finalResponse = '好的，已记录你的信息';
            }
            
            this.state.activeDialogState = null;
            
            return {
                text: finalResponse,
                emotion: '友好',
                intent: this.state.activeDialogState?.currentIntent || 'unknown',
                strategy: '多轮对话-完成',
                confidence: 0.95,
                isMultiTurn: false,
                entities: response.entities
            };
        }
        
        // 如果对话完成
        if (!response.shouldContinue) {
            this.state.activeDialogState = null;
            return {
                text: response.message,
                emotion: '友好',
                intent: response.intent,
                strategy: response.action,
                confidence: 0.95,
                isMultiTurn: false,
                entities: response.entities,
                action: response.action
            };
        }
        
        // 继续询问
        return {
            text: response.message,
            emotion: '询问',
            intent: this.state.activeDialogState.currentIntent,
            strategy: '多轮对话-询问',
            confidence: 0.9,
            isMultiTurn: true,
            waitingFor: response.waitingFor,
            progress: response.progress
        };
    },

    /**
     * 验证输入有效性
     * @param {string} userInput - 用户输入
     * @returns {Object} 验证结果
     */
    validateInput(userInput) {
        const trimmed = userInput.trim();
        
        // 空输入检查
        if (!trimmed || trimmed.length === 0) {
            return {
                isValid: false,
                reason: 'empty_input',
                message: ''
            };
        }
        
        // 特殊字符检查
        const specialCharPattern = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]+$/;
        if (specialCharPattern.test(trimmed)) {
            return {
                isValid: false,
                reason: 'special_chars_only',
                message: trimmed
            };
        }
        
        // 无意义输入检查（连续随机字符，可能包含常见标点）
        const randomCharPattern = /^[a-zA-Z;]{8,}$|^[0-9;]{8,}$/;
        if (randomCharPattern.test(trimmed) && !this.containsMeaningfulPatterns(trimmed)) {
            return {
                isValid: false,
                reason: 'random_input',
                message: trimmed
            };
        }
        
        return { isValid: true };
    },

    /**
     * 检查输入是否包含有意义的模式
     * @param {string} text - 输入文本
     * @returns {boolean}
     */
    containsMeaningfulPatterns(text) {
        // 检查是否包含中文字符或英文单词
        const chinesePattern = /[\u4e00-\u9fa5]/;
        const wordPattern = /[a-zA-Z]{3,}/;
        
        return chinesePattern.test(text) || wordPattern.test(text);
    },

    /**
     * 生成错误响应
     * @param {string} userInput - 用户输入
     * @param {Object} validationResult - 验证结果
     * @returns {Object} 错误响应对象
     */
    generateErrorResponse(userInput, validationResult) {
        const errorResponses = {
            'empty_input': {
                text: '抱歉，我没有收到你的输入。请重新输入你想说的话。',
                emotion: '歉意',
                strategy: '错误处理',
                confidence: 0.5,
                suggestedTopics: ['作业', '课程', '提醒']
            },
            'special_chars_only': {
                text: '抱歉，我没有理解你的输入。请用中文或英文告诉我你想做什么？',
                emotion: '歉意',
                strategy: '错误处理',
                confidence: 0.5,
                suggestedTopics: ['添加作业', '查询课程', '设置提醒']
            },
            'random_input': {
                text: '抱歉，我没有理解你的意思。能换个说法吗？\n\n💡 比如：添加一个作业、查询今天的课程、设置提醒等',
                emotion: '歉意',
                strategy: '错误处理',
                confidence: 0.5,
                suggestedTopics: ['作业', '课程', '提醒']
            }
        };
        
        const response = errorResponses[validationResult.reason] || {
            text: '抱歉，我没有完全理解。能换个说法吗？',
            emotion: '歉意',
            strategy: '错误处理',
            confidence: 0.5,
            suggestedTopics: ['聊天', '学习', '娱乐']
        };
        
        console.log(`⚠️ [DialogEngine] 生成错误响应: ${validationResult.reason}`);
        return {
            text: response.text,
            emotion: response.emotion,
            strategy: response.strategy,
            confidence: response.confidence,
            suggestedTopics: response.suggestedTopics,
            error: validationResult.reason
        };
    },

    /**
     * 中止当前的多轮对话
     */
    abortMultiTurnDialog() {
        if (this.state.activeDialogState && typeof DialogStateMachine !== 'undefined') {
            DialogStateMachine.abortDialog();
            this.state.activeDialogState = null;
            console.log('🛑 [DialogEngine] 多轮对话已中止');
        }
    },

    /**
     * 获取当前多轮对话状态
     * @returns {Object|null} 对话状态
     */
    getCurrentDialogState() {
        if (this.state.activeDialogState) {
            return DialogStateMachine ? DialogStateMachine.getState() : null;
        }
        return null;
    }
};

// 导出到全局
window.DialogEngine = DialogEngine;