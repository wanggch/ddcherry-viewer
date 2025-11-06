<!-- src/components/MermaidViewer.vue - Mermaid 编辑与渲染核心组件。 -->
<template>
  <div class="h-full grid gap-4 p-4 md:grid-cols-2 bg-slate-100">
    <section class="flex flex-col rounded-lg bg-white p-4 shadow">
      <header class="mb-2 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-800">Mermaid 代码</h2>
        <button
          class="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-700"
          type="button"
          @click="resetToExample"
        >
          恢复示例
        </button>
      </header>
      <textarea
        v-model="code"
        class="h-full min-h-[340px] flex-1 resize-none rounded border border-slate-200 bg-slate-50 p-3 font-mono text-sm leading-relaxed text-slate-800 focus:border-sky-400 focus:outline-none"
        spellcheck="false"
        placeholder="在此粘贴 Mermaid 代码..."
      ></textarea>
    </section>

    <section class="flex flex-col rounded-lg bg-white p-4 shadow">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <button
          class="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          type="button"
          :disabled="isRendering"
          @click="renderDiagram"
        >
          {{ isRendering ? '渲染中...' : '渲染图表' }}
        </button>
        <button
          class="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          :disabled="!hasDiagram"
          @click="exportSvg"
        >
          导出 SVG
        </button>
        <button
          class="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          :disabled="!hasDiagram"
          @click="exportPng"
        >
          导出 PNG
        </button>
        <label class="ml-auto flex items-center gap-2 text-sm text-slate-600">
          主题
          <select
            v-model="theme"
            class="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
          >
            <option v-for="themeOption in themes" :key="themeOption.value" :value="themeOption.value">
              {{ themeOption.label }}
            </option>
          </select>
        </label>
      </div>

      <div
        ref="containerRef"
        class="relative flex-1 overflow-auto rounded border border-dashed border-slate-200 bg-slate-50 p-4"
      >
        <p v-if="!hasDiagram && !errorMessage" class="text-sm text-slate-500">
          点击“渲染图表”按钮，即可在此处预览 SVG。
        </p>
        <p v-if="errorMessage" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {{ errorMessage }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
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
const code = ref(DEFAULT_EXAMPLE)
const theme = ref('default')
const errorMessage = ref('')
const isRendering = ref(false)
const renderedSvg = ref('')
let mounted = false

const themes = [
  { value: 'default', label: 'Default' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'forest', label: 'Forest' },
  { value: 'dark', label: 'Dark' }
]

const hasDiagram = computed(() => Boolean(renderedSvg.value))

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
  if (!containerRef.value) return

  isRendering.value = true
  errorMessage.value = ''

  try {
    mermaid.initialize({ startOnLoad: false, theme: theme.value })
    const { svg } = await mermaid.render('mermaid-preview', code.value)
    renderedSvg.value = svg
    containerRef.value.innerHTML = svg
  } catch (error) {
    renderedSvg.value = ''
    containerRef.value.innerHTML = ''
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

  const svgContent = renderedSvg.value
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  try {
    const img = new Image()
    const loadImage = () =>
      new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

    await loadImage()

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const context = canvas.getContext('2d')
    context.drawImage(img, 0, 0)

    const pngUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = pngUrl
    link.download = 'diagram.png'
    link.click()
  } catch (error) {
    errorMessage.value = `导出 PNG 失败：${error?.message ?? '未知错误'}`
  } finally {
    URL.revokeObjectURL(url)
  }
}

function applyThemeToDocument(value) {
  if (typeof document === 'undefined') return
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
</style>
