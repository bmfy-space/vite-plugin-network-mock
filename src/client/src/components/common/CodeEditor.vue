<script setup lang="ts">
import { shallowRef } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import type { EditorView } from '@codemirror/view'

const model = defineModel<string>({ default: '' })

defineProps<{
  height?: string
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  ready: [view: EditorView]
}>()

const extensions = [json(), oneDark]
const editorView = shallowRef<EditorView>()

function handleReady(payload: { view: EditorView }) {
  editorView.value = payload.view
  emit('ready', payload.view)
}

function insertAtCursor(text: string) {
  if (editorView.value) {
    const view = editorView.value
    const state = view.state
    const selection = state.selection.main
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: text },
      selection: { anchor: selection.from + text.length }
    })
    view.focus()
  } else {
    model.value = model.value + text
  }
}

defineExpose({ insertAtCursor, editorView })
</script>

<template>
  <div class="editor-wrapper">
    <Codemirror 
      v-model="model" 
      :extensions="extensions" 
      :style="{ height: height || '240px' }" 
      :disabled="disabled" 
      :placeholder="placeholder"
      @ready="handleReady" 
    />
  </div>
</template>

<style scoped>
.editor-wrapper {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.editor-wrapper:focus-within { 
  border-color: var(--primary); 
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); 
}
.editor-wrapper :deep(.cm-editor) { font-size: 13px; }
.editor-wrapper :deep(.cm-scroller) { font-family: 'SF Mono', Monaco, monospace; }
</style>
