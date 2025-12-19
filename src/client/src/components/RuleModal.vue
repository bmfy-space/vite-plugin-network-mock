<script setup lang="ts">
import { ref, reactive, inject, watch, computed, shallowRef } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import type { EditorView } from '@codemirror/view'
import Mock from 'mockjs'
import { useRuleModal } from '../composables/useRuleModal'

const { visible, isEdit, viewOnly, form, close } = useRuleModal()

const extensions = [json(), oneDark]
const isFullscreen = ref(false)
const fullscreenTab = ref<'body' | 'headers'>('body')
const showPreview = ref(false)
const previewResult = ref('')
const previewError = ref('')
const showMockRef = ref(false)

// CodeMirror editor view reference
const responseEditorView = shallowRef<EditorView>()

function handleEditorReady(payload: { view: EditorView }) {
  responseEditorView.value = payload.view
}

// Mock.js syntax reference
const mockRules = [
  { category: 'Basic', rules: [
    { syntax: '@boolean', desc: 'Random boolean', example: 'true' },
    { syntax: '@natural(min?, max?)', desc: 'Natural number', example: '123' },
    { syntax: '@integer(min?, max?)', desc: 'Integer', example: '-5' },
    { syntax: '@float(min, max, dmin?, dmax?)', desc: 'Float number', example: '3.14' },
    { syntax: '@string(pool?, min?, max?)', desc: 'Random string', example: 'abc' },
  ]},
  { category: 'Date', rules: [
    { syntax: '@date(format?)', desc: 'Date string', example: '2023-01-15' },
    { syntax: '@time(format?)', desc: 'Time string', example: '14:30:00' },
    { syntax: '@datetime(format?)', desc: 'Datetime string', example: '2023-01-15 14:30:00' },
    { syntax: '@now(unit?, format?)', desc: 'Current time', example: '2023-12-20' },
  ]},
  { category: 'Image', rules: [
    { syntax: '@image(size?, bg?, fg?, format?, text?)', desc: 'Image URL', example: 'http://...' },
    { syntax: '@dataImage(size?, text?)', desc: 'Base64 image', example: 'data:image/...' },
  ]},
  { category: 'Color', rules: [
    { syntax: '@color', desc: 'Hex color', example: '#79f2a3' },
    { syntax: '@rgb', desc: 'RGB color', example: 'rgb(121,242,163)' },
    { syntax: '@rgba', desc: 'RGBA color', example: 'rgba(121,242,163,0.5)' },
  ]},
  { category: 'Text', rules: [
    { syntax: '@paragraph(min?, max?)', desc: 'Paragraph', example: 'Lorem ipsum...' },
    { syntax: '@sentence(min?, max?)', desc: 'Sentence', example: 'Hello world.' },
    { syntax: '@word(min?, max?)', desc: 'Word', example: 'hello' },
    { syntax: '@title(min?, max?)', desc: 'Title', example: 'Hello World' },
    { syntax: '@cparagraph', desc: 'Chinese paragraph', example: '中文段落...' },
    { syntax: '@csentence', desc: 'Chinese sentence', example: '中文句子。' },
    { syntax: '@cword(pool?, min?, max?)', desc: 'Chinese word', example: '中文' },
    { syntax: '@ctitle', desc: 'Chinese title', example: '中文标题' },
  ]},
  { category: 'Name', rules: [
    { syntax: '@first', desc: 'First name', example: 'John' },
    { syntax: '@last', desc: 'Last name', example: 'Doe' },
    { syntax: '@name(middle?)', desc: 'Full name', example: 'John Doe' },
    { syntax: '@cfirst', desc: 'Chinese first name', example: '明' },
    { syntax: '@clast', desc: 'Chinese last name', example: '张' },
    { syntax: '@cname', desc: 'Chinese full name', example: '张明' },
  ]},
  { category: 'Web', rules: [
    { syntax: '@url(protocol?, host?)', desc: 'URL', example: 'http://example.com' },
    { syntax: '@domain(tld?)', desc: 'Domain', example: 'example.com' },
    { syntax: '@email(domain?)', desc: 'Email', example: 'test@example.com' },
    { syntax: '@ip', desc: 'IP address', example: '192.168.1.1' },
  ]},
  { category: 'Address', rules: [
    { syntax: '@region', desc: 'Region', example: 'East' },
    { syntax: '@province', desc: 'Province', example: 'California' },
    { syntax: '@city(prefix?)', desc: 'City', example: 'Los Angeles' },
    { syntax: '@county(prefix?)', desc: 'County', example: 'Orange County' },
    { syntax: '@zip', desc: 'Zip code', example: '90210' },
  ]},
  { category: 'Helper', rules: [
    { syntax: '@guid', desc: 'GUID', example: 'xxxxxxxx-xxxx-...' },
    { syntax: '@id', desc: 'ID (18 digits)', example: '123456789012345678' },
    { syntax: '@increment(step?)', desc: 'Auto increment', example: '1, 2, 3...' },
  ]},
  { category: 'Array Rules', rules: [
    { syntax: '"list|count": [{}]', desc: 'Fixed count array', example: '5 items' },
    { syntax: '"list|min-max": [{}]', desc: 'Random count array', example: '1-10 items' },
    { syntax: '"id|+1": 1', desc: 'Auto increment', example: '1, 2, 3...' },
    { syntax: '"status|1": [0,1]', desc: 'Pick one from array', example: '0 or 1' },
  ]},
]

function toggleFullscreen(tab: 'body' | 'headers') {
  fullscreenTab.value = tab
  isFullscreen.value = !isFullscreen.value
}

function closeFullscreen() {
  isFullscreen.value = false
}

function generatePreview() {
  previewError.value = ''
  try {
    const template = JSON.parse(form.response.trim() || '{}')
    const result = Mock.mock(template)
    previewResult.value = JSON.stringify(result, null, 2)
    showPreview.value = true
  } catch (e: any) {
    previewError.value = e.message || 'Invalid JSON'
    previewResult.value = ''
    showPreview.value = true
  }
}

function closePreview() {
  showPreview.value = false
}

function insertMockSyntax(syntax: string) {
  const textToInsert = syntax.replace(/\(.*\)/, '').replace(/\?/g, '')
  
  if (responseEditorView.value) {
    const view = responseEditorView.value
    const state = view.state
    const selection = state.selection.main
    
    // Insert at cursor position
    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: textToInsert
      },
      selection: { anchor: selection.from + textToInsert.length }
    })
    view.focus()
  } else {
    // Fallback: append to end
    form.response = form.response + textToInsert
  }
  // Close mock reference after insert
  showMockRef.value = false
}

// Handle ESC key to close modals
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showPreview.value) {
      showPreview.value = false
    } else if (showMockRef.value) {
      showMockRef.value = false
    } else if (isFullscreen.value) {
      isFullscreen.value = false
    } else if (visible.value) {
      close()
    }
  }
}

watch(visible, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

const ws = inject<any>('ws')
const activeBodyTab = ref('body')

const errors = reactive({
  url: '',
  status: '',
  delay: '',
  response: '',
  headers: ''
})

function clearErrors() {
  errors.url = ''
  errors.status = ''
  errors.delay = ''
  errors.response = ''
  errors.headers = ''
}

watch(visible, (val) => {
  if (val) {
    clearErrors()
    activeBodyTab.value = 'body'
    showPreview.value = false
    showMockRef.value = false
  }
})

function validate(): boolean {
  clearErrors()
  let isValid = true

  if (!form.url.trim()) {
    errors.url = 'URL Pattern is required'
    isValid = false
  }

  if (!form.status || form.status < 100 || form.status > 599) {
    errors.status = 'Status must be between 100-599'
    isValid = false
  }

  if (form.delay < 0) {
    errors.delay = 'Delay cannot be negative'
    isValid = false
  }

  try {
    if (form.response.trim()) {
      JSON.parse(form.response.trim())
    }
  } catch {
    errors.response = 'Response Body must be valid JSON'
    isValid = false
    activeBodyTab.value = 'body'
  }

  try {
    if (form.headers.trim()) {
      JSON.parse(form.headers.trim())
    }
  } catch {
    errors.headers = 'Headers must be valid JSON'
    isValid = false
    if (!errors.response) {
      activeBodyTab.value = 'headers'
    }
  }

  return isValid
}

function save() {
  if (!validate()) return

  const response = JSON.parse(form.response.trim() || '{}')
  const headers = JSON.parse(form.headers.trim() || '{}')

  const rule = {
    id: form.id || Date.now().toString(36) + Math.random().toString(36).substring(2),
    url: form.url,
    method: form.method,
    status: form.status,
    delay: form.delay,
    response,
    headers,
    enabled: form.enabled,
    createdAt: form.createdAt || Date.now()
  }

  if (isEdit.value) {
    ws.updateRule(rule)
  } else {
    ws.addRule(rule)
  }
  close()
}

const modalTitle = computed(() => {
  if (viewOnly.value) return 'View Mock Rule'
  return isEdit.value ? 'Edit Mock Rule' : 'Add Mock Rule'
})
</script>

<template>
  <div class="modal-overlay" :class="{ active: visible }">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">{{ modalTitle }}</div>
        <button class="modal-close" @click="close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">URL Pattern</label>
          <input type="text" class="form-input" :class="{ 'has-error': errors.url }" v-model="form.url" placeholder="/api/users" :disabled="viewOnly">
          <span v-if="errors.url" class="form-error">{{ errors.url }}</span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Method</label>
            <select class="form-select" v-model="form.method" :disabled="viewOnly">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <input type="number" class="form-input" :class="{ 'has-error': errors.status }" v-model.number="form.status" :disabled="viewOnly">
            <span v-if="errors.status" class="form-error">{{ errors.status }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Delay (ms)</label>
            <input type="number" class="form-input" :class="{ 'has-error': errors.delay }" v-model.number="form.delay" :disabled="viewOnly">
            <span v-if="errors.delay" class="form-error">{{ errors.delay }}</span>
          </div>
        </div>
        <div class="form-group">
          <div class="tab-bar">
            <div class="tab-left">
              <button class="tab-btn" :class="{ active: activeBodyTab === 'body', 'tab-error': errors.response }" @click="activeBodyTab = 'body'">Response Body</button>
              <button class="tab-btn" :class="{ active: activeBodyTab === 'headers', 'tab-error': errors.headers }" @click="activeBodyTab = 'headers'">Headers</button>
            </div>
            <div class="tab-right">
              <button v-if="activeBodyTab === 'body'" class="action-btn" :class="{ active: showMockRef }" @click="showMockRef = !showMockRef" title="Mock.js Reference">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
                </svg>
              </button>
              <button v-if="activeBodyTab === 'body'" class="action-btn" @click="generatePreview" title="Preview">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button class="action-btn" @click="toggleFullscreen(activeBodyTab as 'body' | 'headers')" title="Fullscreen">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              </button>
            </div>
          </div>
          <div v-show="activeBodyTab === 'body'" class="editor-wrapper" :class="{ 'has-error': errors.response }">
            <Codemirror v-model="form.response" :extensions="extensions" :style="{ height: '240px' }" :disabled="viewOnly" placeholder='{"code": 200, "data": {}}' @ready="handleEditorReady" />
          </div>
          <span v-if="errors.response && activeBodyTab === 'body'" class="form-error">{{ errors.response }}</span>
          <div v-show="activeBodyTab === 'headers'" class="editor-wrapper" :class="{ 'has-error': errors.headers }">
            <Codemirror v-model="form.headers" :extensions="extensions" :style="{ height: '240px' }" :disabled="viewOnly" placeholder='{"Content-Type": "application/json"}' />
          </div>
          <span v-if="errors.headers && activeBodyTab === 'headers'" class="form-error">{{ errors.headers }}</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="close">{{ viewOnly ? 'Close' : 'Cancel' }}</button>
        <button v-if="!viewOnly" class="btn btn-primary" @click="save">Save Rule</button>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="sub-modal-overlay">
      <div class="sub-modal preview-modal">
        <div class="sub-modal-header">
          <span class="sub-modal-title">Mock.js Preview</span>
          <button class="sub-modal-close" @click="closePreview">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="preview-modal-body">
          <button class="preview-refresh-btn" @click="generatePreview" title="Refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
          <div v-if="previewError" class="preview-error">{{ previewError }}</div>
          <Codemirror v-else :model-value="previewResult" :extensions="extensions" :style="{ height: '100%' }" :disabled="true" />
        </div>
      </div>
    </div>

    <!-- Mock.js Reference Modal -->
    <div v-if="showMockRef" class="sub-modal-overlay">
      <div class="sub-modal mock-ref-modal">
        <div class="sub-modal-header">
          <span class="sub-modal-title">Mock.js Reference</span>
          <span class="sub-modal-tip">Click to insert at cursor</span>
          <button class="sub-modal-close" @click="showMockRef = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="mock-ref-body">
          <div v-for="cat in mockRules" :key="cat.category" class="mock-category">
            <div class="category-title">{{ cat.category }}</div>
            <div class="mock-rules-grid">
              <div v-for="rule in cat.rules" :key="rule.syntax" class="mock-rule-item" @click="insertMockSyntax(rule.syntax)">
                <code class="rule-syntax">{{ rule.syntax }}</code>
                <span class="rule-desc">{{ rule.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Modal (larger view, not fullscreen) -->
    <div v-if="isFullscreen" class="sub-modal-overlay">
      <div class="sub-modal editor-modal">
        <div class="sub-modal-header">
          <span class="sub-modal-title">{{ fullscreenTab === 'body' ? 'Response Body' : 'Headers' }}</span>
          <button class="sub-modal-close" @click="closeFullscreen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="editor-modal-body">
          <Codemirror v-if="fullscreenTab === 'body'" v-model="form.response" :extensions="extensions" :style="{ height: '100%' }" :disabled="viewOnly" placeholder='{"code": 200, "data": {}}' />
          <Codemirror v-else v-model="form.headers" :extensions="extensions" :style="{ height: '100%' }" :disabled="viewOnly" placeholder='{"Content-Type": "application/json"}' />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal-overlay.active { display: flex; gap: 16px; }
.modal {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 640px;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.modal-title { font-size: 16px; font-weight: 600; }
.modal-close {
  padding: 4px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--bg); color: var(--text); }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.form-group { margin-bottom: 20px; }
.form-group:last-child { margin-bottom: 0; }
.form-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
.form-input, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  outline: none;
  background: white;
}
.form-input:disabled, .form-select:disabled { background: var(--bg); cursor: not-allowed; }
.form-select {
  appearance: none;
  background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;
  padding-right: 36px;
  cursor: pointer;
}
.form-input:focus, .form-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
.editor-wrapper {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.editor-wrapper:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
.editor-wrapper.has-error { border-color: #ef4444; }
.editor-wrapper :deep(.cm-editor) { font-size: 13px; }
.editor-wrapper :deep(.cm-scroller) { font-family: 'SF Mono', Monaco, monospace; }
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  background: white;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}
.action-btn:hover { border-color: var(--primary); color: var(--primary); }
.action-btn.active { background: var(--primary); border-color: var(--primary); color: white; }
.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.tab-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.tab-left { display: flex; gap: 4px; }
.tab-right { display: flex; align-items: center; gap: 6px; }
.tab-btn {
  padding: 6px 14px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.tab-btn:hover { background: var(--bg); }
.tab-btn.active { background: var(--primary); color: white; }
.tab-btn.tab-error { color: #ef4444; }
.tab-btn.tab-error.active { background: #ef4444; color: white; }
.form-input.has-error { border-color: #ef4444; }
.form-error { display: block; font-size: 12px; color: #ef4444; margin-top: 4px; }
/* Sub Modal Overlay */
.sub-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}
/* Sub Modal Base */
.sub-modal {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sub-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.sub-modal-title {
  font-size: 16px;
  font-weight: 600;
}
.sub-modal-tip {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
}
.sub-modal-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sub-modal-close {
  margin-left: auto;
  padding: 4px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}
.sub-modal-close:hover { background: var(--bg); color: var(--text); }
.sub-modal-actions .sub-modal-close {
  margin-left: 0;
}
/* Preview Modal */
.preview-modal {
  width: 90%;
  max-width: 800px;
  height: 75vh;
}
.preview-modal-body {
  position: relative;
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin: 16px 20px 20px;
  background: #282c34;
}
.preview-modal-body :deep(.cm-editor) { height: 100%; font-size: 13px; }
.preview-modal-body :deep(.cm-scroller) { font-family: 'SF Mono', Monaco, monospace; }
.preview-refresh-btn {
  position: absolute;
  top: 16px;
  right: 24px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(40, 44, 52, 0.9);
  color: #abb2bf;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}
.preview-refresh-btn:hover {
  border-color: #61afef;
  color: #61afef;
  background: rgba(40, 44, 52, 1);
}
.preview-error { padding: 20px; color: #ef4444; font-size: 14px; }
/* Editor Modal (expanded view) */
.editor-modal {
  width: 90%;
  max-width: 900px;
  height: 80vh;
}
.editor-modal-body {
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin: 16px 20px 20px;
}
.editor-modal-body :deep(.cm-editor) { height: 100%; font-size: 13px; }
.editor-modal-body :deep(.cm-scroller) { font-family: 'SF Mono', Monaco, monospace; }
/* Mock.js Reference Modal */
.mock-ref-modal {
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
}
.mock-ref-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.mock-category { min-width: 0; }
.category-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.mock-rules-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mock-rule-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.mock-rule-item:hover { background: var(--bg); }
.rule-syntax {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  color: var(--primary);
  word-break: break-all;
}
.rule-desc {
  font-size: 11px;
  color: var(--text-muted);
}

</style>
