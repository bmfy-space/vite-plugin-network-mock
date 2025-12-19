<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  tip?: string
  width?: string
  height?: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="sub-modal-overlay" @click.self="emit('close')">
      <div class="sub-modal" :style="{ maxWidth: width || '800px', height: height }">
        <div class="sub-modal-header">
          <span class="sub-modal-title">{{ title }}</span>
          <span v-if="tip" class="sub-modal-tip">{{ tip }}</span>
          <div class="sub-modal-actions">
            <slot name="actions" />
            <button class="sub-modal-close" @click="emit('close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="sub-modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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
.sub-modal {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 90%;
}
.sub-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.sub-modal-title { font-size: 16px; font-weight: 600; }
.sub-modal-tip { font-size: 12px; font-weight: 400; color: var(--text-muted); }
.sub-modal-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sub-modal-close {
  padding: 4px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}
.sub-modal-close:hover { background: var(--bg); color: var(--text); }
.sub-modal-body { flex: 1; overflow: hidden; }
</style>
