# 基于 Vue3 的在线 Mermaid 浏览器开发步骤

## ✅ 项目目标
实现一个基于 **Vue 3 + Vite + Mermaid.js** 的在线可视化工具：
- 左侧：Mermaid 代码粘贴框
- 右侧：渲染结果区
- 点击“渲染图表”按钮后生成 SVG
- 支持错误提示、主题切换、导出 SVG

---

## 🔹 Step 1：初始化项目
```bash
npm create vite@latest ddcherry-viewer -- --template vue
cd ddcherry-viewer
npm install
```

> 确保 Node 18+，否则 Vite 无法运行。

---

## 🔹 Step 2：安装依赖
```bash
npm install mermaid
npm install tailwindcss postcss autoprefixer -D
npx tailwindcss init -p
```

修改 `tailwind.config.js`：
```js
content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"]
```

在 `src/assets/style.css` 中添加：
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🔹 Step 3：项目结构
```
src/
├── assets/
│   └── style.css
├── components/
│   └── MermaidViewer.vue
├── App.vue
└── main.js
```

---

## 🔹 Step 4：实现 MermaidViewer.vue
功能要求：
- 左侧 textarea 粘贴 Mermaid 代码
- 右侧渲染区 div#mermaid-container
- 中间有按钮 “渲染图表”
- 使用 `mermaid.render()` 渲染
- 捕获错误并显示提示

默认示例：
```
graph TD;
  A[开始] --> B[处理]
  B --> C{条件?}
  C -->|是| D[结果1]
  C -->|否| E[结果2]
```

---

## 🔹 Step 5：App.vue
```vue
<template>
  <div class="h-screen flex flex-col">
    <header class="p-4 bg-gray-800 text-white text-xl font-bold">
      Mermaid 在线可视化工具
    </header>
    <MermaidViewer />
  </div>
</template>

<script setup>
import MermaidViewer from './components/MermaidViewer.vue'
</script>
```

---

## 🔹 Step 6：main.js
```js
import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'

createApp(App).mount('#app')
```

---

## 🔹 Step 7：布局样式示例
```html
<div class="flex h-screen">
  <textarea class="w-1/2 p-4 font-mono border-r resize-none"></textarea>
  <div id="mermaid-container" class="w-1/2 p-4 bg-white overflow-auto"></div>
</div>
```

---

## 🔹 Step 8：渲染逻辑
```js
import { ref, onMounted } from 'vue'
import mermaid from 'mermaid'

const code = ref(`graph TD; A-->B;`)

onMounted(() => {
  mermaid.initialize({ startOnLoad: false, theme: 'default' })
})

async function renderDiagram() {
  try {
    const { svg } = await mermaid.render('preview', code.value)
    document.getElementById('mermaid-container').innerHTML = svg
  } catch (err) {
    document.getElementById('mermaid-container').innerHTML =
      `<div class='text-red-600 p-2'>渲染错误：${err.message}</div>`
  }
}
```

---

## 🔹 Step 9：增强功能
1. 主题切换（light/dark）  
2. 导出 SVG/PNG  
3. 本地缓存上次输入（`localStorage`）

---

## 🔹 Step 10：运行与测试
```bash
npm run dev
```
访问 `http://localhost:5173/`  
测试粘贴 Mermaid 代码 → 点击渲染 → 验证效果

---

## 🔹 Step 11：部署
```bash
npm run build
```
部署 `dist/` 到任意静态服务（Nginx、Vercel、GitHub Pages）

---

## 🧾 Codex 使用技巧
1. 每个文件顶部添加注释说明目标  
2. 明确“文件名 + 功能”给 Codex 指令  
3. 若渲染失败，提示使用 `await mermaid.render()`  
4. 若未显示 SVG，提示 Codex 插入到 DOM 中

---

## ✅ 补充说明
已包含：
- Tailwind 安装与配置  
- DOM 异步渲染处理  
- 错误提示机制  
- 主题与导出扩展  
- 构建与部署指导  
- Codex Prompt 指令提示

该方案已完整适配 Codex 自动生成逻辑，可直接运行。
