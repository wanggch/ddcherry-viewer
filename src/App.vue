<!-- src/App.vue - 应用根组件，提供顶栏与主体布局。 -->
<template>
  <div class="min-h-screen flex flex-col bg-slate-100">
    <header class="p-4 bg-slate-900 text-white text-xl font-semibold shadow">
      Mermaid 在线可视化工具
    </header>
    <main class="flex-1 overflow-hidden">
      <MermaidViewer />
    </main>
  </div>
</template>

<script setup>
import MermaidViewer from './components/MermaidViewer.vue'
</script>
