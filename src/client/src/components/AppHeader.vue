<script setup lang="ts">
import type { TabType } from '../types'

defineProps<{ activeTab: TabType }>()
const emit = defineEmits<{ 'update:activeTab': [value: TabType] }>()
</script>

<template>
  <div class="header">
    <div class="logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      Network Mock
    </div>
    <div class="tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'network' }"
        @click="emit('update:activeTab', 'network')"
      >Network</button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'rules' }"
        @click="emit('update:activeTab', 'rules')"
      >Rules</button>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
}
.logo svg { width: 28px; height: 28px; }
.tabs {
  display: inline-flex;
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 4px;
  box-shadow: var(--shadow);
}
.tab {
  padding: 8px 20px;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: 6px;
  transition: all 0.2s;
}
.tab:hover { color: var(--text); }
.tab.active { background: var(--primary); color: white; }
</style>
