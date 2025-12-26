# 校园AI助手 (Campus AI Assistant)

一个智能的校园生活助手Web应用，帮助学生查询课程表、校园服务、设置提醒等。

## 项目简介

校园AI助手是一个纯前端实现的智能校园向导系统，采用模块化架构设计，提供课程查询、校园服务信息、智能提醒等功能。

### 主要功能

- **用户系统**：学号登录/注册、个人信息管理
- **智能对话**：AI驱动的校园问答服务
- **课程管理**：课程表查询、添加/编辑/删除课程
- **校园服务**：食堂菜单、图书馆信息、校车时刻表、快递站位置等
- **提醒功能**：上课提醒、作业截止提醒
- **数据管理**：数据导出、聊天记录保存
- **主题切换**：浅色/深色模式支持
- **响应式设计**：适配手机、平板、电脑
- **PWA支持**：可安装到桌面，离线可用

## 技术栈

- **HTML5**：语义化标签，无障碍支持，PWA manifest
- **CSS3**：自定义变量、动画、响应式设计
- **JavaScript (ES6+)**：模块化架构，LocalStorage存储，Service Worker
- **Tailwind CSS**：快速UI开发
- **Marked.js**：Markdown解析
- **Font Awesome**：图标库
- **PWA**：Service Worker，Cache API，离线支持

## 项目结构

```
Project_Demo/
├── css/
│   └── style.css              # 完整样式文件（含PWA样式）
├── js/
│   └── app.js                 # 主应用入口
├── components/
│   ├── utils.js               # 工具函数模块
│   ├── pwa.js                 # PWA模块
│   ├── login.js               # 登录模块
│   ├── chat.js                # 聊天模块
│   └── sidebar.js             # 侧边栏模块
├── data/
│   ├── courses.json           # 课程数据
│   ├── faq.json               # FAQ知识库
│   └── users.json             # 用户数据模板
├── assets/
│   └── icons/                 # PWA图标（需自行添加）
├── index.html                 # 主页面
├── offline.html               # 离线页面
├── manifest.json              # PWA应用清单
├── service-worker.js          # Service Worker
├── campus-ai-assistant.html   # 原始单文件版本
└── README.md                  # 项目文档
```

## 快速开始

### 前置要求

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 无需后端服务器

### 安装与运行

1. **克隆或下载项目**
   ```bash
   cd path/to/Project_Demo
   ```

2. **直接打开HTML文件**
   - 使用浏览器打开 `index.html`
   - 或使用本地服务器：
     ```bash
     # 使用Python启动本地服务器
     python -m http.server 8000
     
     # 使用Node.js的http-server
     npx http-server
     ```
   - 访问 `http://localhost:8000`

3. **开始使用**
   - 游客模式：无需登录直接体验
   - 学号登录：使用任意8位数字学号和密码登录（演示环境）
     - 默认学号：20210001
     - 默认密码：任意6位以上密码

## 模块说明

### 1. Utils 工具模块 (`components/utils.js`)

提供通用工具函数：

- **HTML转义**：防止XSS攻击
- **日期格式化**：多种日期显示格式
- **防抖/节流**：性能优化
- **数据验证**：邮箱、手机号验证
- **文件导出**：导出为JSON/TXT格式
- **LocalStorage封装**：统一的存储管理
- **模态框管理**：弹窗控制
- **Toast通知**：消息提示
- **模糊匹配**：字符串相似度匹配

### 2. Login 登录模块 (`components/login.js`)

处理用户认证：

- 学号验证（8位数字）
- 密码验证和强度检测
- 记住登录状态（1/7/30天）
- 游客体验模式
- 用户会话管理
- 退出登录

### 3. Chat 聊天模块 (`components/chat.js`)

核心对话功能：

- 消息发送与接收
- AI响应生成（基于关键词匹配）
- 对话上下文管理
- 智能建议
- 加载状态显示
- 消息复制功能
- Markdown渲染
- 聊天历史保存与搜索

### 4. Sidebar 侧边栏模块 (`components/sidebar.js`)

导航和快捷功能：

- 标签页切换（对话、课程表、问答、设置）
- 快捷功能快捷键
- 课程表CRUD操作
- FAQ折叠展开
- 设置管理
- 侧边栏折叠
- 移动端菜单控制

### 5. PWA 模块 (`components/pwa.js`)

PWA功能管理：

- Service Worker注册
- 安装提示管理
- 在线/离线状态检测
- 离线队列同步
- 缓存管理
- PWA更新提示

### 6. App 主应用 (`js/app.js`)

应用生命周期管理：

- 模块初始化
- 数据初始化
- 事件绑定
- 全局错误处理
- 自动备份
- 应用状态管理

## 功能特性

### 智能问答

系统支持以下类型的问题：

**校园服务类**
- "食堂今天有什么菜？" - 显示今日菜单
- "图书馆什么时候开门？" - 显示开放时间
- "校车几点发车？" - 显示时刻表
- "快递站在哪里？" - 显示位置和取件码

**学习类**
- "高数作业什么时候交？" - 显示作业信息
- "计算机课的教室在哪？" - 显示教室位置
- "怎么借书？" - 显示借书流程

**生活类**
- "体育馆开放时间？" - 显示开放时间
- "校医院电话多少？" - 显示电话号码
- "哪里可以打印？" - 显示打印点位置

### 课程管理

- 查看周/日课程表
- 添加新课程
- 编辑现有课程
- 删除课程
- 导出课程表

### 数据管理

- 导出聊天记录为TXT
- 导出所有数据为JSON
- 清空聊天记录
- 自动备份

### 响应式设计

- **桌面端**：完整功能，侧边栏展开
- **平板端**：适配布局，触控优化
- **移动端**：
  - 侧边栏抽屉式设计
  - 手机键盘自适应
  - 触摸目标≥44×44px
  - 滑动交互优化

## 自定义配置

### 修改CSS

编辑 `css/style.css`，支持SCSS风格的变量：

```css
:root {
    --campus-blue: #4A6FA5;
    --campus-orange: #FF8C42;
    /* ... 更多变量 */
}
```

### 修改数据

编辑 `data/` 目录下的JSON文件：

- `courses.json` - 修改课程数据
- `faq.json` - 扩展FAQ知识库
- `users.json` - 添加用户模板

### 扩展AI回答

在 `components/chat.js` 中的意图识别和响应生成部分添加新的问答逻辑。

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- 移动端浏览器（iOS Safari、Chrome Mobile）

## 注意事项

1. **数据存储**：所有数据存储在LocalStorage中，清除浏览器数据会丢失
2. **安全性**：仅作为演示项目，生产环境需要后端服务器
3. **AI响应**：目前基于关键词匹配，可接入真实AI API
4. **离线支持**：首次加载后可离线使用，部分功能受限
5. **PWA图标**：需要在 `assets/icons/` 目录添加图标文件（详见PWA设置）
6. **HTTPS要求**：PWA功能需要HTTPS环境（localhost除外）

## PWA功能说明

### 安装应用

1. 在支持的浏览器（Chrome、Edge、Safari）中访问应用
2. 使用应用3次后，会自动弹出安装提示
3. 或从侧边栏菜单点击"安装应用"
4. 按照浏览器提示安装到桌面

### 离线功能

- ✅ 查看缓存的课程表
- ✅ 浏览常见问题FAQ
- ✅ 查看保存的聊天记录
- ⚠️ AI对话功能需要网络
- ⚠️ 数据同步需要网络

### PWA图标设置

应用需要多种尺寸的图标文件，请将以下图标放入 `assets/icons/` 目录：

```
assets/icons/
├── icon-72x72.png                  (可选)
├── icon-96x96.png                  (可选)
├── icon-128x128.png                (可选)
├── icon-144x144.png                (可选)
├── icon-152x152.png                (可选)
├── icon-192x192.png                (必需)
├── icon-384x384.png                (必需)
├── icon-512x512.png                (必需)
├── icon-maskable-192x192.png       (推荐)
└── icon-maskable-512x512.png       (推荐)
```

可以使用在线工具生成图标：
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon & App Icon Generator](https://realfavicongenerator.net/)

### Service Worker

Service Worker负责：
- 预缓存核心资源（HTML、CSS、JS）
- 运行时缓存API请求
- 离线回退处理
- 后台同步
- 推送通知

如需更新缓存版本，修改 `service-worker.js` 中的 `SW_VERSION` 常量。

### 开发计划

- [ ] 接入真实的AI API（如ChatGPT、文心一言）
- [ ] 后端服务器支持（用户数据云存储）
- [ ] 语音输入/输出
- [ ] 多语言支持
- [ ] 校园地图集成
- [ ] 社交功能（同学圈子）
- [ ] 学习提醒推送通知
- [ ] 更多PWA功能（后台同步、推送通知）

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 常见问题

**Q: 如何添加新的问题到知识库？**
A: 编辑 `data/faq.json` 文件，在相应的 intents 或 campus_services 部分添加新内容。

**Q: 如何修改主题颜色？**
A: 编辑 `css/style.css` 中的CSS变量部分。

**Q: 数据会同步吗？**
A: 目前数据仅存储在本地浏览器，不会同步到云端。

**Q: 如何部署到线上？**
A: 上传所有文件到任何静态网站托管服务（如GitHub Pages、Vercel、Netlify）即可。

## 联系方式

- 项目主页：[GitHub Repository]
- 问题反馈：[Issues]
- 邮箱：support@campus-ai-assistant.com

## 更新日志

### v3.0.0 (2025-12-25)

- 🚀 **PWA支持**：可安装到桌面，支持离线使用
- 📱 **Service Worker**：智能缓存策略，后台同步
- 🔔 **安装提示**：延迟安装提示，提升用户体验
- 📶 **在线状态**：实时网络状态检测
- 📦 **离线功能**：缓存核心数据，离线可用
- 🎨 **PWA样式**：专用的离线和安装界面

### v2.0.0 (2025-12-25)

- 🔨 **重大重构**：采用模块化架构
- 📦 **代码分离**：CSS、JS、HTML分离为独立文件
- 🎨 **UI升级**：更现代的界面设计
- 📱 **移动优化**：更好的移动端体验
- ⚡ **性能优化**：代码加载和执行优化
- 📚 **文档完善**：添加详细的项目文档

### v1.0.0 (初始版本)

- 基础的校园AI助手功能
- 单文件HTML实现
- 核心问答功能

## 致谢

- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Marked.js](https://marked.js.org/) - Markdown解析
- [Font Awesome](https://fontawesome.com/) - 图标库
- 所有贡献者的努力

---

**祝您使用愉快！** 🎓✨