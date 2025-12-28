/**
 * ========================================
 * 校园AI助手 - 工具函数模块
 * 版本: 2.0 - 模块化重构版
 * 提供各种通用工具函数
 * ========================================
 */

const Utils = {
    /**
     * HTML转义，防止XSS攻击
     * @param {string} text - 需要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * 获取当前时间字符串
     * @returns {string} 格式化后的时间字符串
     */
    getCurrentTime() {
        return new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * 格式化日期时间
     * @param {Date} date - 日期对象
     * @param {boolean} includeSeconds - 是否包含秒
     * @returns {string} 格式化后的日期时间
     */
    formatDate(date, includeSeconds = false) {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (includeSeconds) {
            options.second = '2-digit';
        }
        
        return date.toLocaleString('zh-CN', options);
    },

    /**
     * 防抖函数
     * @param {Function} func - 需要防抖的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 需要节流的函数
     * @param {number} limit - 时间限制（毫秒）
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 深拷贝对象
     * @param {*} obj - 需要拷贝的对象
     * @returns {*} 拷贝后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * 验证手机号格式（中国大陆）
     * @param {string} phone - 手机号
     * @returns {boolean} 是否有效
     */
    validatePhone(phone) {
        const re = /^1[3-9]\d{9}$/;
        return re.test(phone);
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<boolean>} 是否成功
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (err) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    },

    /**
     * 显示Toast通知
     * @param {string} message - 通知消息
     * @param {string} type - 类型: 'success', 'error', 'info', 'warning'
     * @param {number} duration - 持续时间（毫秒）
     */
    showToast(message, type = 'info', duration = 3000) {
        // 移除旧的toast
        const existingToast = document.querySelector('.custom-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建新的toast
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 slide-in-right`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${icons[type]} mr-2"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // 自动移除
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * 显示成功消息
     * @param {string} message - 消息内容
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    },

    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     */
    showError(message) {
        this.showToast(message, 'error');
    },

    /**
     * 显示警告消息
     * @param {string} message - 警告消息
     */
    showWarning(message) {
        this.showToast(message, 'warning');
    },

    /**
     * 显示信息消息
     * @param {string} message - 信息内容
     */
    showInfo(message) {
        this.showToast(message, 'info');
    },

    /**
     * 模态框管理器
     */
    Modal: {
        /**
         * 打开模态框
         * @param {string} modalId - 模态框ID
         */
        open(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('fade-in');
            }
        },

        /**
         * 关闭模态框
         * @param {string} modalId - 模态框ID
         */
        close(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('fade-in');
            }
        }
    },

    /**
     * LocalStorage管理器
     */
    Storage: {
        /**
         * 设置值
         * @param {string} key - 键名
         * @param {*} value - 值
         * @returns {boolean} 是否成功
         */
        set(key, value) {
            try {
                const serialized = JSON.stringify(value);
                localStorage.setItem(key, serialized);
                return true;
            } catch (e) {
                console.error('Storage.set error:', e);
                return false;
            }
        },

        /**
         * 获取值
         * @param {string} key - 键名
         * @param {*} defaultValue - 默认值
         * @returns {*} 存储的值或默认值
         */
        get(key, defaultValue = null) {
            try {
                const serialized = localStorage.getItem(key);
                if (serialized === null) {
                    return defaultValue;
                }
                return JSON.parse(serialized);
            } catch (e) {
                console.error('Storage.get error:', e);
                return defaultValue;
            }
        },

        /**
         * 删除值
         * @param {string} key - 键名
         * @returns {boolean} 是否成功
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Storage.remove error:', e);
                return false;
            }
        },

        /**
         * 清空所有
         * @returns {boolean} 是否成功
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Storage.clear error:', e);
                return false;
            }
        },

        /**
         * 获取所有键
         * @returns {string[]} 键名数组
         */
        keys() {
            return Object.keys(localStorage);
        },

        /**
         * 获取存储空间使用情况
         * @returns {Object} 使用情况信息
         */
        getUsage() {
            let total = 0;
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length * 2; // 每个字符占2字节
                }
            }
            return {
                used: total,
                usedFormatted: Utils.formatFileSize(total),
                estimated: 5 * 1024 * 1024, // 约5MB
                estimatedFormatted: Utils.formatFileSize(5 * 1024 * 1024),
                percentage: Math.min(Math.round((total / (5 * 1024 * 1024)) * 100), 100)
            };
        }
    },

    /**
     * 数据导出器
     */
    Exporter: {
        /**
         * 导出为文本文件
         * @param {string} content - 内容
         * @param {string} filename - 文件名
         */
        exportText(content, filename) {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            this.download(blob, filename);
        },

        /**
         * 导出为JSON文件
         * @param {Object} data - 数据对象
         * @param {string} filename - 文件名
         */
        exportJson(data, filename) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                type: 'application/json;charset=utf-8' 
            });
            this.download(blob, filename);
        },

        /**
         * 下载文件
         * @param {Blob} blob - Blob对象
         * @param {string} filename - 文件名
         */
        download(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    },

    /**
     * 字符串工具
     */
    String: {
        /**
         * 截断字符串
         * @param {string} str - 字符串
         * @param {number} length - 最大长度
         * @param {string} suffix - 后缀
         * @returns {string} 截断后的字符串
         */
        truncate(str, length = 50, suffix = '...') {
            if (str.length <= length) {
                return str;
            }
            return str.substring(0, length - suffix.length) + suffix;
        },

        /**
         * 首字母大写
         * @param {string} str - 字符串
         * @returns {string} 首字母大写的字符串
         */
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        /**
         * 模糊搜索
         * @param {string} query - 查询字符串
         * @param {string} target - 目标字符串
         * @returns {boolean} 是否匹配
         */
        fuzzyMatch(query, target) {
            const queryLower = query.toLowerCase();
            const targetLower = target.toLowerCase();
            
            let queryIndex = 0;
            let targetIndex = 0;
            
            while (queryIndex < queryLower.length && targetIndex < targetLower.length) {
                if (queryLower[queryIndex] === targetLower[targetIndex]) {
                    queryIndex++;
                }
                targetIndex++;
            }
            
            return queryIndex === queryLower.length;
        }
    },

    /**
     * DOM工具
     */
    DOM: {
        /**
         * 添加事件监听器
         * @param {string|Element} selector - 选择器或元素
         * @param {string} event - 事件名
         * @param {Function} handler - 处理函数
         * @param {Object} options - 选项
         */
        on(selector, event, handler, options = {}) {
            const elements = typeof selector === 'string' 
                ? document.querySelectorAll(selector)
                : [selector];
            
            elements.forEach(el => {
                el.addEventListener(event, handler, options);
            });
        },

        /**
         * 移除事件监听器
         * @param {string|Element} selector - 选择器或元素
         * @param {string} event - 事件名
         * @param {Function} handler - 处理函数
         */
        off(selector, event, handler) {
            const elements = typeof selector === 'string'
                ? document.querySelectorAll(selector)
                : [selector];
            
            elements.forEach(el => {
                el.removeEventListener(event, handler);
            });
        },

        /**
         * 查找元素
         * @param {string} selector - 选择器
         * @param {Element} context - 上下文元素
         * @returns {Element|null} 元素
         */
        find(selector, context = document) {
            return context.querySelector(selector);
        },

        /**
         * 查找所有元素
         * @param {string} selector - 选择器
         * @param {Element} context - 上下文元素
         * @returns {NodeList} 元素列表
         */
        findAll(selector, context = document) {
            return context.querySelectorAll(selector);
        }
    }
};

// 导出到全局（浏览器环境）
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

// 模块导出（Node.js环境）
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Utils;
}