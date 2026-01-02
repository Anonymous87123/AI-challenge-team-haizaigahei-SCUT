/**
 * ========================================
 * 用户画像选择器
 * 版本: 1.0
 * 功能：提供用户画像选择和切换界面
 * ========================================
 */

const PersonalitySelector = {
    // 用户画像定义
    profiles: [
        {
            id: 'extroverted_friendly',
            name: '外向友好型',
            emoji: '😊',
            description: '热情开朗，喜欢主动交流，善于倾听，表达丰富',
            tags: ['外向', '友好', '热情', '善解人意'],
            color: 'from-pink-500 to-rose-500'
        },
        {
            id: 'introverted_gentle',
            name: '内向温和型',
            emoji: '📚',
            description: '温和安静，细心体贴，喜欢深度交流',
            tags: ['内向', '温和', '细心', '安静'],
            color: 'from-green-500 to-emerald-500'
        },
        {
            id: 'rational_steady',
            name: '理性沉稳型',
            emoji: '💻',
            description: '理性冷静，逻辑清晰，可靠稳重',
            tags: ['理性', '沉稳', '逻辑性强', '可靠'],
            color: 'from-blue-500 to-indigo-500'
        },
        {
            id: 'lively_humorous',
            name: '活泼幽默型',
            emoji: '😄',
            description: '活泼开朗，幽默风趣，喜欢开玩笑',
            tags: ['活泼', '幽默', '开朗', '风趣'],
            color: 'from-yellow-500 to-orange-500'
        },
        {
            id: 'scholarly_type',
            name: '学霸型',
            emoji: '🎓',
            description: '好学认真，乐于助人，知识渊博',
            tags: ['好学', '认真', '乐于助人', '知识渊博'],
            color: 'from-purple-500 to-violet-500'
        }
    ],

    /**
     * 初始化选择器
     */
    init() {
        this.renderPersonalityGrid();
        this.bindEvents();
        this.loadSelectedProfile();
        console.log('✅ 用户画像选择器初始化完成');
    },

    /**
     * 渲染画像网格
     */
    renderPersonalityGrid() {
        const container = document.getElementById('personalityGrid');
        if (!container) {
            console.warn('未找到personalityGrid容器');
            return;
        }

        container.innerHTML = this.profiles.map(profile => `
            <div class="personality-card ${this.getCardColor(profile.color)}"
                 data-profile-id="${profile.id}"
                 onclick="PersonalitySelector.selectProfile('${profile.id}')">
                <div class="personality-emoji">${profile.emoji}</div>
                <div class="personality-name">${profile.name}</div>
                <div class="personality-description">${profile.description}</div>
                <div class="personality-tags">
                    ${profile.tags.map(tag => `<span class="personality-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
    },

    /**
     * 获取卡片颜色类
     */
    getCardColor(colorClass) {
        // 这里可以根据不同的画像设置不同的颜色
        return 'bg-gradient-to-br from-white to-gray-50';
    },

    /**
     * 选择画像
     */
    selectProfile(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) {
            console.error('未找到画像:', profileId);
            return;
        }

        // 更新选中的视觉效果
        document.querySelectorAll('.personality-card').forEach(card => {
            card.classList.remove('selected', 'ring-2', 'ring-blue-500', 'ring-offset-2');
        });
        
        const selectedCard = document.querySelector(`[data-profile-id="${profileId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected', 'ring-2', 'ring-blue-500', 'ring-offset-2');
        }

        // 保存选择
        Utils.Storage.set('userPersona', profileId);
        
        // 更新对话引擎的画像
        if (typeof DialogEngine !== 'undefined') {
            DialogEngine.setUserProfile(profileId);
        }

        // 显示确认消息
        this.showConfirmation(profile);
    },

    /**
     * 显示确认消息
     */
    showConfirmation(profile) {
        const modal = document.getElementById('personalityModal');
        const confirmationDiv = document.createElement('div');
        
        confirmationDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn';
        confirmationDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <div>
                    <div class="font-bold">切换成功</div>
                    <div class="text-sm">已切换到${profile.name}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmationDiv);
        
        // 3秒后移除
        setTimeout(() => {
            confirmationDiv.classList.add('animate-slideOut');
            setTimeout(() => confirmationDiv.remove(), 300);
        }, 3000);
    },

    /**
     * 加载已选择的画像
     */
    loadSelectedProfile() {
        const selectedProfileId = Utils.Storage.get('userPersona');
        if (selectedProfileId) {
            this.selectProfile(selectedProfileId);
        } else {
            // 默认选择第一个
            this.selectProfile(this.profiles[0].id);
        }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭模态框
        const closeBtn = document.getElementById('closePersonalityModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const modal = document.getElementById('personalityModal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        }

        // 点击模态框外部关闭
        const modal = document.getElementById('personalityModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
    },

    /**
     * 打开画像选择模态框
     */
    openModal() {
        const modal = document.getElementById('personalityModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    /**
     * 关闭画像选择模态框
     */
    closeModal() {
        const modal = document.getElementById('personalityModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
};

// 导出到全局
window.PersonalitySelector = PersonalitySelector;