<script setup lang="ts">
import { ref, watch } from 'vue'
import Mock from 'mockjs'
import { SubModal, CodeEditor } from './common'

const props = defineProps<{
  visible: boolean
  template: string
}>()

const emit = defineEmits<{
  close: []
}>()

const previewResult = ref('')
const previewError = ref('')

function generatePreview() {
  previewError.value = ''
  try {
    const template = JSON.parse(props.template.trim() || '{}')
    const result = Mock.mock(template)
    previewResult.value = JSON.stringify(result, null, 2)
  } catch (e: any) {
    previewError.value = e.message || 'Invalid JSON'
    previewResult.value = ''
  }
}

// Generate preview when modal opens
watch(() => props.visible, (val) => {
  if (val) generatePreview()
})
</script>

<template>
  <SubModal :visible="visible" title="Mock.js Preview" width="800px" height="75vh" @close="emit('close')">
    <template #actions>
      <button class="refresh-btn" @click="generatePreview" title="Refresh">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </template>
    <div class="preview-body">
      <div v-if="previewError" class="preview-error">{{ previewError }}</div>
      <CodeEditor v-else :model-value="previewResult" height="100%" disabled />
    </div>
  </SubModal>
</template>

<style scoped>
.preview-body {
  height: calc(75vh - 60px);
  margin: 16px 20px 20px;
}
.preview-body :deep(.editor-wrapper) {
  height: 100%;
  background: #282c34;
}
.preview-error { padding: 20px; color: #ef4444; font-size: 14px; }
.refresh-btn {
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
.refresh-btn:hover { border-color: var(--primary); color: var(--primary); }
</style>
