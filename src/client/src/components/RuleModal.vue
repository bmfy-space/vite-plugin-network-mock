<script setup lang="ts">
import { ref, reactive, inject, watch } from 'vue'
import { useRuleModal } from '../composables/useRuleModal'

const { visible, isEdit, form, close } = useRuleModal()
const ws = inject<any>('ws')
const activeBodyTab = ref('body')

// 表单校验错误信息
const errors = reactive({
  url: '',
  status: '',
  delay: '',
  response: '',
  headers: ''
})

// 清除所有错误
function clearErrors() {
  errors.url = ''
  errors.status = ''
  errors.delay = ''
  errors.response = ''
  errors.headers = ''
}

// 监听弹窗打开，清除错误状态
watch(visible, (val) => {
  if (val) {
    clearErrors()
    activeBodyTab.value = 'body'
  }
})

// 校验表单
function validate(): boolean {
  clearErrors()
  let isValid = true

  // URL Pattern 必填
  if (!form.url.trim()) {
    errors.url = 'URL Pattern 不能为空'
    isValid = false
  }

  // Status 校验 (100-599)
  if (!form.status || form.status < 100 || form.status > 599) {
    errors.status = '状态码必须在 100-599 之间'
    isValid = false
  }

  // Delay 校验 (非负数)
  if (form.delay < 0) {
    errors.delay = '延迟时间不能为负数'
    isValid = false
  }

  // Response Body JSON 校验
  try {
    if (form.response.trim()) {
      JSON.parse(form.response.trim())
    }
  } catch {
    errors.response = 'Response Body 必须是有效的 JSON 格式'
    isValid = false
    activeBodyTab.value = 'body'
  }

  // Headers JSON 校验
  try {
    if (form.headers.trim()) {
      JSON.parse(form.headers.trim())
    }
  } catch {
    errors.headers = 'Headers 必须是有效的 JSON 格式'
    isValid = false
    if (!errors.response) {
      activeBodyTab.value = 'headers'
    }
  }

  return isValid
}

function save() {
  if (!validate()) {
    return
  }

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
</script>

<template>
  <div class="modal-overlay" :class="{ active: visible }" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">{{ isEdit ? 'Edit' : 'Add' }} Mock Rule</div>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">URL Pattern</label>
          <input type="text" class="form-input" :class="{ 'has-error': errors.url }" v-model="form.url" placeholder="/api/users">
          <span v-if="errors.url" class="form-error">{{ errors.url }}</span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Method</label>
            <select class="form-select" v-model="form.method">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <input type="number" class="form-input" :class="{ 'has-error': errors.status }" v-model.number="form.status">
            <span v-if="errors.status" class="form-error">{{ errors.status }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Delay (ms)</label>
            <input type="number" class="form-input" :class="{ 'has-error': errors.delay }" v-model.number="form.delay">
            <span v-if="errors.delay" class="form-error">{{ errors.delay }}</span>
          </div>
        </div>
        <div class="form-group">
          <div class="tab-bar">
            <button class="tab-btn" :class="{ active: activeBodyTab === 'body', 'tab-error': errors.response }" @click="activeBodyTab = 'body'">Response Body</button>
            <button class="tab-btn" :class="{ active: activeBodyTab === 'headers', 'tab-error': errors.headers }" @click="activeBodyTab = 'headers'">Headers</button>
          </div>
          <textarea v-show="activeBodyTab === 'body'" class="form-textarea" :class="{ 'has-error': errors.response }" v-model="form.response" placeholder='{"code": 200, "data": {}}'></textarea>
          <span v-if="errors.response && activeBodyTab === 'body'" class="form-error">{{ errors.response }}</span>
          <textarea v-show="activeBodyTab === 'headers'" class="form-textarea" :class="{ 'has-error': errors.headers }" v-model="form.headers" placeholder='{"Content-Type": "application/json"}'></textarea>
          <span v-if="errors.headers && activeBodyTab === 'headers'" class="form-error">{{ errors.headers }}</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="close">Cancel</button>
        <button class="btn btn-primary" @click="save">Save Rule</button>
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
.modal-overlay.active { display: flex; }
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
.modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-title { font-size: 18px; font-weight: 600; }
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
.form-select {
  appearance: none;
  background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;
  padding-right: 36px;
  cursor: pointer;
}
.form-input:focus, .form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}
.form-textarea {
  width: 100%;
  min-height: 180px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}
.form-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}
.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.tab-bar { display: flex; gap: 4px; margin-bottom: 8px; }
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
.form-input.has-error, .form-textarea.has-error {
  border-color: #ef4444;
}
.form-input.has-error:focus, .form-textarea.has-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.form-error {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}
</style>
