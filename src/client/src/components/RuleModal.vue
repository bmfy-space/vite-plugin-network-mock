<script setup lang="ts">
import { ref, reactive, inject, watch, computed } from 'vue'
import { useRuleModal } from '../composables/useRuleModal'
import { CodeEditor, MethodSelect } from './common'
import MockReferenceModal from './MockReferenceModal.vue'
import MockPreviewModal from './MockPreviewModal.vue'
import EditorExpandModal from './EditorExpandModal.vue'
import type { EditorView } from '@codemirror/view'

const { visible, isEdit, viewOnly, form, close } = useRuleModal()

const isFullscreen = ref(false)
const fullscreenTab = ref<'body' | 'headers'>('body')
const showPreview = ref(false)
const showMockRef = ref(false)
const responseEditorRef = ref<InstanceType<typeof CodeEditor>>()

function toggleFullscreen(tab: 'body' | 'headers') {
  fullscreenTab.value = tab
  isFullscreen.value = !isFullscreen.value
}

function handleMockInsert(syntax: string) {
  responseEditorRef.value?.insertAtCursor(syntax)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showPreview.value) showPreview.value = false
    else if (showMockRef.value) showMockRef.value = false
    else if (isFullscreen.value) isFullscreen.value = false
    else if (visible.value) close()
  }
}

watch(visible, (val) => {
  if (val) document.addEventListener('keydown', handleKeydown)
  else document.removeEventListener('keydown', handleKeydown)
})

const ws = inject<any>('ws')
const activeBodyTab = ref('body')

const errors = reactive({
  url: '', status: '', delay: '', response: '', headers: ''
})

function clearErrors() {
  errors.url = ''; errors.status = ''; errors.delay = ''; errors.response = ''; errors.headers = ''
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

  if (!form.url.trim()) { errors.url = 'URL Pattern is required'; isValid = false }
  if (!form.status || form.status < 100 || form.status > 599) { errors.status = 'Status must be between 100-599'; isValid = false }
  if (form.delay < 0) { errors.delay = 'Delay cannot be negative'; isValid = false }

  try { if (form.response.trim()) JSON.parse(form.response.trim()) }
  catch { errors.response = 'Response Body must be valid JSON'; isValid = false; activeBodyTab.value = 'body' }

  try { if (form.headers.trim()) JSON.parse(form.headers.trim()) }
  catch { errors.headers = 'Headers must be valid JSON'; isValid = false; if (!errors.response) activeBodyTab.value = 'headers' }

  return isValid
}

function save() {
  if (!validate()) return

  const rule = {
    id: form.id || Date.now().toString(36) + Math.random().toString(36).substring(2),
    url: form.url,
    method: form.method,
    status: form.status,
    delay: form.delay,
    response: JSON.parse(form.response.trim() || '{}'),
    headers: JSON.parse(form.headers.trim() || '{}'),
    enabled: form.enabled,
    createdAt: form.createdAt || Date.now()
  }

  if (isEdit.value) ws.updateRule(rule)
  else ws.addRule(rule)
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
            <MethodSelect v-model="form.method" :disabled="viewOnly" />
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
              <button v-if="activeBodyTab === 'body' && !viewOnly" class="action-btn" :class="{ active: showMockRef }" @click="showMockRef = !showMockRef" title="Mock.js Reference">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
                </svg>
              </button>
              <button v-if="activeBodyTab === 'body'" class="action-btn" @click="showPreview = true" title="Preview">
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
          <div v-show="activeBodyTab === 'body'" :class="{ 'has-error': errors.response }">
            <CodeEditor ref="responseEditorRef" v-model="form.response" :disabled="viewOnly" placeholder='{"code": 200, "data": {}}' />
          </div>
          <span v-if="errors.response && activeBodyTab === 'body'" class="form-error">{{ errors.response }}</span>
          <div v-show="activeBodyTab === 'headers'" :class="{ 'has-error': errors.headers }">
            <CodeEditor v-model="form.headers" :disabled="viewOnly" placeholder='{"Content-Type": "application/json"}' />
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
    <MockPreviewModal :visible="showPreview" :template="form.response" @close="showPreview = false" />

    <!-- Mock.js Reference Modal -->
    <MockReferenceModal :visible="showMockRef" @close="showMockRef = false" @insert="handleMockInsert" />

    <!-- Editor Expand Modal -->
    <EditorExpandModal 
      v-if="fullscreenTab === 'body'"
      v-model="form.response" 
      :visible="isFullscreen" 
      title="Response Body" 
      :disabled="viewOnly"
      placeholder='{"code": 200, "data": {}}'
      @close="isFullscreen = false" 
    />
    <EditorExpandModal 
      v-else
      v-model="form.headers" 
      :visible="isFullscreen" 
      title="Headers" 
      :disabled="viewOnly"
      placeholder='{"Content-Type": "application/json"}'
      @close="isFullscreen = false" 
    />
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
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  outline: none;
  background: white;
}
.form-input:disabled { background: var(--bg); cursor: not-allowed; }
.form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
.form-input.has-error { border-color: #ef4444; }
.form-error { display: block; font-size: 12px; color: #ef4444; margin-top: 4px; }
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
.has-error :deep(.editor-wrapper) { border-color: #ef4444; }
</style>
