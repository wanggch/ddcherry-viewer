// src/main.js - Vue 应用入口文件，挂载主组件并引入全局样式。
import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'

createApp(App).mount('#app')
