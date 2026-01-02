/**
 * ========================================
 * 实体抽取模块
 * 版本: 1.0
 * 功能：从用户输入中提取关键实体信息
 * ========================================
 */

const EntityExtractor = {
    /**
     * 抽取所有实体
     * @param {string} text - 用户输入文本
     * @returns {Object} 提取到的实体对象
     */
    extract(text) {
        const entities = {
            homework_name: this.extractHomeworkName(text),
            due_date: this.extractDueDate(text),
            course_name: this.extractCourseName(text),
            note: this.extractNote(text),
            time_range: this.extractTimeRange(text),
            reminder_time: this.extractReminderTime(text),
            location: this.extractLocation(text),
            activity_type: this.extractActivityType(text)
        };
        
        // 智能过滤：如果包含查询动词且时间范围已提取，则清除homework_name
        // 这样"查询我这周的作业"不会提取出"我这周的"作为homework_name
        const queryVerbs = ['查询', '查看', '看看', '有什么', '作业查询', '作业列表', '看看作业'];
        const hasQueryVerb = queryVerbs.some(verb => text.includes(verb));
        
        if (hasQueryVerb && entities.time_range) {
            entities.homework_name = null;
        }
        
        console.log('🏷️ [EntityExtraction] 提取到的实体:', entities);
        return entities;
    },

    /**
     * 提取作业名称
     */
    extractHomeworkName(text) {
        // 动作动词（需要排除）
        const actionVerbs = ['添加', '记一下', '帮我记', '记录', '查询', '查看', '看看', '做', '写', '完成', '提交', '交'];
        
        // 作业类型关键词
        const homeworkTypes = [
            '作业', 'assignment', 'task',
            '报告', 'report', '论文', 'paper',
            '实验', 'experiment', '实验报告',
            '习题', '练习', 'exercise',
            '项目', 'project', '大作业',
            'presentation', '展示', '演讲',
            '编程', '代码', 'code', 'coding',
            '设计', 'design', '课程设计',
            '复习资料', '笔记'
        ];

        // 先尝试匹配更精确的模式：作业内容 + 作业类型
        const patterns = [
            /(?:.*)作业[:：]\s*(.+?)\s*(?:，|。|截止|交|$)/,
            /(?:做|写|完成)(.+?)作业(?:[:：]\s*(.+?))?(?:，|。|截止|交|$)/,
            /(?:添加|记录|记一下)(.+?)作业(?:[:：]\s*(.+?))?(?:，|。|截止|交|$)/,
            /(?:添加|记录|记一下)?(.{1,20})作业/  // 简化模式：提取作业前20个字符
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1].trim()) {
                let content = match[1].trim();
                
                // 移除动作动词
                for (const verb of actionVerbs) {
                    if (content.startsWith(verb)) {
                        content = content.substring(verb.length).trim();
                        break;
                    }
                }
                
                // 移除课程名前缀（如"高数作业"中的"高数"）
                const courseNames = ['高数', '数学', '英语', '计算机', '物理', '化学', '数据结构', 'C++', 'Java', 'Python'];
                for (const course of courseNames) {
                    if (content.startsWith(course)) {
                        content = content.substring(course.length).trim();
                        break;
                    }
                }
                
                // 如果内容为空，返回默认值
                if (content.length === 0) {
                    return '作业';
                }
                
                // 识别作业类型
                let type = '';
                if (content.includes('习题')) {
                    type = ' (习题)';
                    // 提取章节号，如"第三章习题1-10"
                    const chapterMatch = content.match(/第[一二三四五六七八九十\d]+章/);
                    if (chapterMatch) {
                        content = `第${chapterMatch[0].replace(/[第章]/g, '')}章`;
                    }
                } else if (content.includes('实验') || content.includes('实验报告')) {
                    type = ' (实验报告)';
                } else if (content.includes('论文')) {
                    type = ' (论文)';
                } else if (content.includes('项目') || content.includes('project')) {
                    type = ' (项目)';
                } else if (content.includes('presentation') || content.includes('演示') || content.includes('汇报')) {
                    type = ' (演示)';
                }
                
                return content + type;
            }
        }

        // 如果没有匹配到精确模式，检查是否包含作业类型词
        // 优先级：作业 > 论文 > 报告 > 其他
        const typePriority = {
            '作业': 10,
            'assignment': 10,
            'task': 10,
            '论文': 9,
            'paper': 9,
            '报告': 8,
            'report': 8,
            '实验报告': 8,
            'experiment': 8,
            '习题': 7,
            'exercise': 7,
            '项目': 6,
            'project': 6,
            '大作业': 6
        };
        
        // 添加"作文"到优先级列表（低于"作业"）
        typePriority['作文'] = 5;
        typePriority['随笔'] = 5;
        typePriority['日记'] = 5;
        
        // 按优先级排序
        const sortedTypes = [...homeworkTypes].sort((a, b) => {
            const priorityA = typePriority[a] || 0;
            const priorityB = typePriority[b] || 0;
            return priorityB - priorityA; // 降序
        });
        
        let bestMatch = null;
        let bestPriority = -1;
        
        for (const type of sortedTypes) {
            if (text.toLowerCase().includes(type.toLowerCase())) {
                const priority = typePriority[type] || 0;
                
                // 如果只是简单的"作业"、"论文"等词，直接返回
                if (text.trim() === type || text.trim() === type.toLowerCase()) {
                    return type;
                }
                
                // 尝试提取更具体的内容，但要排除动作动词和课程名
                const contentMatch = text.match(new RegExp(`(.{1,30})${type}`, 'i'));
                if (contentMatch && contentMatch[1].trim().length > 0) {
                    let content = contentMatch[1].trim();
                    
                    // 移除动作动词
                    for (const verb of actionVerbs) {
                        if (content.startsWith(verb)) {
                            content = content.substring(verb.length).trim();
                            break;
                        }
                    }
                    
                    // 移除课程名（高数、英语等）
                    const courseNames = ['高数', '数学', '英语', '计算机', '物理', '化学', '数据结构', 'C++', 'Java', 'Python'];
                    for (const course of courseNames) {
                        if (content.startsWith(course)) {
                            content = content.substring(course.length).trim();
                            break;
                        }
                    }
                    
                    // 如果是高优先级的"作业"类型，直接返回
                    if (priority >= 9) {
                        return type;
                    }
                    
                    // 记录最佳匹配
                    if (priority > bestPriority && content.length > 0) {
                        bestMatch = content + type;
                        bestPriority = priority;
                    }
                }
            }
        }
        
        if (bestMatch) {
            return bestMatch;
        }
        
        // 默认返回"作业"
        if (text.includes('作业')) {
            return '作业';
        }

        return null;
    },

    /**
     * 提取截止日期
     */
    extractDueDate(text) {
        // 绝对日期
        const absoluteDatePatterns = [
            /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日号]?/,
            /(\d{1,2})[-/月](\d{1,2})[日号]?/,
            /(今天|今天)/,
            /(明天|明日)/,
            /(后天|第[三二]天)/,
            /(大后天)/,
            /([周星]一|周一)/,
            /([周星]二|周二)/,
            /([周星]三|周三)/,
            /([周星]四|周四)/,
            /([周星]五|周五)/,
            /([周星]六|周六)/,
            /([周星]日|周日)/,
            /(本月|下月)/,
            /(本学期|下学期)/
        ];

        for (const pattern of absoluteDatePatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0];
            }
        }

        // 相对时间
        const relativePatterns = [
            /(\d+)天后/,
            /(\d+)小时后/,
            /(\d+)分钟内/,
            /([这今下]周)([一二三四五六七天日]?)/,
            /([这今下]月)/
        ];

        for (const pattern of relativePatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0];
            }
        }

        return null;
    },

    /**
     * 提取课程名称
     */
    extractCourseName(text) {
        // 常见课程名称映射
        const courseMap = {
            '高数': '高等数学',
            '数学': '高等数学',
            '微积分': '高等数学',
            '大英': '大学英语',
            '英语': '英语',
            'c语言': 'C语言程序设计',
            'c++': 'C++程序设计',
            'java': 'Java程序设计',
            'python': 'Python程序设计',
            'python编程': 'Python程序设计',
            '数据结构': '数据结构与算法',
            '算法': '数据结构与算法',
            '操作系统': '操作系统',
            '网络': '计算机网络',
            '计网': '计算机网络',
            '数据库': '数据库原理',
            '软工': '软件工程',
            '计导': '计算机导论',
            '物理': '大学物理',
            '化学': '大学化学',
            '思修': '思想道德修养与法律基础',
            '马原': '马克思主义基本原理',
            '史纲': '中国近现代史纲要',
            '毛概': '毛泽东思想和中国特色社会主义理论体系概论'
        };

        const lowerText = text.toLowerCase();

        // 首先检查完整匹配
        for (const [key, value] of Object.entries(courseMap)) {
            if (lowerText.includes(key.toLowerCase())) {
                return value;
            }
        }

        // 提取以"课"、"课程"、"教授"等词前后的内容
        const coursePatterns = [
            /([《"']?)([\u4e00-\u9fa5a-zA-Z0-9]{2,20})([课课程教授]|\1)/g,
            /([a-zA-Z]+课程)/g
        ];

        for (const pattern of coursePatterns) {
            const matches = text.match(pattern);
            if (matches) {
                // 取第一个匹配
                const match = matches[0].replace(/[《"']/g, '').replace(/[课程]/g, '');
                if (match.length >= 2) {
                    return match;
                }
            }
        }

        return null;
    },

    /**
     * 提取备注信息
     */
    extractNote(text) {
        // 提取引号中的内容
        const quotedContent = text.match(/[""''「」『』【】](.+?)[""''」』】]/);
        if (quotedContent) {
            return quotedContent[1];
        }

        // 提取逗号、句号后的补充说明
        const notePatterns = [
            /备注[:：](.+)/,
            /说明[:：](.+)/,
            /具体是[:：](.+)/,
            /内容是[:：](.+)/,
            /[\,，]\s*(.{5,50})$/,
            /[\。\!！\？?]\s*(.{5,50})$/
        ];

        for (const pattern of notePatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return null;
    },

    /**
     * 提取时间范围
     */
    extractTimeRange(text) {
        const timeRanges = [
            '本周', '这周', '下周', '上周',
            '本月', '下月', '上月',
            '今天', '明天', '后天',
            '这学期', '下学期',
            '考试周', '考试月',
            '近期', '最近', '未来一周'
        ];

        const lowerText = text.toLowerCase();
        
        for (const range of timeRanges) {
            if (lowerText.includes(range)) {
                return range;
            }
        }

        // 提取日期范围
        const rangePattern = /(\d{1,2})(号|日).{0,10}(\d{1,2})(号|日)/;
        const match = text.match(rangePattern);
        if (match) {
            return `${match[1]}${match[2]}-${match[3]}${match[4]}`;
        }

        return null;
    },

    /**
     * 提取提醒时间
     */
    extractReminderTime(text) {
        const reminderPatterns = [
            /提前(\d+)(天|小时|小时)/,
            /(\d+)(天|小时|分钟)前提醒/,
            /([早晚]上|上午|下午|晚上)(\d{1,2})[:：](\d{2})/,
            /([早晚]上|上午|下午|晚上)(\d{1,2})点/
        ];

        for (const pattern of reminderPatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0];
            }
        }

        return null;
    },

    /**
     * 提取地点信息
     */
    extractLocation(text) {
        const locations = [
            '图书馆', '食堂', '一食堂', '二食堂', '三食堂',
            '教学楼', '理科楼', '文科楼', '工科楼',
            '图书馆自习室', '实验室', '机房',
            '体育馆', '游泳馆', '健身房',
            '宿舍', '公寓', '学生公寓',
            '教室', '教室在哪里', '上课地点',
            '快递站', '快递点', '菜鸟驿站'
        ];

        for (const location of locations) {
            if (text.includes(location)) {
                return location;
            }
        }

        // 提取楼栋编号
        const buildingPattern = /([ABCDEFGHIJ])(栋|楼|座|馆)/;
        const match = text.match(buildingPattern);
        if (match) {
            return match[0];
        }

        return null;
    },

    /**
     * 提取活动类型
     */
    extractActivityType(text) {
        const activities = [
            '课程', '讲座', '宣讲会', '招聘会',
            '社团活动', '学生会', '志愿服务',
            '竞赛', '比赛', '考试', '测验',
            '实验', '实习', '实践',
            '体育活动', '文艺活动', '文化活动',
            '学术活动', '社交活动', '娱乐活动'
        ];

        for (const activity of activities) {
            if (text.includes(activity)) {
                return activity;
            }
        }

        return null;
    },

    /**
     * 验证实体完整性
     * @param {Object} entities - 实体对象
     * @param {string} intent - 意图类型
     * @returns {Object} 完整性检查结果
     */
    validate(entities, intent) {
        const requiredEntities = {
            'add_homework': ['homework_name', 'due_date'],
            'query_homework': [],
            'set_reminder': ['reminder_time'],
            'ask_schedule': [],
            'query_course': []
        };

        const missing = [];
        const optional = [];
        const present = [];

        if (requiredEntities[intent]) {
            for (const entity of requiredEntities[intent]) {
                if (!entities[entity]) {
                    missing.push(entity);
                } else {
                    present.push(entity);
                }
            }
        }

        // 识别可选实体
        const optionalEntities = ['course_name', 'note', 'time_range', 'location'];
        for (const entity of optionalEntities) {
            if (entities[entity]) {
                optional.push(entity);
            }
        }

        return {
            isComplete: missing.length === 0,
            missing: missing,
            present: present,
            optional: optional,
            confidence: present.length / (present.length + missing.length)
        };
    }
};

// 如果在浏览器环境中，导出到全局
if (typeof window !== 'undefined') {
    window.EntityExtractor = EntityExtractor;
}