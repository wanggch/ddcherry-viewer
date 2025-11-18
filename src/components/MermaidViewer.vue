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
      <section
        :class="[
          'relative flex w-full flex-col overflow-hidden border-b border-white/40 bg-white/60 backdrop-blur md:w-1/2 md:border-b-0 md:border-r dark:border-gray-800/80 dark:bg-gray-900/50',
          showHistoryPanel ? 'md:pl-[22rem]' : ''
        ]"
      >
        <transition name="slide-panel">
          <aside v-if="showHistoryPanel" class="history-panel" role="complementary" aria-label="历史记录">
            <div class="flex items-center justify-between border-b border-white/40 px-4 py-3 text-sm font-medium text-gray-600 dark:border-gray-800/60 dark:text-gray-200">
              <div>
                <p class="text-base font-semibold text-gray-800 dark:text-gray-100">历史记录</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">按创建时间倒序排列</p>
              </div>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200/70 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:hover:bg-gray-800/60 dark:hover:text-gray-200"
                type="button"
                aria-label="关闭历史面板"
                @click.stop="closeHistoryPanel"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div ref="historyListRef" class="history-scroll" @scroll.passive="handleHistoryScroll">
              <div v-if="!historyItems.length && !historyLoading" class="rounded-2xl border border-dashed border-gray-200/80 bg-white/70 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                暂无历史记录，保存后即可在此查看。
              </div>
              <button
                v-for="entry in historyItems"
                :key="entry.id"
                class="history-item"
                type="button"
                @click="applyHistoryEntry(entry)"
              >
                <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{{ entry.displayDate }}</span>
                  <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">{{ entry.themeLabel }}</span>
                </div>
                <p class="mt-1 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {{ entry.title }}
                </p>
                <p class="mt-1 truncate text-left text-xs text-gray-500 dark:text-gray-400">
                  {{ entry.preview }}
                </p>
              </button>
              <div v-if="historyLoading" class="py-3 text-center text-xs text-gray-500 dark:text-gray-400">加载中…</div>
              <div v-else-if="!historyHasMore && historyItems.length" class="py-3 text-center text-xs text-gray-400">已显示全部</div>
            </div>
          </aside>
        </transition>
        <div
          ref="toolbarRef"
          class="flex flex-wrap items-center gap-1.5 border-b border-white/40 px-4 py-2 text-gray-600 dark:border-gray-800/70 dark:text-gray-300"
        >
          <button
            :class="[
              toolbarButtonClass,
              isSaving && 'flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-white/80 text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-900/70 dark:text-gray-400 dark:hover:border-blue-500/50 dark:hover:text-blue-300'
            ]"
            type="button"
            title="打开历史"
            aria-label="打开历史"
            @click.stop="toggleHistoryPanel"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 12h6m-6 4h4M7 12h.01M7 16h.01" />
            </svg>
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-white/80 text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:bg-gray-900/70 dark:text-gray-400 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300"
            type="button"
            :disabled="isSaving"
            title="保存"
            aria-label="保存"
            @click.stop="handleSave"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h9l4 4v12a2 2 0 01-2 2z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 3v5h8" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-8H7v8" />
            </svg>
          </button>
          <button
            :class="[
              toolbarButtonClass,
              !hasDiagram && 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:border-transparent hover:text-gray-500'
            ]"
            type="button"
            :disabled="!hasDiagram"
            title="导出 SVG"
            aria-label="导出 SVG"
            @click.stop="exportSvg"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 2v6h6" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-6" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 15l3 3 3-3" />
            </svg>
          </button>
          <button
            :class="[
              toolbarButtonClass,
              !hasDiagram && 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:border-transparent hover:text-gray-500'
            ]"
            type="button"
            :disabled="!hasDiagram"
            title="导出 PNG"
            aria-label="导出 PNG"
            @click.stop="exportPng"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <rect width="16" height="12" x="4" y="4" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 15-3.5-3.5a2 2 0 00-2.828 0L9 17" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m3 13 2.5-2.5a2 2 0 012.828 0L13 16" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v3" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m9.5 20.5 2.5 2.5 2.5-2.5" />
            </svg>
          </button>
          <button
            :class="toolbarButtonClass"
            type="button"
            title="格式化代码"
            aria-label="格式化代码"
            @click.stop="formatCode"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m18 16 4-4-4-4" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m6 8-4 4 4 4" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.5 4-5 16" />
            </svg>
          </button>
          <div class="relative">
            <button
              :class="toolbarButtonClass"
              type="button"
              title="选择主题"
              aria-label="选择主题"
              @click.stop="toggleThemeMenu"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19v2" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.22 4.22l1.42 1.42" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.36 18.36l1.42 1.42" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M1 12h2" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12h2" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.22 19.78l1.42-1.42" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.36 5.64l1.42-1.42" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9" />
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
              :class="toolbarButtonClass"
              type="button"
              title="模板示例"
              aria-label="模板示例"
              @click.stop="toggleTemplateMenu"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <rect width="8" height="8" x="3" y="3" rx="2" />
                <rect width="8" height="8" x="13" y="3" rx="2" />
                <rect width="8" height="8" x="3" y="13" rx="2" />
                <rect width="8" height="8" x="13" y="13" rx="2" />
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
        <transition name="fade">
          <div
            v-if="saveMessage"
            class="mx-5 mt-3 rounded-xl border px-4 py-3 text-sm"
            :class="saveMessageClass"
          >
            {{ saveMessage }}
          </div>
        </transition>
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
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="showLoginDialog"
          class="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div class="w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl dark:border-gray-700/60 dark:bg-gray-900/90">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">登录以保存图表</h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">请输入账号信息以继续保存当前 Mermaid 代码。</p>
              </div>
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200/60 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:hover:bg-gray-700/60 dark:hover:text-gray-200"
                type="button"
                :disabled="isLoggingIn"
                aria-label="关闭登录窗口"
                @click="closeLoginDialog"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form class="mt-6 space-y-4" @submit.prevent="submitLogin">
              <div>
                <label class="text-sm font-medium text-gray-600 dark:text-gray-300" for="login-username">用户名</label>
                <input
                  id="login-username"
                  v-model.trim="loginForm.username"
                  type="text"
                  autocomplete="username"
                  required
                  class="mt-1 w-full rounded-xl border border-gray-200 bg-white/90 px-4 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100"
                  placeholder="输入用户名"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600 dark:text-gray-300" for="login-password">密码</label>
                <input
                  id="login-password"
                  v-model.trim="loginForm.password"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="mt-1 w-full rounded-xl border border-gray-200 bg-white/90 px-4 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100"
                  placeholder="输入密码"
                />
              </div>
              <div v-if="loginError" class="rounded-xl border border-red-200/70 bg-red-50/80 px-4 py-2 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200">
                {{ loginError }}
              </div>
              <button
                class="flex w-full items-center justify-center rounded-xl border border-transparent bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                :disabled="isLoggingIn"
              >
                <svg
                  v-if="isLoggingIn"
                  class="-ml-1 mr-2 h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                {{ isLoggingIn ? '登录中…' : '登录' }}
              </button>
            </form>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import mermaid from 'mermaid'

const STORAGE_KEY = 'ddcherry-viewer:mermaid-code'
const THEME_KEY = 'ddcherry-viewer:mermaid-theme'
const HISTORY_KEY = 'ddcherry-viewer:history'
const HISTORY_PAGE_SIZE = 8
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
const historyListRef = ref(null)
const code = ref(DEFAULT_EXAMPLE)
const theme = ref('default')
const errorMessage = ref('')
const isRendering = ref(false)
const renderedSvg = ref('')
const isSaving = ref(false)
const showThemeMenu = ref(false)
const showTemplateMenu = ref(false)
const showHistoryPanel = ref(false)
const showLoginDialog = ref(false)
const isLoggingIn = ref(false)
const loginError = ref('')
const loginForm = reactive({ username: '', password: '' })
const currentUser = ref(null)
const saveMessage = ref('')
const saveMessageType = ref('info')
const historyItems = ref([])
const historyLoading = ref(false)
const historyPage = ref(1)
const historyHasMore = ref(true)
let mounted = false
let renderTimer = null
let cachedHistory = []

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
    测试验收           :         des4, after des3, 4d`
  }
]

const toolbarButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-white/70 text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:bg-gray-900/60 dark:text-gray-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200'

const hasDiagram = computed(() => Boolean(renderedSvg.value))
const isLoggedIn = computed(() => Boolean(currentUser.value))
const lineNumbers = computed(() => {
  const totalLines = code.value.split('\n').length
  return Array.from({ length: Math.max(totalLines, 1) }, (_, index) => index + 1)
})

const saveMessageClass = computed(() => {
  switch (saveMessageType.value) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-900/20 dark:text-emerald-200'
    case 'error':
      return 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200'
    default:
      return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-900/30 dark:text-sky-200'
  }
})

const themeLabelMap = computed(() =>
  themes.reduce((acc, item) => {
    acc[item.value] = item.label
    return acc
  }, {})
)

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

function setSaveStatus(type, message) {
  saveMessageType.value = type
  saveMessage.value = message
}

function clearSaveStatus() {
  saveMessage.value = ''
  saveMessageType.value = 'info'
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

async function validateMermaidCode() {
  const content = code.value.trim()

  if (!content) {
    setSaveStatus('error', '无法保存：请先输入 Mermaid 代码。')
    return false
  }

  try {
    mermaid.initialize({ startOnLoad: false, theme: theme.value })
    await mermaid.parse(content)
    return true
  } catch (error) {
    const message = error?.str ?? error?.message ?? '未知错误'
    setSaveStatus('error', `无法保存：Mermaid 代码存在错误（${message}）`)
    return false
  }
}

async function handleSave() {
  if (isSaving.value || isLoggingIn.value) return

  clearSaveStatus()

  const isValid = await validateMermaidCode()
  if (!isValid) {
    return
  }

  if (!isLoggedIn.value) {
    showLoginDialog.value = true
    setSaveStatus('info', '请先登录以保存当前图表。')
    return
  }

  await performSave({ skipValidation: true })
}

async function performSave({ skipValidation = false } = {}) {
  if (isSaving.value) return

  if (!skipValidation) {
    const isValid = await validateMermaidCode()
    if (!isValid) {
      return
    }
  }

  isSaving.value = true
  setSaveStatus('info', '正在保存图表…')

  try {
    const result = await saveDiagramRequest({
      code: code.value,
      theme: theme.value,
      svg: renderedSvg.value,
      lastRenderedAt: new Date().toISOString()
    })
    setSaveStatus('success', result?.message ?? '保存成功。')
    persistHistoryEntry({
      code: code.value,
      theme: theme.value,
      svg: renderedSvg.value,
      createdAt: result?.createdAt ?? new Date().toISOString(),
      title: result?.title
    })
    if (showHistoryPanel.value) {
      void loadHistory({ reset: true })
    }
  } catch (error) {
    setSaveStatus('error', `保存失败：${error?.message ?? '接口暂未实现'}`)
  } finally {
    isSaving.value = false
  }
}

async function saveDiagramRequest(payload) {
  const response = await fetch('/api/diagrams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    credentials: 'include'
  })

  if (!response.ok) {
    const message = await extractErrorMessage(response)
    throw new Error(message || `保存失败（${response.status}）`)
  }

  try {
    return await response.json()
  } catch (error) {
    console.warn('解析保存接口响应失败', error)
    return {}
  }
}

async function submitLogin() {
  if (isLoggingIn.value) return

  loginError.value = ''

  if (!loginForm.username || !loginForm.password) {
    loginError.value = '请输入用户名和密码'
    return
  }

  isLoggingIn.value = true

  try {
    const user = await loginUser({
      username: loginForm.username,
      password: loginForm.password
    })
    currentUser.value = user
    showLoginDialog.value = false
    loginForm.password = ''
    await performSave()
  } catch (error) {
    loginError.value = error?.message ?? '登录失败：未知错误'
  } finally {
    isLoggingIn.value = false
  }
}

function closeLoginDialog() {
  if (isLoggingIn.value) return
  showLoginDialog.value = false
  loginForm.password = ''
}

async function loginUser(credentials) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials),
    credentials: 'include'
  })

  if (!response.ok) {
    const message = await extractErrorMessage(response)
    throw new Error(message || `登录失败（${response.status}）`)
  }

  try {
    const data = await response.json()
    return data?.user ?? { username: credentials.username }
  } catch (error) {
    console.warn('解析登录响应失败', error)
    return { username: credentials.username }
  }
}

async function checkSession() {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      return
    }

    const data = await response.json()
    if (data?.user) {
      currentUser.value = data.user
    }
  } catch (error) {
    console.warn('会话状态检查失败', error)
  }
}

async function extractErrorMessage(response) {
  try {
    const data = await response.json()
    return data?.message ?? data?.error ?? ''
  } catch (error) {
    return ''
  }
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

function toggleHistoryPanel() {
  showHistoryPanel.value = !showHistoryPanel.value
  if (showHistoryPanel.value) {
    showThemeMenu.value = false
    showTemplateMenu.value = false
  }
}

function closeHistoryPanel() {
  showHistoryPanel.value = false
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

function readHistoryFromStorage() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item === 'object')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.warn('读取历史记录失败', error)
    return []
  }
}

function writeHistoryToStorage(list) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

function createHistoryId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `history-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function summarizeCodeSnippet(value) {
  const trimmed = value.trim()
  if (!trimmed) return '未命名图表'
  const firstLine = trimmed.split('\n')[0]
  return firstLine.length > 40 ? `${firstLine.slice(0, 40)}…` : firstLine
}

function persistHistoryEntry({ code: codeContent, theme: themeValue, svg, createdAt, title }) {
  if (!codeContent?.trim()) return
  const list = readHistoryFromStorage()
  const entry = {
    id: createHistoryId(),
    code: codeContent,
    theme: themeValue,
    svg,
    createdAt: createdAt || new Date().toISOString(),
    title: title || summarizeCodeSnippet(codeContent),
    preview: codeContent.split('\n').slice(0, 3).join(' ')
  }
  list.unshift(entry)
  const deduped = list.slice(0, 100)
  writeHistoryToStorage(deduped)
}

function decorateHistoryEntry(entry) {
  return {
    ...entry,
    displayDate: formatHistoryDate(entry.createdAt),
    themeLabel: themeLabelMap.value[entry.theme] || entry.theme || 'Default',
    preview: entry.preview || entry.code.split('\n').slice(0, 3).join(' '),
    title: entry.title || summarizeCodeSnippet(entry.code)
  }
}

function formatHistoryDate(value) {
  if (!value) return '未知时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function loadHistory({ reset = false } = {}) {
  if (historyLoading.value) return
  if (!historyHasMore.value && !reset) return

  historyLoading.value = true

  if (reset) {
    historyPage.value = 1
    historyItems.value = []
    historyHasMore.value = true
    cachedHistory = readHistoryFromStorage()
    if (historyListRef.value) {
      historyListRef.value.scrollTop = 0
    }
  }

  const start = (historyPage.value - 1) * HISTORY_PAGE_SIZE
  const end = start + HISTORY_PAGE_SIZE
  const slice = cachedHistory.slice(start, end).map(decorateHistoryEntry)
  historyItems.value = historyItems.value.concat(slice)
  historyHasMore.value = end < cachedHistory.length
  historyPage.value += 1

  historyLoading.value = false
}

function handleHistoryScroll(event) {
  if (!historyHasMore.value || historyLoading.value) return
  const target = event.target
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 40) {
    void loadHistory()
  }
}

function applyHistoryEntry(entry) {
  if (!entry) return
  code.value = entry.code
  if (entry.theme && entry.theme !== theme.value) {
    theme.value = entry.theme
  }
}

watch(
  code,
  (value) => {
    if (!mounted) return
    clearSaveStatus()
    persistState(STORAGE_KEY, value)
    scheduleRender()
  }
)

watch(
  theme,
  (value) => {
    if (!mounted) return
    clearSaveStatus()
    persistState(THEME_KEY, value)
    applyThemeToDocument(value)
    scheduleRender()
  }
)

watch(showLoginDialog, (value) => {
  if (value) {
    loginError.value = ''
  }
})

watch(showHistoryPanel, (value) => {
  if (value) {
    void loadHistory({ reset: true })
  }
})

onMounted(() => {
  mounted = true
  loadPersistedState()
  applyThemeToDocument(theme.value)
  document.addEventListener('click', handleGlobalClick)
  void checkSession()
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

.history-panel {
  position: absolute;
  inset: 0 auto 0 0;
  width: min(22rem, 100%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.15);
}

.dark .history-panel {
  border-color: rgba(15, 23, 42, 0.5);
  background-color: rgba(15, 23, 42, 0.92);
  box-shadow: 0 20px 40px rgba(2, 6, 23, 0.55);
}

.history-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  width: 100%;
  text-align: left;
  border-radius: 1rem;
  border: 1px solid rgba(203, 213, 225, 0.6);
  background: rgba(248, 250, 252, 0.9);
  padding: 0.85rem 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.history-item:hover,
.history-item:focus-visible {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.dark .history-item {
  border-color: rgba(51, 65, 85, 0.7);
  background: rgba(30, 41, 59, 0.7);
}

.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
