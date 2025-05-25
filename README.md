# AI工具箱 - 智能工具集合平台

一个现代化的AI工具集合网站，提供多种智能工具服务，包括文本生成、图像创作、代码助手、智能翻译等功能。

## ✨ 特色功能

- 🤖 **智能文本生成** - 基于AI的文本创作工具
- 🎨 **AI图像生成** - 文字描述生成高质量图像
- 💻 **代码助手** - 智能代码生成和优化
- 🌐 **智能翻译** - 多语言翻译服务
- 📊 **内容优化器** - SEO和内容优化工具
- 🎤 **语音合成** - 文字转语音服务

## 🚀 技术栈

### 后端
- **Node.js** - 服务器运行环境
- **Express.js** - Web应用框架
- **SQLite** - 轻量级数据库
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **helmet** - 安全中间件
- **rate-limiter-flexible** - 请求限流

### 前端
- **HTML5** - 页面结构
- **Tailwind CSS** - 现代化CSS框架
- **Vanilla JavaScript** - 原生JavaScript
- **响应式设计** - 适配各种设备

## 📦 安装部署

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-tools-website
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp env.example .env
# 编辑 .env 文件，配置必要的环境变量
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 生产部署

1. **构建项目**
```bash
npm run build
```

2. **启动生产服务器**
```bash
npm start
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器端口 | 3000 |
| `NODE_ENV` | 运行环境 | development |
| `JWT_SECRET` | JWT密钥 | - |
| `SESSION_SECRET` | Session密钥 | - |
| `DB_PATH` | 数据库路径 | ./database/ai_tools.db |

### 数据库

项目使用SQLite作为数据库，首次启动时会自动创建数据库文件和表结构。

数据库表结构：
- `users` - 用户信息
- `tool_usage` - 工具使用记录
- `user_favorites` - 用户收藏
- `feedback` - 用户反馈

## 📚 API文档

### 认证相关

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "邮箱",
  "password": "密码"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "邮箱",
  "password": "密码"
}
```

#### 获取用户信息
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 工具相关

#### 获取工具列表
```http
GET /api/tools
```

#### 获取工具详情
```http
GET /api/tools/:toolId
```

#### 文本生成
```http
POST /api/tools/text-generator/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "生成提示",
  "type": "article|title|summary",
  "length": "short|medium|long"
}
```

#### 图像生成
```http
POST /api/tools/image-generator/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "图像描述",
  "style": "realistic|cartoon|artistic|abstract",
  "size": "512x512|768x512|512x768"
}
```

#### 代码生成
```http
POST /api/tools/code-assistant/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "功能描述",
  "language": "javascript|python|java|cpp",
  "type": "function|class|script"
}
```

#### 翻译
```http
POST /api/tools/translation/translate
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "要翻译的文本",
  "fromLang": "源语言",
  "toLang": "目标语言"
}
```

### 用户相关

#### 获取用户统计
```http
GET /api/user/stats
Authorization: Bearer <token>
```

#### 获取收藏列表
```http
GET /api/user/favorites
Authorization: Bearer <token>
```

#### 收藏工具
```http
POST /api/tools/:toolId/favorite
Authorization: Bearer <token>
```

## 🎨 界面设计

### 设计原则
- **简洁现代** - 清爽的界面设计
- **响应式** - 适配桌面和移动设备
- **用户友好** - 直观的操作流程
- **高性能** - 快速的页面加载

### 主要页面
- **首页** - 工具展示和用户注册登录
- **工具页面** - 具体工具的使用界面
- **个人中心** - 用户信息和使用统计

## 🔒 安全特性

- **密码加密** - 使用bcrypt加密存储
- **JWT认证** - 安全的用户认证机制
- **请求限流** - 防止API滥用
- **输入验证** - 严格的数据验证
- **CSRF保护** - 跨站请求伪造防护
- **XSS防护** - 跨站脚本攻击防护

## 🚀 性能优化

- **静态资源缓存** - 提高页面加载速度
- **数据库索引** - 优化查询性能
- **请求压缩** - 减少网络传输
- **懒加载** - 按需加载资源
- **CDN支持** - 全球内容分发

## 🛠️ 开发指南

### 项目结构
```
ai-tools-website/
├── server.js              # 主服务器文件
├── package.json           # 项目配置
├── README.md             # 项目说明
├── env.example           # 环境变量示例
├── database/             # 数据库相关
│   └── db.js            # 数据库管理
├── routes/              # 路由文件
│   ├── auth.js         # 认证路由
│   ├── tools.js        # 工具路由
│   └── user.js         # 用户路由
└── public/             # 静态文件
    ├── index.html      # 主页
    ├── tool.html       # 工具页面
    └── js/             # JavaScript文件
        ├── main.js     # 主要逻辑
        └── tool.js     # 工具页面逻辑
```

### 添加新工具

1. **后端路由** - 在 `routes/tools.js` 中添加新的API端点
2. **前端界面** - 在 `tool.html` 中添加工具界面
3. **JavaScript逻辑** - 在 `tool.js` 中添加处理逻辑
4. **工具配置** - 在 `AI_TOOLS` 对象中添加工具信息

### 代码规范

- 使用ES6+语法
- 遵循RESTful API设计
- 添加适当的错误处理
- 编写清晰的注释
- 保持代码整洁

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 支持

如果您遇到问题或有建议，请：

1. 查看 [FAQ](docs/FAQ.md)
2. 搜索现有的 [Issues](../../issues)
3. 创建新的 [Issue](../../issues/new)

## 🔮 未来计划

- [ ] 集成更多AI服务提供商
- [ ] 添加更多工具类型
- [ ] 实现用户协作功能
- [ ] 移动端APP开发
- [ ] 多语言界面支持
- [ ] 高级用户权限管理
- [ ] API使用统计和分析
- [ ] 插件系统开发

## 📊 更新日志

### v1.0.0 (2024-01-01)
- 🎉 初始版本发布
- ✨ 基础工具功能实现
- 🔐 用户认证系统
- 📱 响应式界面设计
- 🛡️ 安全防护机制


---

**AI工具箱** - 让AI技术触手可及 🚀 
