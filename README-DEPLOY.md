# 🚀 AI工具箱 - 在线部署指南

将您的AI工具网站部署到互联网，获得真正的网址！

## 🌟 部署选项

### 方案一：Vercel（推荐）
- ✅ 完全免费
- ✅ 自动获得 `yoursite.vercel.app` 域名
- ✅ 支持自定义域名
- ✅ 自动HTTPS
- ✅ 全球CDN加速

### 方案二：Netlify
- ✅ 免费额度很大
- ✅ 自动获得 `yoursite.netlify.app` 域名
- ✅ 支持自定义域名

### 方案三：Railway
- ✅ 适合Node.js应用
- ✅ 包含数据库
- ✅ 自动获得 `yoursite.railway.app` 域名

## 🚀 快速部署到Vercel

### 步骤1：准备GitHub仓库
1. 访问 [GitHub.com](https://github.com)
2. 注册/登录账号
3. 创建新仓库，命名为 `ai-tools-website`
4. 上传您的项目文件

### 步骤2：部署到Vercel
1. 访问 [Vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择您的 `ai-tools-website` 仓库
5. 点击 "Deploy"

### 步骤3：获得在线网址
部署完成后，您将获得类似这样的网址：
- `https://ai-tools-website-yourname.vercel.app`

## 🌐 部署到Netlify

### 步骤1：上传到GitHub（同上）

### 步骤2：部署到Netlify
1. 访问 [Netlify.com](https://netlify.com)
2. 使用GitHub账号登录
3. 点击 "New site from Git"
4. 选择您的仓库
5. 部署设置：
   - Build command: `npm install`
   - Publish directory: `public`
6. 点击 "Deploy site"

## 🚂 部署到Railway

### 步骤1：准备代码（同上）

### 步骤2：部署到Railway
1. 访问 [Railway.app](https://railway.app)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择您的仓库
6. Railway会自动检测Node.js项目并部署

## 🔧 环境变量配置

在云平台中设置以下环境变量：

```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key
PORT=3000
```

## 📱 自定义域名（可选）

### 购买域名
1. 访问 [阿里云](https://wanwang.aliyun.com) 或 [腾讯云](https://dnspod.cloud.tencent.com)
2. 搜索并购买您喜欢的域名，如：`myaitools.com`

### 配置域名
1. 在Vercel/Netlify控制台中添加自定义域名
2. 按照提示配置DNS记录
3. 等待生效（通常几分钟到几小时）

## 🎯 部署后的网址示例

部署成功后，您的网站将有类似这样的网址：

- **Vercel**: `https://ai-tools-website.vercel.app`
- **Netlify**: `https://ai-tools-website.netlify.app`
- **Railway**: `https://ai-tools-website.railway.app`
- **自定义域名**: `https://myaitools.com`

## ✅ 验证部署

访问您的网站，检查以下功能：
- [ ] 主页正常显示
- [ ] 用户注册/登录功能
- [ ] AI工具正常工作
- [ ] API接口响应正常

## 🔍 常见问题

### Q: 部署失败怎么办？
A: 检查构建日志，通常是依赖安装问题或环境变量配置问题。

### Q: 网站访问慢怎么办？
A: Vercel和Netlify都有全球CDN，通常很快。如果慢，可能是网络问题。

### Q: 可以使用中文域名吗？
A: 可以，但建议使用英文域名，兼容性更好。

### Q: 费用如何？
A: Vercel和Netlify的免费额度对个人项目完全够用。

## 🎉 恭喜！

部署成功后，您就拥有了一个真正的在线AI工具网站！

可以分享给朋友使用：`https://yoursite.vercel.app`

---

**需要帮助？** 
- 查看平台官方文档
- 或者联系技术支持 