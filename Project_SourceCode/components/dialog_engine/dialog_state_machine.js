/**
 * ========================================
 * 对话状态机
 * 版本: 1.0
 * 功能：管理多轮对话的状态和上下文
 * ========================================
 */

const DialogStateMachine = {
    // 对话状态
    state: {
        currentIntent: null,
        waitingFor: [], // 等待用户提供的实体
        collectedEntities: {}, // 已收集的实体
        conversationHistory: [],
        turnCount: 0,
        lastResponseTime: null,
        isDialogActive: false,
        pendingAction: null
    },

    // 意图状态定义
    intentStates: {
        'add_homework': {
            required: ['homework_name', 'due_date'],
            optional: ['course_name', 'note'],
            questions: [
                { entity: 'homework_name', question: '请告诉我作业的具体内容是什么？比如是习题、报告还是其他形式？' },
                { entity: 'due_date', question: '请问这个作业的截止日期是什么时候？' },
                { entity: 'course_name', question: '这是哪门课程的作业呢？' },
                { entity: 'note', question: '还有什么需要特别备注的内容吗？' }
            ]
        },
        'query_homework': {
            required: [],
            optional: ['course_name', 'time_range'],
            questions: [
                { entity: 'course_name', question: '想查询哪门课程的作业呢？' },
                { entity: 'time_range', question: '想查询什么时间范围的作业？比如本周、下周？' }
            ]
        },
        'set_reminder': {
            required: ['reminder_time'],
            optional: ['homework_name', 'course_name'],
            questions: [
                { entity: 'reminder_time', question: '请告诉我需要在什么时候提醒你？比如提前1天或具体时间？' },
                { entity: 'homework_name', question: '需要提醒哪项作业呢？' }
            ]
        },
        'ask_schedule': {
            required: [],
            optional: ['time_range', 'course_name'],
            questions: [
                { entity: 'time_range', question: '想查询哪一天的课表？今天还是明天？' }
            ]
        },
        'query_course': {
            required: [],
            optional: ['course_name', 'location'],
            questions: [
                { entity: 'course_name', question: '想查询哪门课程的信息呢？' }
            ]
        }
    },

    /**
     * 开始新对话
     * @param {string} intent - 意图
     * @param {Object} entities - 初始实体
     */
    startDialog(intent, entities = {}) {
        console.log('🎬 [DialogStateMachine] 开始对话:', intent);
        
        const intentConfig = this.intentStates[intent];
        if (!intentConfig) {
            console.warn('⚠️ [DialogStateMachine] 未知的意图:', intent);
            return null;
        }

        // 重置状态
        this.state = {
            currentIntent: intent,
            waitingFor: [],
            collectedEntities: {},
            conversationHistory: [],
            turnCount: 0,
            lastResponseTime: Date.now(),
            isDialogActive: true,
            pendingAction: null
        };

        // 合并初始实体
        Object.assign(this.state.collectedEntities, entities);

        // 确定还需要哪些实体
        this.updateWaitingList();

        return this.state;
    },

    /**
     * 更新等待列表
     */
    updateWaitingList() {
        const intentConfig = this.intentStates[this.state.currentIntent];
        if (!intentConfig) return;

        // 先清空等待列表
        this.state.waitingFor = [];

        // 检查必需实体是否缺失
        const missingRequired = intentConfig.required.filter(
            entity => !this.state.collectedEntities[entity]
        );

        if (missingRequired.length > 0) {
            // 有缺失的必需实体，优先询问
            this.state.waitingFor = missingRequired;
        }
        // 如果所有必需实体都有了，检查可选实体（仅询问一次）
        else if (this.state.turnCount < 4) {
            // 只询问缺失且尚未请求过的可选实体
            const requestedOptional = new Set();
            for (const msg of this.state.conversationHistory) {
                if (msg.type === 'clarification' && msg.waitingFor) {
                    requestedOptional.add(msg.waitingFor);
                }
            }
            
            const missingOptional = intentConfig.optional.filter(
                entity => !this.state.collectedEntities[entity] && !requestedOptional.has(entity)
            );
            
            // 只询问第一个可选实体
            if (missingOptional.length > 0) {
                this.state.waitingFor = [missingOptional[0]];
            }
        }

        console.log('📋 [DialogStateMachine] 等待实体:', this.state.waitingFor);
        console.log('📦 [DialogStateMachine] 已收集:', this.state.collectedEntities);
    },

    /**
     * 处理用户输入
     * @param {string} userInput - 用户输入
     * @param {Object} newEntities - 新提取的实体
     * @returns {Object} 响应
     */
    processInput(userInput, newEntities = {}) {
        if (!this.state.isDialogActive) {
            return {
                shouldContinue: false,
                action: 'end',
                message: '对话已结束'
            };
        }

        this.state.turnCount++;
        
        // 记录对话历史
        this.state.conversationHistory.push({
            role: 'user',
            content: userInput,
            entities: newEntities,
            timestamp: Date.now()
        });

        // 检查是否是否表示"没有"的回答
        const negativeResponses = ['没有', '不需要', '无', '不用', 'nothing', 'no'];
        const isNegativeResponse = negativeResponses.some(resp =>
            userInput.includes(resp) || userInput.trim() === ''
        );
        
        // 合并新实体
        let hasNewEntity = false;
        for (const [key, value] of Object.entries(newEntities)) {
            if (value && !this.state.collectedEntities[key]) {
                this.state.collectedEntities[key] = value;
                hasNewEntity = true;
                console.log(`✅ [DialogStateMachine] 收集到新实体: ${key} = ${value}`);
            }
        }

        // 始终更新等待列表（确保状态正确）
        this.updateWaitingList();

        // 检查是否完成
        if (this.state.waitingFor.length === 0) {
            return this.completeDialog();
        }

        // 检查是否是可选实体的否定回答，如果询问可选实体但用户说没有，直接完成
        const intentConfig = this.intentStates[this.state.currentIntent];
        if (this.state.waitingFor.length > 0 &&
            intentConfig.optional.includes(this.state.waitingFor[0]) &&
            isNegativeResponse) {
            // 移除这个可选实体，继续检查
            const currentWaiting = this.state.waitingFor.shift();
            this.state.waitingFor = [];
            return this.completeDialog();
        }

        // 检查重试次数，如果太多无有效回答，也完成对话
        const consecutiveEmptyInputs = this.state.conversationHistory.filter(
            msg => msg.role === 'user' &&
                   (msg.entities === null || Object.keys(msg.entities).length === 0)
        );
        
        if (consecutiveEmptyInputs.length >= 3) {
            console.log('⚠️ [DialogStateMachine] 多次无效输入，结束对话');
            this.state.waitingFor = [];
            return this.completeDialog();
        }

        // 还需要询问
        return this.askNextQuestion();
    },

    /**
     * 询问下一个问题
     * @returns {Object} 响应
     */
    askNextQuestion() {
        const intentConfig = this.intentStates[this.state.currentIntent];
        const nextEntity = this.state.waitingFor[0];
        
        const questionTemplate = intentConfig.questions.find(
            q => q.entity === nextEntity
        );

        let question = questionTemplate ? questionTemplate.question : '请提供更多信息';

        // 根据上下文添加引导
        if (this.state.turnCount > 1) {
            question = '好的！' + question;
        }

        // 记录AI回复，包括等待的实体
        this.state.conversationHistory.push({
            role: 'assistant',
            content: question,
            type: 'clarification',
            waitingFor: nextEntity,
            timestamp: Date.now()
        });

        return {
            shouldContinue: true,
            action: 'clarify',
            message: question,
            waitingFor: nextEntity,
            progress: this.calculateProgress()
        };
    },

    /**
     * 完成对话
     * @returns {Object} 响应
     */
    completeDialog() {
        console.log('✅ [DialogStateMachine] 对话完成');

        this.state.isDialogActive = false;

        // 生成确认消息
        const confirmation = this.generateConfirmation();

        // 记录AI回复
        this.state.conversationHistory.push({
            role: 'assistant',
            content: confirmation,
            type: 'confirmation',
            entities: this.state.collectedEntities,
            timestamp: Date.now()
        });

        return {
            shouldContinue: false,
            action: 'complete',
            message: confirmation,
            entities: this.state.collectedEntities,
            intent: this.state.currentIntent
        };
    },

    /**
     * 生成确认消息
     * @returns {string} 确认消息
     */
    generateConfirmation() {
        const intent = this.state.currentIntent;
        const entities = this.state.collectedEntities;

        switch (intent) {
            case 'add_homework':
                let msg = '✅ 已记录：';
                if (entities.course_name) {
                    msg += `${entities.course_name} - `;
                }
                msg += entities.homework_name;
                if (entities.due_date) {
                    msg += `，截止时间：${entities.due_date}`;
                }
                if (entities.note) {
                    msg += `\n备注：${entities.note}`;
                }
                msg += '\n\n需要我设置提醒吗？';
                return msg;

            case 'set_reminder':
                return `✅ 提醒已设置：${entities.homework_name || '作业'} - ${entities.reminder_time}`;

            case 'query_homework':
                return `📚 正在查询${entities.course_name || ''}${entities.time_range || ''}的作业...`;

            case 'ask_schedule':
                return `📅 正在查询${entities.time_range || '今天'}的课程安排...`;

            default:
                return '✅ 好的，我已经了解了！';
        }
    },

    /**
     * 计算进度
     * @returns {number} 进度百分比 (0-1)
     */
    calculateProgress() {
        const intentConfig = this.intentStates[this.state.currentIntent];
        if (!intentConfig) return 0;

        const total = intentConfig.required.length;
        const collected = intentConfig.required.filter(
            entity => this.state.collectedEntities[entity]
        ).length;

        return total > 0 ? collected / total : 1;
    },

    /**
     * 中止对话
     */
    abortDialog() {
        console.log('❌ [DialogStateMachine] 对话中止');
        this.state.isDialogActive = false;
        this.state.pendingAction = null;
    },

    /**
     * 重置状态
     */
    reset() {
        this.state = {
            currentIntent: null,
            waitingFor: [],
            collectedEntities: {},
            conversationHistory: [],
            turnCount: 0,
            lastResponseTime: null,
            isDialogActive: false,
            pendingAction: null
        };
    },

    /**
     * 获取当前状态
     * @returns {Object} 当前状态
     */
    getState() {
        return {
            ...this.state,
            progress: this.calculateProgress()
        };
    },

    /**
     * 从历史记录中恢复对话
     * @param {Array} history - 对话历史
     */
    restoreFromHistory(history) {
        if (!history || history.length === 0) return;

        // 重置状态
        this.reset();

        // 恢复历史记录
        this.state.conversationHistory = history;
        this.state.turnCount = history.filter(h => h.role === 'user').length;

        // 从最后一条非确认消息恢复状态
        const lastNonConf = [...history].reverse().find(h => 
            h.role === 'assistant' && h.type === 'clarification'
        );

        if (lastNonConf) {
            // 提取已收集的实体
            history.forEach(h => {
                if (h.entities) {
                    Object.assign(this.state.collectedEntities, h.entities);
                }
            });

            // 重新计算等待列表
            this.updateWaitingList();
            this.state.isDialogActive = true;
        }
    }
};

// 如果在浏览器环境中，导出到全局
if (typeof window !== 'undefined') {
    window.DialogStateMachine = DialogStateMachine;
}