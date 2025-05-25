const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 基础中间件
app.use(express.static(path.join(__dirname, 'public')));

// 测试路由
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>AI工具箱 - 测试页面</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          h1 { font-size: 3em; margin-bottom: 20px; }
          p { font-size: 1.2em; margin: 10px 0; }
          .status { color: #4ade80; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎉 AI工具箱</h1>
          <p class="status">✅ 服务器运行正常！</p>
          <p>🚀 端口: ${PORT}</p>
          <p>🌐 访问地址: http://localhost:${PORT}</p>
          <p>⏰ 启动时间: ${new Date().toLocaleString()}</p>
          <hr style="margin: 30px 0; border: 1px solid rgba(255,255,255,0.3);">
          <p>如果您看到这个页面，说明服务器已经成功启动！</p>
          <p>现在可以访问完整的AI工具网站了。</p>
        </div>
      </body>
    </html>
  `);
});

// API测试路由
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API正常工作',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🔥 =================================');
  console.log('🚀 测试服务器启动成功！');
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`🌐 备用地址: http://127.0.0.1:${PORT}`);
  console.log(`📱 端口: ${PORT}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
  console.log('🔥 =================================');
  console.log('✅ 服务器正在运行，等待连接...');
});

server.on('error', (err) => {
  console.error('❌ 服务器启动失败:');
  if (err.code === 'EADDRINUSE') {
    console.error(`   端口 ${PORT} 已被占用`);
    console.error('   解决方案:');
    console.error('   1. 关闭占用端口的程序');
    console.error('   2. 或者修改端口号');
  } else if (err.code === 'EACCES') {
    console.error('   权限不足，请以管理员身份运行');
  } else {
    console.error('   错误详情:', err.message);
  }
  process.exit(1);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
}); 