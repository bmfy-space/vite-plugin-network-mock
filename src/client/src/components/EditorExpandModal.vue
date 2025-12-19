<script setup lang="ts">
import { SubModal, CodeEditor } from './common'

const model = defineModel<string>({ default: '' })

defineProps<{
  visible: boolean
  title: string
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <SubModal :visible="visible" :title="title" width="900px" height="80vh" @close="emit('close')">
    <div class="editor-body">
      <CodeEditor v-model="model" height="100%" :disabled="disabled" :placeholder="placeholder" />
    </div>
  </SubModal>
</template>

<style scoped>
.editor-body {
  height: calc(80vh - 60px);
  margin: 16px 20px 20px;
}
.editor-body :deep(.editor-wrapper) { height: 100%; }
</style>
