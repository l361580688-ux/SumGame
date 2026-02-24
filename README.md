# 叠数求和 (SumStack)

一款基于 React + Vite + Tailwind CSS 构建的高强度数学益智游戏。

## 部署到 Vercel 指南

### 第一步：上传到 GitHub
1. 在 GitHub 上创建一个新的公开或私有仓库。
2. 在本地项目目录运行：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <你的仓库URL>
   git push -u origin main
   ```

### 第二步：在 Vercel 部署
1. 登录 [Vercel 控制台](https://vercel.com)。
2. 点击 **"Add New"** -> **"Project"**。
3. 导入刚才创建的 GitHub 仓库。
4. **配置环境变量 (重要)**：
   - 在 "Environment Variables" 部分，添加 `GEMINI_API_KEY`。
   - 值为您的 Google AI Studio API Key。
5. 点击 **"Deploy"**。

### 开发环境
- 运行：`npm install`
- 启动：`npm run dev`
- 构建：`npm run build`
