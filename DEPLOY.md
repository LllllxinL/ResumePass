# Vercel 部署指南

## 方式一：使用 Vercel CLI（推荐，最简单）

### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```
会打开浏览器让你登录，支持 GitHub/GitLab/Email 登录。

### 3. 部署项目
在项目根目录执行：
```bash
cd /Users/lllllxinl/Desktop/实习管理软件
vercel
```

### 4. 按提示配置
Vercel 会询问几个问题：
- **Set up and deploy "实习管理软件"?** → 输入 `Y`
- **Which scope do you want to deploy to?** → 选择你的用户名
- **Link to existing project?** → 输入 `N`（第一次部署）
- **What's your project name?** → 输入 `intern-track`（或你喜欢的名字）
- **Which directory is your code located?** → 输入 `./`（当前目录）

### 5. 等待部署完成
部署成功后会显示类似：
```
🔍  Inspect: https://vercel.com/yourname/intern-track/xxxx
✅  Production: https://intern-track.vercel.app
```

访问 `https://intern-track.vercel.app` 即可看到你的应用！

---

## 方式二：使用 GitHub + Vercel 自动部署（推荐长期维护）

### 1. 创建 GitHub 仓库
在 GitHub 上创建一个新仓库，比如 `intern-track`。

### 2. 推送代码到 GitHub
```bash
cd /Users/lllllxinl/Desktop/实习管理软件
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/intern-track.git
git push -u origin main
```

### 3. 在 Vercel 网站导入项目
1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择你的 `intern-track` 仓库
4. 配置保持默认（Vercel 会自动识别 Vite 项目）
5. 点击 "Deploy"

### 6. 自动部署
以后每次推送代码到 GitHub，Vercel 会自动重新部署！

---

## 方式三：使用 Vercel 网站手动上传

### 1. 构建项目
```bash
npm run build
```

### 2. 打包 dist 文件夹
将 `dist/` 文件夹压缩成 zip 文件。

### 3. 上传到 Vercel
1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository" 下方的 "Continue with Template"
3. 选择 "Other" → "Upload"
4. 上传你的 zip 文件

---

## 配置说明

项目已包含 `vercel.json` 配置文件，包含以下设置：
- **构建设置**: 使用 `npm run build`
- **输出目录**: `dist/` (Vite 默认输出目录)
- **路由重写**: 支持前端路由（React Router）
- **缓存优化**: 静态资源长期缓存

---

## 自定义域名（可选）

部署成功后，你可以在 Vercel 控制台设置自定义域名：
1. 进入项目设置
2. 点击 "Domains"
3. 添加你的域名

---

## 环境变量（可选）

如果需要配置环境变量（比如后端 API 地址）：
```bash
vercel env add REACT_APP_API_URL
```
或在 Vercel 网站 → Project Settings → Environment Variables 中添加。

---

## 常见问题

### Q: 部署后页面空白？
A: 检查浏览器控制台是否有错误。通常是路径问题，已配置 `vercel.json` 解决。

### Q: 如何更新部署？
A:
- CLI 方式：再次运行 `vercel` 或 `vercel --prod`
- GitHub 方式：推送代码到 main 分支会自动部署

### Q: 如何删除部署？
A: 在 Vercel 控制台 → Project Settings → General → Delete Project

---

**推荐选择方式一（CLI）快速体验，或方式二（GitHub）长期维护！**
