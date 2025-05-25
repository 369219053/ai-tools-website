const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const toolsRoutes = require('./routes/tools');
const userRoutes = require('./routes/user');
const Database = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化数据库
const db = new Database();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "https://picsum.photos"],
      connectSrc: ["'self'"],
    },
  },
}));

// 速率限制
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // 每个IP每分钟100个请求
  duration: 60,
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: '请求过于频繁，请稍后再试' });
  }
});

// 基础中间件
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://yoursite.vercel.app', 'https://yoursite.netlify.app'] : 
    ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Session配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'ai-tools-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/user', userRoutes);

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 工具页面路由
app.get('/tools/:toolName', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tool.html'));
});

// 用户页面路由
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// 健康检查路由（云平台需要）
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API状态检查
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'AI工具箱API正常运行',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '页面不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await db.init();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('🎯 ========================================');
      console.log('🚀 AI工具箱服务器启动成功！');
      console.log(`🌐 本地访问: http://localhost:${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📱 端口: ${PORT}`);
      console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
      console.log('🎯 ========================================');
      console.log('✅ 服务器运行中，准备部署到云平台...');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用`);
      } else {
        console.error('❌ 服务器启动错误:', err);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer(); 