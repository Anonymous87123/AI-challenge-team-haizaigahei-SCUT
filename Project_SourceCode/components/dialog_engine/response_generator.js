/**
 * ========================================
 * 响应生成器
 * 版本: 1.0
 * 功能：根据意图、实体和用户画像生成响应
 * ========================================
 */

const ResponseGenerator = {
    /**
     * 生成响应
     * @param {string} intent - 意图
     * @param {Object} entities - 实体对象
     * @param {Object} userProfile - 用户画像
     * @returns {string} 生成的响应文本
     */
    generate(intent, entities, userProfile) {
        const templates = this.getTemplates(intent);
        const template = this.selectTemplate(templates, userProfile);
        
        let response = this.fillTemplate(template, entities);
        
        // 添加情感和表情
        response = this.addEmotion(response, userProfile);
        
        // 添加个性化建议
        response = this.addSuggestions(response, intent, entities, userProfile);
        
        return response;
    },

    /**
     * 获取意图对应的模板
     * @param {string} intent - 意图
     * @returns {Array} 模板数组
     */
    getTemplates(intent) {
        const templates = {
            'add_homework': [
                '好的，我来帮你记录{course_name}作业。{homework_name}截止日期是{due_date}，需要我设置提醒吗？',
                '收到！{course_name}作业已保存：{homework_name}，截止时间：{due_date}',
                '✅ 已记录：{course_name} - {homework_name}，截止时间：{due_date}{note_suffix}',
                '好的，已为你添加{course_name}作业：{homework_name}，需要在{due_date}前完成哦',
                '了解！{homework_name}截止日期是{due_date}，我已经记下来了~'
            ],
            'query_homework': [
                '正在查询{time_range}{course_name}的作业...',
                '让我看看{time_range}{course_name}有什么作业要交...',
                '📚 查询中：{course_name}{time_range}的作业安排',
                'OK，我来帮你查查{time_range}{course_name}的作业情况'
            ],
            'set_reminder': [
                '好的，已设置提醒：{homework_name}将在{reminder_time}提醒你',
                '✅ 提醒已设置！{homework_name} - {reminder_time}',
                '没问题，我会提前{reminder_time}提醒你{homework_name}的截止',
                '好的，{homework_name}的提醒时间已设置为{reminder_time}'
            ],
            'ask_schedule': [
                '正在查询{time_range}的课程安排...',
                '📅 让我看看{time_range}有什么课...',
                '好的，查询{time_range}的课表...',
                '查询中...{time_range}的课程安排'
            ],
            'query_course': [
                '正在查询{course_name}的信息...',
                '让我查找{course_name}的相关信息...',
                '🔍 正在搜索{course_name}...'
            ],
            'greeting': [
                '{time_greeting}！很高兴见到你~',
                '嗨！{time_greeting}！有什么我可以帮助的吗？',
                '{time_greeting}！今天心情怎么样？',
                '你好呀~ {time_greeting}！有什么新鲜事吗？'
            ],
            'thanks': [
                '不客气！还有什么需要帮助的吗？',
                '没问题~ 随时为你效劳！',
                '不用谢！加油哦！',
                '乐意之极！有其他问题随时问我~'
            ],
            'goodbye': [
                '再见！下次见~',
                '拜拜！祝你有美好的一天！',
                '再见！记得按时完成作业哦~',
                '好的，再见！有需要随时找我~'
            ]
        };

        return templates[intent] || ['好的，我明白了'];
    },

    /**
     * 选择合适的模板
     * @param {Array} templates - 模板数组
     * @param {Object} userProfile - 用户画像
     * @returns {string} 选中的模板
     */
    selectTemplate(templates, userProfile) {
        if (!templates || templates.length === 0) {
            return '好的，我明白了';
        }

        // 根据用户画像选择模板风格
        const personality = userProfile?.personality_tags?.[0] || '友好';
        
        // 简单的选择逻辑：根据性格随机选择
        let index = Math.floor(Math.random() * templates.length);
        
        // 性格类型对应的索引偏好
        const personalityIndex = {
            '外向': Math.floor(Math.random() * templates.length),
            '内向': 0, // 偏向第一个（更礼貌）
            '理性': templates.length - 1, // 偏向最后一个（更简洁）
            '幽默': Math.floor(Math.random() * templates.length),
            '学霸': 0 // 偏向第一个（更认真）
        };

        if (personalityIndex[personality] !== undefined) {
            index = personalityIndex[personality];
        }

        return templates[index];
    },

    /**
     * 填充模板
     * @param {string} template - 模板
     * @param {Object} entities - 实体对象
     * @returns {string} 填充后的文本
     */
    fillTemplate(template, entities) {
        let filled = template;

        console.log('🎨 [ResponseGenerator] fillTemplate - entities:', entities);

        // 替换所有实体占位符
        for (const [key, value] of Object.entries(entities)) {
            const placeholder = `{${key}}`;
            if (filled.includes(placeholder)) {
                const replacement = value || '';
                filled = filled.replace(new RegExp(placeholder, 'g'), replacement);
                console.log(`🎨 [ResponseGenerator] 替换 ${placeholder} -> "${replacement}"`);
            }
        }

        // 特殊处理：note_suffix
        if (entities.note) {
            filled = filled.replace('{note_suffix}', `\n备注：${entities.note}`);
        } else {
            filled = filled.replace('{note_suffix}', '');
        }

        // 获取时间问候
        filled = filled.replace('{time_greeting}', this.getTimeGreeting());

        console.log('🎨 [ResponseGenerator] 填充后的响应:', filled);

        return filled;
    },

    /**
     * 添加情感和表情
     * @param {string} response - 响应文本
     * @param {Object} userProfile - 用户画像
     * @returns {string} 添加表情后的文本
     */
    addEmotion(response, userProfile) {
        const emojiUsage = userProfile?.dialog_style?.emoji_usage || '适中';
        
        if (emojiUsage === '少量') {
            return response;
        }

        const emojis = {
            '友好': ['✨', '👋', '💪', '😊', '🌟'],
            '幽默': ['😄', '🎉', '😂', '🤔', '😎'],
            '理性': ['📝', '✓', '→'],
            '热情': ['🔥', '💥', '⭐', '🚀', '💫']
        };

        const personality = userProfile?.personality_tags?.[0] || '友好';
        const emojiList = emojis[personality] || emojis['友好'];

        // 根据表情使用量添加表情
        if (emojiUsage === '丰富') {
            // 在句子末尾添加表情
            const sentences = response.split(/[。！？.!?]/);
            const decorated = sentences.map((s, i) => {
                if (s.trim() && i < sentences.length - 1) {
                    const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                    return s + randomEmoji;
                }
                return s;
            });
            return decorated.join('');
        } else if (emojiUsage === '适中') {
            // 只在最后一个句子添加
            const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            return response.replace(/[。！？.!?]\s*$/, ` ${randomEmoji}`);
        }

        return response;
    },

    /**
     * 添加个性化建议
     * @param {string} response - 响应文本
     * @param {string} intent - 意图
     * @param {Object} entities - 实体对象
     * @param {Object} userProfile - 用户画像
     * @returns {string} 带建议的响应
     */
    addSuggestions(response, intent, entities, userProfile) {
        const suggestions = this.getSuggestions(intent, entities, userProfile);
        
        if (suggestions.length > 0) {
            const suggestionText = '\n\n💡 ' + suggestions.join('\n💡 ');
            return response + suggestionText;
        }

        return response;
    },

    /**
     * 获取建议列表
     * @param {string} intent - 意图
     * @param {Object} entities - 实体对象
     * @param {Object} userProfile - 用户画像
     * @returns {Array} 建议数组
     */
    getSuggestions(intent, entities, userProfile) {
        const suggestions = [];

        switch (intent) {
            case 'add_homework':
                if (!entities.note) {
                    suggestions.push('建议添加一些备注信息，比如作业的具体要求');
                }
                if (!entities.course_name) {
                    suggestions.push('补充课程名称可以更好地管理作业');
                }
                suggestions.push('可以设置提醒，避免错过截止日期');
                break;

            case 'query_homework':
                suggestions.push('可以按时间范围或课程名称筛选查询');
                break;

            case 'set_reminder':
                suggestions.push('建议设置多个提醒时间，确保不会忘记');
                break;

            case 'ask_schedule':
                suggestions.push('可以查看完整的周课表，了解本周安排');
                break;

            default:
                break;
        }

        // 限制建议数量
        return suggestions.slice(0, 2);
    },

    /**
     * 获取时间问候
     * @returns {string} 时间问候语
     */
    getTimeGreeting() {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            return '早上好';
        } else if (hour >= 12 && hour < 18) {
            return '下午好';
        } else if (hour >= 18 && hour < 22) {
            return '晚上好';
        } else {
            return '夜深了';
        }
    },

    /**
     * 生成澄清问题
     * @param {string} entity - 缺失的实体
     * @param {Object} context - 上下文信息
     * @returns {string} 澄清问题
     */
    generateClarification(entity, context = {}) {
        const questions = {
            'homework_name': '请问作业的具体内容是什么？比如是习题、报告还是其他形式？',
            'due_date': '请问这个作业的截止日期是什么时候？',
            'course_name': '请问是哪门课程的作业呢？',
            'reminder_time': '需要在什么时候提醒你？比如提前1天或具体时间？',
            'time_range': '想查询什么时间范围的？比如本周、下周？',
            'note': '还有什么需要特别备注的内容吗？'
        };

        let question = questions[entity] || '请提供更多信息';
        
        // 添加上下文引导
        if (context.previousResponse) {
            question = '好的！' + question;
        }

        return question;
    },

    /**
     * 生成错误响应
     * @param {string} errorType - 错误类型
     * @returns {string} 错误响应
     */
    generateError(errorType) {
        const errors = {
            'unknown_intent': '抱歉，我没有完全理解你的意思。你能换个说法吗？',
            'missing_entity': '抱歉，信息不够完整。请提供更多详细信息。',
            'invalid_format': '抱歉，格式可能不对。请检查一下输入。',
            'timeout': '响应超时，请重试。',
            'general': '抱歉，出了一点小问题。请再试一次。'
        };

        return errors[errorType] || errors['general'];
    }
};

// 如果在浏览器环境中，导出到全局
if (typeof window !== 'undefined') {
    window.ResponseGenerator = ResponseGenerator;
}