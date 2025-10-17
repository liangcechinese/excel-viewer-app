# 国内平台部署指南

## 🇨🇳 国内免费部署平台推荐

### 1. Gitee Pages (推荐)

**优势:**
- ✅ 完全免费
- ✅ 国内访问速度快
- ✅ 支持自定义域名
- ✅ 部署简单

**部署步骤:**
1. 访问 https://gitee.com 并注册账户
2. 创建新仓库：`excel-viewer`
3. 将GitHub仓库镜像到Gitee：
   ```bash
   # 在Gitee仓库中导入GitHub仓库
   # 或使用git命令添加远程仓库
   git remote add gitee https://gitee.com/你的用户名/excel-viewer.git
   git push gitee main
   ```
4. 启用Gitee Pages：
   - 进入仓库设置
   - 选择 "Pages" 服务
   - 选择 "master/main" 分支
   - 选择 "build" 目录
   - 点击启动

**注意事项:**
- Gitee Pages需要实名认证
- 免费版只能使用 `*.gitee.io` 域名

### 2. Coding静态网站托管

**优势:**
- ✅ 腾讯云旗下，稳定可靠
- ✅ 免费额度充足
- ✅ 支持持续部署
- ✅ 国内访问优秀

**部署步骤:**
1. 访问 https://coding.net 并注册
2. 创建项目：`excel-viewer`
3. 开启静态网站服务：
   - 项目设置 → 持续部署 → 静态网站
   - 开启服务
   - 选择部署目录：`build`
4. 上传构建文件或配置自动部署

### 3. 腾讯云开发CloudBase

**优势:**
- ✅ 腾讯云官方，速度优秀
- ✅ 免费额度：5GB存储 + 5GB流量/月
- ✅ 支持自定义域名
- ✅ 全球CDN加速

**部署步骤:**
1. 访问 https://cloudbase.net
2. 创建新环境
3. 开启静态网站托管
4. 使用命令行工具上传：
   ```bash
   npm install -g @cloudbase/cli
   tcb login
   tcb hosting deploy build -e 你的环境ID
   ```

### 4. Vercel + 国内CDN (混合方案)

**方案:**
- 使用Vercel作为主服务器
- 配置国内CDN加速访问

**实现方式:**
1. 正常部署到Vercel
2. 使用又拍云、七牛云等国内CDN
3. 配置域名解析到CDN

## 🚀 快速部署建议

### 最简单方案：Gitee Pages

1. **镜像仓库到Gitee**
2. **启用Pages服务**
3. **获得访问地址**

### 最稳定方案：腾讯云开发

1. **注册腾讯云开发**
2. **创建静态网站服务**
3. **使用CLI工具部署**

## 📋 部署前准备

### 1. 构建项目
```bash
npm run build
```

### 2. 检查build目录
确认 `build` 目录包含：
- `index.html` (主页面)
- `static/` (静态资源)
- `manifest.json` (PWA配置)

### 3. 优化配置
- 确保环境变量正确配置
- 检查路由配置是否适合SPA

## 🔧 域名配置

### Gitee Pages
- 免费版：`用户名.gitee.io`
- 付费版：支持自定义域名

### 腾讯云开发
- 免费版：随机域名
- 付费版：支持自定义域名

## 📊 性能对比

| 平台 | 国内速度 | 免费额度 | 部署难度 | 推荐指数 |
|------|----------|----------|----------|----------|
| Gitee Pages | ⭐⭐⭐⭐⭐ | 无限制 | ⭐⭐⭐⭐⭐ | 🏆 |
| 腾讯云开发 | ⭐⭐⭐⭐⭐ | 5GB+5GB/月 | ⭐⭐⭐ | 🥈 |
| Coding托管 | ⭐⭐⭐⭐ | 充足 | ⭐⭐⭐⭐ | 🥉 |
| Vercel+CDN | ⭐⭐⭐ | 高 | ⭐⭐ | ⭐ |

## 🎯 推荐选择

**个人项目/学习用途：** Gitee Pages
**正式项目/商业用途：** 腾讯云开发
**快速验证：** Coding静态网站

## 🔄 持续部署配置

### Gitee + 自动部署
可以使用Gitee的Webhook功能，结合GitHub Actions实现自动同步部署。

### 腾讯云 + CI/CD
配置腾讯云开发的CI/CD流程，实现代码提交自动部署。

## 🆘 常见问题

**Q: Gitee Pages访问速度慢？**
A: 检查是否启用了HTTPS，确保文件大小在限制范围内。

**Q: 腾讯云开发免费额度够用吗？**
A: 对于个人项目，5GB存储和5GB流量完全足够。

**Q: 如何配置自定义域名？**
A: 在平台设置中添加域名，并在DNS中配置CNAME记录。

选择适合你的平台，按照步骤操作即可快速部署！