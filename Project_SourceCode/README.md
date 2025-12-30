# 校园AI助手 (Campus AI Assistant)

> 一个智能的校园生活助手Web应用，集成了AI问答、校园社交、学习管理的一站式校园服务平台。

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web-lightgrey.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

[在线演示](#) · [功能介绍](#功能使用说明) · [快速开始](#详细运行步骤) · [技术文档](#项目技术栈)

</div>

---

## 📖 项目简介

校园AI助手是一款专为大学生设计的智能校园生活服务平台，旨在解决校园信息分散、社交渠道有限、学习任务管理混乱等痛点。

### 核心价值

- **一站式服务**：将校园服务查询、社交互动、学习管理集成在一个平台
- **智能问答**：AI 助手快速响应校园相关问题和查询
- **社交互动**：校园墙 + 发现朋友，建立校园社交网络
- **离线可用**：PWA 技术支持，安装后可离线使用
- **跨平台**：支持桌面端和移动端，适配各种设备

### 应用场景

- 📚 **学习管理**：查询课程表、作业截止时间、教室位置
- 🍽️ **生活服务**：查看食堂菜单、图书馆开放时间、校车时刻表
- 🏟️ **场馆预约**：查询体育馆、游泳馆等场地开放时间
- 💬 **社交互动**：在校园墙发布内容、点赞收藏、评论互动
- 👥 **发现朋友**：基于兴趣标签匹配好友，拓展社交圈
- 💾 **数据管理**：导出聊天记录、课程表，主题切换

### 创新亮点

1. **轻量级 AI 问答**：无需接入真实 AI API，前端实现智能响应
2. **完整社交闭环**：点赞 → 收藏 → 评论 → 加好友 → 私信
3. **128+ Emoji 表情**：增强评论互动体验
4. **校园墙与社交互通**：从帖子直接添加好友或发送消息
5. **模块化架构**：易于扩展和维护

---

## 🎯 项目名称

**校园AI助手 - 智能校园社交平台**

---

## 🏗️ 项目结构

```
Project_SourceCode/
├── index.html                  # 主页面入口
├── manifest.json               # PWA 应用清单
├── service-worker.js           # Service Worker（离线缓存）
├── offline.html                # 离线页面
├── start.bat                   # Windows 启动脚本
├── start.sh                    # Linux/macOS 启动脚本
├── README.md                   # 项目说明文档
├── components/                 # 组件模块
│   ├── utils.js               # 工具函数（防抖、格式化、验证）
│   ├── login.js               # 登录模块
│   ├── chat.js                # 聊天模块
│   ├── sidebar.js             # 侧边栏导航模块
│   └── pwa.js                 # PWA 功能模块
├── css/                        # 样式文件
│   ├── style.css              # 主样式文件
│   └── fallback.css           # 降级样式
├── js/                         # 主应用逻辑
│   └── app.js                 # 应用入口、初始化、核心逻辑
├── data/                       # 数据文件
│   ├── courses.json           # 课程数据模板
│   ├── faq.json               # FAQ 知识库
│   └── users.json             # 用户数据模板
└── assets/                     # 静态资源
    └── icons/                 # 应用图标（多种尺寸）
        ├── icon-72x72.png
        ├── icon-96x96.png
        ├── icon-128x128.png
        ├── icon-144x144.png
        ├── icon-192x192.png
        └── icon-512x512.png
```

---

## 运行环境

- **浏览器要求**：现代浏览器（推荐 Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）
- **Web服务器**（可选）：
  - Python 3.x（用于启动本地开发服务器）
  - Node.js 16+（用于启动本地开发服务器）
  - 或任何静态文件服务器
- **操作系统**：支持 Windows、macOS、Linux（跨平台）
- **无需后端服务器**：纯前端应用，数据存储在浏览器 LocalStorage

**注意**：本项目为纯前端应用，无需安装后端服务器或数据库。

---

## 依赖库及安装命令

本项目使用纯前端技术栈，主要依赖：

### 核心依赖（通过CDN引入）

在 HTML 文件中已通过 CDN 引入以下库：

1. **Tailwind CSS**（UI框架）
   - 版本：3.4.x
   - 引入方式：`<script src="https://cdn.tailwindcss.com"></script>`
   
2. **Font Awesome**（图标库）
   - 版本：6.5.x
   - 引入方式：`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">`

3. **Marked.js**（Markdown解析器）
   - 版本：11.x
   - 引入方式：`<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>`

### 无需手动安装

由于所有依赖通过 CDN 在线加载，**无需执行任何安装命令**。

---

## 详细运行步骤

### 方式一：直接打开 HTML 文件（最简单）

1. **下载或克隆项目**
   - 下载压缩包并解压
   - 或使用 Git 克隆项目：
     ```bash
     git clone [项目仓库地址]
     cd Project_SourceCode
     ```

2. **直接打开主页面**
   - 在文件管理器中找到 `index.html` 文件
   - 双击使用浏览器打开
   - 或右键选择"打开方式" → 选择 Chrome/Edge/Firefox 浏览器

3. **开始使用**
   - 游客模式：无需登录直接体验基础功能
   - 学号登录：使用任意8位数字学号登录
     - 默认测试学号：`20210001`
     - 默认测试密码：任意6位以上密码

### 方式二：使用本地服务器（推荐，支持完整功能）

由于浏览器安全限制，某些功能（如 Service Worker PWA 离线支持）需要通过 HTTP/HTTPS 协议访问，直接打开本地文件可能无法正常工作。

#### 1. 使用 Python 启动本地服务器

```bash
# 进入项目目录
cd Project_SourceCode

# 使用 Python 3.x 启动服务器
python -m http.server 8000
```

然后在浏览器中访问：
```
http://localhost:8000
```

#### 2. 使用 Node.js 启动本地服务器

```bash
# 首先安装 http-server（仅需安装一次）
npm install -g http-server

# 进入项目目录
cd Project_SourceCode

# 启动服务器
http-server -p 8000
```

然后在浏览器中访问：
```
http://localhost:8000
```

#### 3. 使用 VS Code Live Server 扩展

1. 在 VS Code 中安装 "Live Server" 扩展
2. 在 `index.html` 文件上右键
3. 选择 "Open with Live Server"
4. 浏览器会自动打开应用

#### 4. Windows 一键启动（已提供启动脚本）

项目已提供启动脚本，双击即可运行：

- **Windows**：双击 `start.bat` 文件
- **Linux/macOS**：执行 `./start.sh` 文件

### 方式三：部署到服务器

将 `Project_SourceCode` 目录中的所有文件部署到任何支持静态文件托管的服务器：

- GitHub Pages
- Vercel
- Netlify
- Nginx
- Apache
- 云服务器（阿里云、腾讯云）

---

## 功能使用说明

### 用户登录

1. 启动应用后，点击"登录"按钮
2. 输入学号（8位数字，如：20210001）
3. 输入密码（任意6位以上字符）
4. 可选择"记住我"（1天/7天/30天）
5. 点击"登录"进入应用

### 主要功能模块

#### 1. 智能对话
- 支持校园服务查询（食堂、图书馆、校车等）
- 支持学习管理（课程、作业查询）
- 支持生活服务（体育馆、校医院、打印点等）
- 自动保存聊天记录

#### 2. 校园墙（新增社交功能）
- 发布帖子：文字内容 + 图片URL（可选）
- 点赞系统：带心跳动画效果
- 收藏系统：星形图标收藏，可在个人中心查看
- 评论系统：
  - 内置 128+ emoji 表情选择器
  - 支持回复他人评论
  - 按时间/热度排序
  - 楼主（帖子作者）特殊标识
- 社交互动：
  - 从帖子可以添加好友
  - 直接发送消息与好友聊天

#### 3. 发现朋友
- 查看推荐好友列表
- 查看用户档案（年级、专业、兴趣标签）
- 发送好友请求
- 查看好友列表
- 消息通知

#### 4. 课程表管理
- 添加课程：课程名、教室、时间、周次
- 编辑/删除课程
- 查看周/日课程表
- 导出课程表

#### 5. 设置
- 账户信息管理
- 主题切换（浅色/深色模式）
- 数据导出（JSON/TXT）
- 清空数据

### PWA 离线使用

1. 在 Chrome/Edge 浏览器中访问应用
2. 地址栏会出现安装图标（⊕）
3. 点击安装，应用会安装到桌面
4. 安装后可离线使用，在线时自动同步数据

---

## 数据存储说明

- **数据位置**：浏览器 LocalStorage
- **数据格式**：JSON
- **自动备份**：应用启动时自动备份数据
- **数据导出**：可在设置中导出为 JSON 或 TXT 文件
- **数据清除**：清除浏览器数据会丢失所有用户数据

---

## 注意事项

1. **数据持久化**：所有数据存储在浏览器 LocalStorage 中，清除浏览器数据会丢失
2. **安全性**：当前为演示环境，生产环境需要接入真实后端服务器
3. **PWA限制**：直接打开 `.html` 文件时 PWA Service Worker 可能无法正常工作，建议使用本地服务器运行
4. **图片上传**：当前使用图片URL方式，实际部署可接入文件上传API
5. **AI响应**：当前基于关键词匹配，可接入真实 AI API（如 ChatGPT、文心一言等）

---

## 技术支持

如有问题，请查看：
- 浏览器控制台（F12）查看错误信息
- 检查 LocalStorage 是否被禁用
- 尝试使用其他浏览器
- 清除浏览器缓存后重试

---

## 项目技术栈

- **前端框架**：纯原生 JavaScript（ES6+）
- **UI框架**：Tailwind CSS 3.4
- **图标库**：Font Awesome 6.5
- **Markdown解析**：Marked.js 11
- **PWA支持**：Service Worker、Cache API
- **数据存储**：LocalStorage API
- **动画效果**：CSS3 Animations & Transitions

---

## ✨ 核心功能特性

### 🤖 智能问答系统
- ✅ 自然语言输入，支持多样化提问方式
- ✅ 基于 FQA 知识库的智能匹配
- ✅ 多领域覆盖：校园服务、学习管理、生活服务
- ✅ Markdown 格式渲染，响应速度快
- ✅ 聊天记录自动保存，历史查询便捷

### 🏫 校园墙社交
- ✅ 瀑布流布局展示帖子
- ✅ 完整的社交互动：点赞、收藏、评论
- ✅ 128+ Emoji 表情选择器，8个分类
- ✅ 支持嵌套评论回复，@目标用户
- ✅ 楼主特殊标识（👑）
- ✅ 从帖子直接添加好友或发送消息

### 👥 发现朋友
- ✅ 基于用户画像的智能推荐
- ✅ 年级、专业、兴趣标签匹配
- ✅ 匹配度评分显示
- ✅ 好友请求与好友列表管理
- ✅ 实时消息通知

### 📚 课程表管理
- ✅ 周/日视图切换
- ✅ 添加、编辑、删除课程
- ✅ 课程信息：课程名、教室、时间、周次
- ✅ 课程颜色区分
- ✅ 导出课程表功能

### 📱 PWA 应用
- ✅ 可安装到桌面，像原生应用使用
- ✅ Service Worker 离线缓存
- ✅ 在线/离线状态检测
- ✅ 自动同步数据
- ✅ 跨平台支持（Windows、macOS、Linux、Android、iOS）

### 🎨 用户体验
- ✅ 浅色/深色主题切换
- ✅ 响应式设计，适配各种设备
- ✅ 流畅的动画效果
- ✅ 数据导出（JSON/TXT）
- ✅ 游客体验模式

---

## 🚀 开发指南

### 环境要求

```bash
# 浏览器
- Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+

# 可选本地服务器
- Python 3.x
- Node.js 16+
```

### 快速开始

```bash
# 克隆项目
git clone [项目仓库地址]
cd Project_SourceCode

# 方式1：使用 Python
python -m http.server 8000

# 方式2：使用 Node.js
npm install -g http-server
http-server -p 8000

# 方式3：使用启动脚本
# Windows
start.bat

# Linux/macOS
chmod +x start.sh
./start.sh

# 访问应用
浏览器打开 http://localhost:8000
```

### 代码结构说明

```javascript
// 应用入口
入口文件：index.html
主逻辑：js/app.js

// 核心模块
components/utils.js      // 工具函数：防抖、格式化、验证
components/login.js     // 登录模块：认证、会话管理
components/chat.js      // 聊天模块：AI问答、消息处理
components/sidebar.js    // 侧边栏：导航、菜单管理
components/pwa.js       // PWA模块：离线缓存、安装提示

// 数据存储
LocalStorage：用户数据、帖子、评论、聊天记录
```

### 扩展开发

```javascript
// 添加新的功能模块

// 1. 在 js/app.js 中注册新模块
function initializeNewModule() {
    // 初始化逻辑
}

// 2. 在 components/ 中创建新模块文件
// components/newmodule.js

// 3. 在 sidebars.js 中添加导航按钮

// 4. 在 index.html 中添加对应的 HTML 模板
```

---

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 代码行数 | ~8000+ |
| 功能模块 | 8 个 |
| 支持的交互 | 30+ |
| 表情符号 | 128+ |
| 浏览器兼容性 | Chrome/Firefox/Safari/Edge |
| 响应式断点 | 手机/平板/桌面 |

---

## 🔧 常见问题 (FAQ)

### Q1: 直接打开 HTML 文件无法使用某些功能？

**A**: 由于浏览器安全限制，PWA Service Worker 等功能需要通过 HTTP/HTTPS 协议访问。建议使用本地服务器运行：
```bash
python -m http.server 8000
```

### Q2: 数据是否会被清除？

**A**: 所有数据存储在浏览器 LocalStorage 中。清除浏览器数据或使用隐私模式会导致数据丢失。建议定期使用"导出数据"功能备份。

### Q3: 支持多人同时使用吗？

**A**: 当前为纯前端应用，数据存储在本地浏览器中，不支持跨设备同步。多人使用需要各自在自己的浏览器中运行。

### Q4: 如何接入真实的 AI API？

**A**: 在 `js/app.js` 的 `generateAIResponse` 函数中，将关键词匹配逻辑替换为真实 AI API 调用即可。

### Q5: PWA 安装后如何更新？

**A**: PWA 会自动检测更新并在通知栏提示。点击"更新"按钮即可完成更新。

---

## 🤝 贡献指南

欢迎贡献代码、报告 Bug 或提出新功能建议！

### 开发流程

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 使用 ES6+ 语法
- 遵循模块化设计原则
- 添加详细的注释
- 保持代码风格一致

---

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 👨‍💻 开发团队

**团队名称**：还在改

**学校**：华南理工大学

**开发者**：[你的名字]

本项目使用 **CoStrict AI 编程助手** 开发，CoStrict 在以下方面提供了重要帮助：

- 🏗️ 模块化架构设计
- ⚡ 复杂交互逻辑实现
- 🎨 代码优化与重构
- 🐛 Bug 快速修复
- 🚀 功能扩展实现

详见 `../Project_Documentation/AI编程使用报告.md`

---

## 📞 联系方式

- 🔗 项目地址：[GitHub 仓库地址]
- 📧 邮箱：[your-email@example.com]
- 📝 文档：`../Project_Documentation/应用介绍.md`
- 🎬 演示视频：`../Project_Demo/演示视频.mp4`

---

## 🌟 致谢

感谢以下开源项目和技术：

- [Tailwind CSS](https://tailwindcss.com/) - UI 框架
- [Font Awesome](https://fontawesome.com/) - 图标库
- [Marked.js](https://marked.js.org/) - Markdown 解析器
- [CoStrict](https://costrict.ai) - AI 编程助手

---

## 📈 更新日志

### v1.2.0 (2024-12-28)
- ✨ 新增校园墙社交功能（点赞、收藏、评论）
- ✨ 新增发现朋友系统
- ✨ 新增 128+ Emoji 表情选择器
- 🎨 优化侧边栏按钮颜色辨识度
- 🎨 优化滚动条可见性
- 🐛 修复"开放时间"按钮逻辑问题

### v1.1.0 (2024-12-27)
- ✨ 新增 PWA 离线支持
- ✨ 新增深色/浅色主题切换
- ✨ 新增数据导出功能
- 🔨 重构模块化架构
- 📝 完善文档

### v1.0.0 (2024-12-26)
- 🎉 初版发布
- ✨ 智能问答系统
- ✨ 课程表管理
- ✨ 用户登录系统
- ✨ 响应式设计

---

## 🔗 相关链接

- [项目文档](../Project_Documentation/)
- [AI 编程使用报告](../Project_Documentation/AI编程使用报告.md)
- [应用截图说明](../Project_Documentation/应用截图说明.md)
- [演示视频录制指南](../Project_Documentation/演示视频录制说明.md)

---

<div align="center">

**如果这个项目对您有帮助，请给它一个 ⭐️ Star！**

Made with ❤️ by 还在改团队

[回到顶部](#校园ai助手-campus-ai-assistant)

</div>
