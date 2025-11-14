<!-- src/components/MermaidViewer.vue - Mermaid 编辑与渲染核心组件。 -->
<template>
  <div
    class="flex h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 transition-all duration-300 dark:from-slate-900 dark:to-gray-950 dark:text-gray-200"
  >
    <header
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/40 bg-white/80 p-4 backdrop-blur shadow-sm dark:border-gray-700/40 dark:bg-gray-900/70"
    >
      <div>
        <h1 class="text-xl font-semibold tracking-wide">Mermaid 在线可视化工具</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">实时编辑、渲染并导出流程图与结构图。</p>
      </div>
    </header>

    <main class="flex flex-1 flex-col overflow-hidden md:flex-row">
      <section class="flex w-full flex-col overflow-hidden border-b border-white/40 bg-white/60 backdrop-blur md:w-1/2 md:border-b-0 md:border-r dark:border-gray-800/80 dark:bg-gray-900/50">
        <div
          class="flex items-center justify-between border-b border-white/40 px-5 py-4 text-gray-600 dark:border-gray-800/70 dark:text-gray-300"
        >
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Mermaid 代码</h2>
          </div>
        </div>
        <div
          ref="toolbarRef"
          class="flex flex-wrap items-center gap-2 border-b border-white/40 px-5 py-3 dark:border-gray-800/70"
        >
          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-white/80 text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-900/70 dark:text-gray-400 dark:hover:border-indigo-500/50 dark:hover:text-indigo-300"
            type="button"
            :disabled="!hasDiagram"
            title="导出 SVG"
            aria-label="导出 SVG"
            @click.stop="exportSvg"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V3" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 21h14" />
            </svg>
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-white/80 text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-gray-900/70 dark:text-gray-400 dark:hover:border-sky-500/50 dark:hover:text-sky-300"
            type="button"
            :disabled="!hasDiagram"
            title="导出 PNG"
            aria-label="导出 PNG"
            @click.stop="exportPng"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5l3.5-3.5m0 0L12 9.5m3.5 3.5H8" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-white/80 text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:bg-gray-900/70 dark:text-gray-400 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300"
            type="button"
            title="格式化代码"
            aria-label="格式化代码"
            @click.stop="formatCode"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 4h12M6 8h6m-6 4h12m-6 4h6m-6 4h12" />
            </svg>
          </button>
          <div class="relative">
            <button
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-white/80 text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-300 dark:bg-gray-900/70 dark:text-gray-400 dark:hover:border-violet-500/50 dark:hover:text-violet-300"
              type="button"
              title="选择主题"
              aria-label="选择主题"
              @click.stop="toggleThemeMenu"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                />
              </svg>
            </button>
            <transition name="fade">
              <div
                v-if="showThemeMenu"
                class="absolute right-0 z-20 mt-2 min-w-[9rem] overflow-hidden rounded-xl border border-gray-200 bg-white/95 text-sm shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/90"
              >
                <button
                  v-for="themeOption in themes"
                  :key="themeOption.value"
                  class="flex w-full items-center justify-between gap-2 px-4 py-2 text-left transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
                  type="button"
                  @click="selectTheme(themeOption.value)"
                >
                  <span>{{ themeOption.label }}</span>
                  <span v-if="theme === themeOption.value" class="text-xs text-indigo-500 dark:text-indigo-300">●</span>
                </button>
              </div>
            </transition>
          </div>
          <div class="relative">
            <button
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-white/80 text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 dark:bg-gray-900/70 dark:text-gray-400 dark:hover:border-amber-500/50 dark:hover:text-amber-300"
              type="button"
              title="模板示例"
              aria-label="模板示例"
              @click.stop="toggleTemplateMenu"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <transition name="fade">
              <div
                v-if="showTemplateMenu"
                class="absolute right-0 z-20 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-gray-200 bg-white/95 text-sm shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/90"
              >
                <button
                  v-for="templateOption in templateOptions"
                  :key="templateOption.label"
                  class="flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:hover:text-amber-200"
                  type="button"
                  @click="applyTemplate(templateOption.content)"
                >
                  <span>{{ templateOption.label }}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500">{{ templateOption.type }}</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
          <div class="relative flex h-full w-full">
            <div
              ref="lineNumbersRef"
              aria-hidden="true"
              class="pointer-events-none flex-shrink-0 overflow-hidden border-r border-white/40 bg-white/60 px-4 py-4 text-right font-mono text-sm leading-6 text-gray-400 dark:border-gray-800/60 dark:bg-gray-900/40 dark:text-gray-500 md:min-w-[3rem]"
            >
              <div v-for="line in lineNumbers" :key="line" class="tabular-nums">
                {{ line }}
              </div>
            </div>
            <textarea
              v-model="code"
              spellcheck="false"
              placeholder="在此粘贴或编写 Mermaid 代码..."
              class="flex-1 h-full resize-none overflow-auto bg-transparent px-5 py-4 pl-16 font-mono text-sm leading-6 text-gray-700 outline-none transition placeholder:text-gray-400 focus:bg-white/80 focus:shadow-inner dark:text-gray-100 dark:placeholder:text-gray-500"
              @scroll="syncScroll"
            ></textarea>
          </div>
        </div>
      </section>

      <section class="flex w-full flex-col overflow-hidden md:w-1/2">
        <div class="relative flex-1 overflow-auto p-8">
          <div
            ref="containerRef"
            class="relative flex min-h-full w-full items-start justify-center rounded-3xl border border-white/60 bg-gradient-to-br from-white/80 via-white/60 to-white/20 p-8 shadow-2xl ring-1 ring-black/5 transition dark:border-gray-800/60 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-800/40 dark:ring-white/10"
          >
            <div v-if="!hasDiagram && !errorMessage" class="w-full text-center text-sm text-gray-500 dark:text-gray-400">
              编辑左侧代码后，将自动在此处渲染 SVG 预览。
            </div>
            <div
              v-if="errorMessage"
              class="w-full max-w-md rounded-2xl border border-red-200/70 bg-red-50/80 p-4 text-sm text-red-600 shadow-sm dark:border-red-500/40 dark:bg-red-900/40 dark:text-red-200"
            >
              {{ errorMessage }}
            </div>
            <div ref="diagramRef" class="canvas-grid relative flex w-full justify-center rounded-2xl p-4"></div>
            <div
              v-if="isRendering"
              class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-white/60 text-sm text-gray-500 backdrop-blur-sm dark:bg-gray-900/60 dark:text-gray-300"
            >
              渲染中…
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import mermaid from 'mermaid'

const STORAGE_KEY = 'ddcherry-viewer:mermaid-code'
const THEME_KEY = 'ddcherry-viewer:mermaid-theme'
const DEFAULT_EXAMPLE = `graph TD;
  A[开始] --> B[处理]
  B --> C{条件?}
  C -->|是| D[结果1]
  C -->|否| E[结果2]
`

const containerRef = ref(null)
const diagramRef = ref(null)
const lineNumbersRef = ref(null)
const toolbarRef = ref(null)
const code = ref(DEFAULT_EXAMPLE)
const theme = ref('default')
const errorMessage = ref('')
const isRendering = ref(false)
const renderedSvg = ref('')
const showThemeMenu = ref(false)
const showTemplateMenu = ref(false)
let mounted = false
let renderTimer = null

const themes = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'forest', label: 'Forest' },
  { value: 'neutral', label: 'Neutral' }
]

const templateOptions = [
  {
    label: '基础流程图',
    type: 'Flowchart',
    content: `graph TD;
  A[开始] --> B{条件判断};
  B -- 是 --> C[处理 1];
  B -- 否 --> D[处理 2];
  C --> E[结束];
  D --> E;`
  },
  {
    label: '看板示例',
    type: 'Kanban',
    content: `flowchart LR;
  classDef column fill:#f5f5f5,stroke:#d1d5db,color:#111;
  backlog[(待办)]:::column --> doing[(进行中)]:::column --> done[(已完成)]:::column;
  subgraph backlog[ ]
    A[需求评审]
    B[原型设计]
  end
  subgraph doing[ ]
    C[接口联调]
  end
  subgraph done[ ]
    D[上线验收]
  end;`
  },
  {
    label: '序列图',
    type: 'Sequence',
    content: `sequenceDiagram
  participant 用户
  participant 系统
  用户->>系统: 提交请求
  系统-->>用户: 返回结果
  用户->>系统: 确认完成;`
  },
  {
    label: '甘特图',
    type: 'Gantt',
    content: `gantt
  dateFormat  YYYY-MM-DD
  title 项目计划
  section 规划阶段
    需求分析           :done,    des1, 2024-01-01,2024-01-05
    方案设计           :active,  des2, 2024-01-06, 5d
  section 执行阶段
    开发实现           :         des3, after des2, 7d
    测试验收           :         des4, after des3, 4d;`
  }
]

const hasDiagram = computed(() => Boolean(renderedSvg.value))
const lineNumbers = computed(() => {
  const totalLines = code.value.split('\n').length
  return Array.from({ length: Math.max(totalLines, 1) }, (_, index) => index + 1)
})

function syncScroll(event) {
  if (!lineNumbersRef.value) return
  lineNumbersRef.value.scrollTop = event.target.scrollTop
}

function scheduleRender() {
  if (renderTimer) {
    window.clearTimeout(renderTimer)
  }

  renderTimer = window.setTimeout(() => {
    renderTimer = null
    renderDiagram()
  }, 300)
}

function loadPersistedState() {
  if (typeof window === 'undefined') return

  const savedCode = window.localStorage.getItem(STORAGE_KEY)
  const savedTheme = window.localStorage.getItem(THEME_KEY)

  if (savedCode) {
    code.value = savedCode
  }

  if (savedTheme && themes.some((item) => item.value === savedTheme)) {
    theme.value = savedTheme
  }
}

function persistState(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, value)
}

async function renderDiagram() {
  if (!containerRef.value || !diagramRef.value) return

  if (renderTimer) {
    window.clearTimeout(renderTimer)
    renderTimer = null
  }

  if (!code.value.trim()) {
    renderedSvg.value = ''
    diagramRef.value.innerHTML = ''
    errorMessage.value = ''
    isRendering.value = false
    return
  }

  isRendering.value = true
  errorMessage.value = ''

  try {
    mermaid.initialize({ startOnLoad: false, theme: theme.value })
    const { svg } = await mermaid.render('mermaid-preview', code.value)
    renderedSvg.value = svg
    diagramRef.value.innerHTML = svg
    await nextTick()
    containerRef.value.classList.remove('animate-fadeIn')
    // Force reflow to restart animation when re-rendering
    void containerRef.value.offsetWidth
    containerRef.value.classList.add('animate-fadeIn')
  } catch (error) {
    renderedSvg.value = ''
    diagramRef.value.innerHTML = ''
    errorMessage.value = `渲染错误：${error?.message ?? '未知错误'}`
  } finally {
    isRendering.value = false
  }
}

function downloadBlob(data, type, filename) {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function exportSvg() {
  if (!hasDiagram.value) return
  downloadBlob(renderedSvg.value, 'image/svg+xml;charset=utf-8', 'diagram.svg')
}

async function exportPng() {
  if (!hasDiagram.value) return

  if (!diagramRef.value) return

  const svgElement = diagramRef.value.querySelector('svg')
  if (!svgElement) {
    errorMessage.value = '导出 PNG 失败：未找到 SVG 元素'
    return
  }

  try {
    const dataUrl = svgToDataUrl(svgElement)
    const image = await loadSvgImage(dataUrl)
    const { width, height } = getSvgDimensions(svgElement)
    const ratio = window.devicePixelRatio || 1
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(Math.round(width * ratio), 1)
    canvas.height = Math.max(Math.round(height * ratio), 1)
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('无法创建画布上下文')
    }

    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    const pngBlob = await canvasToBlob(canvas)
    const pngUrl = URL.createObjectURL(pngBlob)
    const link = document.createElement('a')
    link.href = pngUrl
    link.download = 'diagram.png'
    link.click()
    URL.revokeObjectURL(pngUrl)
  } catch (error) {
    errorMessage.value = `导出 PNG 失败：${error?.message ?? '未知错误'}`
  }
}

function svgToDataUrl(svgElement) {
  const sanitized = sanitizeSvg(svgElement)
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(sanitized)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
}

function sanitizeSvg(svgElement) {
  const clone = svgElement.cloneNode(true)

  clone.querySelectorAll('style').forEach((styleNode) => {
    styleNode.textContent = styleNode.textContent.replace(/@import\s+[^;]+;?/gi, '')
  })

  clone.querySelectorAll('link, script').forEach((node) => node.remove())

  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }

  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  }

  return clone
}

function getSvgDimensions(svgElement) {
  const width = parseSize(svgElement.getAttribute('width'))
  const height = parseSize(svgElement.getAttribute('height'))

  if (width && height) {
    return { width, height }
  }

  const viewBox = svgElement.getAttribute('viewBox')
  if (viewBox) {
    const values = viewBox.split(/[ ,]+/).map(Number)
    if (values.length === 4) {
      const [, , vbWidth, vbHeight] = values
      if (vbWidth && vbHeight) {
        return { width: vbWidth, height: vbHeight }
      }
    }
  }

  const rect = svgElement.getBoundingClientRect()
  if (rect.width && rect.height) {
    return { width: rect.width, height: rect.height }
  }

  return { width: 1024, height: 768 }
}

function parseSize(value) {
  if (!value || value.includes('%')) return null
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function loadSvgImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('SVG 图像加载失败'))
    image.src = dataUrl
  })
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('PNG 数据生成失败'))
      }
    }, 'image/png')
  })
}

function applyThemeToDocument(value) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', value === 'dark')
  document.documentElement.dataset.mermaidTheme = value
}

function formatCode() {
  const lines = code.value.split('\n')
  let indentLevel = 0
  const indentSize = 2
  const formatted = lines.map((line) => {
    const trimmed = line.trim()

    if (!trimmed) {
      return ''
    }

    const lowered = trimmed.toLowerCase()
    const decreaseBefore = /^(end|else|elif|case|when|catch|\}|\]|>)/.test(lowered)

    if (decreaseBefore) {
      indentLevel = Math.max(indentLevel - 1, 0)
    }

    const indent = ' '.repeat(indentLevel * indentSize)
    const result = `${indent}${trimmed}`

    const increaseAfter = /^(subgraph|loop|opt|alt|rect|par|state|section|case|when)\b/.test(lowered) || /\{\s*$/.test(trimmed)

    if (increaseAfter && !/\bend\b$/.test(lowered)) {
      indentLevel += 1
    }

    return result
  })

  code.value = formatted.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function toggleThemeMenu() {
  showThemeMenu.value = !showThemeMenu.value
  if (showThemeMenu.value) {
    showTemplateMenu.value = false
  }
}

function toggleTemplateMenu() {
  showTemplateMenu.value = !showTemplateMenu.value
  if (showTemplateMenu.value) {
    showThemeMenu.value = false
  }
}

function selectTheme(value) {
  theme.value = value
  showThemeMenu.value = false
}

function applyTemplate(templateContent) {
  code.value = templateContent
  showTemplateMenu.value = false
}

function handleGlobalClick(event) {
  if (!toolbarRef.value) return
  if (!toolbarRef.value.contains(event.target)) {
    showThemeMenu.value = false
    showTemplateMenu.value = false
  }
}

watch(
  code,
  (value) => {
    if (!mounted) return
    persistState(STORAGE_KEY, value)
    scheduleRender()
  }
)

watch(
  theme,
  (value) => {
    if (!mounted) return
    persistState(THEME_KEY, value)
    applyThemeToDocument(value)
    scheduleRender()
  }
)

onMounted(() => {
  mounted = true
  loadPersistedState()
  applyThemeToDocument(theme.value)
  document.addEventListener('click', handleGlobalClick)
  renderDiagram()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleGlobalClick)
  if (renderTimer) {
    window.clearTimeout(renderTimer)
    renderTimer = null
  }
})
</script>

<style scoped>
[data-mermaid-theme='dark'] {
  color-scheme: dark;
  background-color: #0f172a;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn svg {
  animation: fadeIn 0.5s ease-in-out;
}

.canvas-grid {
  background-image: linear-gradient(
      to right,
      rgba(148, 163, 184, 0.2) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px);
  background-size: 24px 24px;
}

.dark .canvas-grid {
  background-image: linear-gradient(
      to right,
      rgba(71, 85, 105, 0.35) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(71, 85, 105, 0.35) 1px, transparent 1px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
