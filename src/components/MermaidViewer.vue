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
      <div class="flex flex-wrap items-center gap-3">
        <button
          class="rounded-full border border-transparent bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-indigo-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          type="button"
          @click="resetToExample"
        >
          恢复示例
        </button>
        <button
          class="rounded-full border border-indigo-300/60 px-4 py-2 text-sm font-medium text-indigo-600 transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-200 dark:hover:bg-indigo-500/30 dark:focus:ring-offset-gray-900"
          type="button"
          :disabled="!hasDiagram"
          @click="exportSvg"
        >
          导出 SVG
        </button>
        <button
          class="rounded-full border border-sky-300/60 px-4 py-2 text-sm font-medium text-sky-600 transition-all duration-200 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-500/40 dark:bg-sky-500/20 dark:text-sky-200 dark:hover:bg-sky-500/30 dark:focus:ring-offset-gray-900"
          type="button"
          :disabled="!hasDiagram"
          @click="exportPng"
        >
          导出 PNG
        </button>
        <select
          v-model="theme"
          class="rounded-lg border border-gray-300 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200"
        >
          <option v-for="themeOption in themes" :key="themeOption.value" :value="themeOption.value">
            {{ themeOption.label }}
          </option>
        </select>
        <button
          class="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.03] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-offset-gray-900"
          type="button"
          :disabled="isRendering"
          @click="renderDiagram"
        >
          {{ isRendering ? '渲染中…' : '渲染图表' }}
        </button>
      </div>
    </header>

    <main class="flex flex-1 flex-col overflow-hidden md:flex-row">
      <section class="flex w-full flex-col overflow-hidden border-b border-white/40 bg-white/60 backdrop-blur md:w-1/2 md:border-b-0 md:border-r dark:border-gray-800/80 dark:bg-gray-900/50">
        <div class="flex items-center justify-between border-b border-white/40 px-5 py-4 text-gray-600 dark:border-gray-800/70 dark:text-gray-300">
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Mermaid 代码</h2>
            <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">支持实时语法高亮与主题切换。</p>
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
          <div class="relative flex h-full w-full">
            <div
              ref="lineNumbersRef"
              aria-hidden="true"
              class="pointer-events-none flex-shrink-0 overflow-hidden border-r border-white/40 bg-white/60 px-4 py-4 text-right font-mono text-xs leading-relaxed text-gray-400 dark:border-gray-800/60 dark:bg-gray-900/40 dark:text-gray-500 md:min-w-[3rem]"
            >
              <div v-for="line in lineNumbers" :key="line" class="tabular-nums">
                {{ line }}
              </div>
            </div>
            <textarea
              v-model="code"
              spellcheck="false"
              placeholder="在此粘贴或编写 Mermaid 代码..."
              class="flex-1 h-full resize-none overflow-auto bg-transparent px-5 py-4 pl-16 font-mono text-sm leading-relaxed text-gray-700 outline-none transition placeholder:text-gray-400 focus:bg-white/80 focus:shadow-inner dark:text-gray-100 dark:placeholder:text-gray-500"
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
              点击「渲染图表」按钮，即可在此处预览 SVG。
            </div>
            <div
              v-if="errorMessage"
              class="w-full max-w-md rounded-2xl border border-red-200/70 bg-red-50/80 p-4 text-sm text-red-600 shadow-sm dark:border-red-500/40 dark:bg-red-900/40 dark:text-red-200"
            >
              {{ errorMessage }}
            </div>
            <div ref="diagramRef" class="flex w-full justify-center"></div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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
const code = ref(DEFAULT_EXAMPLE)
const theme = ref('default')
const errorMessage = ref('')
const isRendering = ref(false)
const renderedSvg = ref('')
let mounted = false

const themes = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'forest', label: 'Forest' },
  { value: 'neutral', label: 'Neutral' }
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

function resetToExample() {
  code.value = DEFAULT_EXAMPLE
  renderDiagram()
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

watch(
  code,
  (value) => {
    if (!mounted) return
    persistState(STORAGE_KEY, value)
  }
)

watch(
  theme,
  (value) => {
    if (!mounted) return
    persistState(THEME_KEY, value)
    applyThemeToDocument(value)
    renderDiagram()
  }
)

onMounted(() => {
  mounted = true
  loadPersistedState()
  applyThemeToDocument(theme.value)
  renderDiagram()
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
</style>
