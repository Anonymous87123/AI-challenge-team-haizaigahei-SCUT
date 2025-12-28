# 校园AI助手 (Campus AI Assistant)

一个智能的校园生活助手Web应用，帮助学生查询课程表、校园服务、设置提醒，并提供校园墙社交互动功能。

---

## 项目名称

校园AI助手 - 智能校园社交平台

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

## 开发工具支持

本项目使用 **CoStrict AI 编程助手** 开发，CoStrict 在以下开发中提供了重要帮助：

- 模块化架构设计
- 复杂交互逻辑实现
- 代码优化与重构
- Bug 快速修复
- 功能扩展实现

详见 `Project_Documentation/AI编程使用报告.md`
