<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import type { MockRule } from '../types'
import { useRuleModal } from '../composables/useRuleModal'
import { SearchBox, MethodSelect, MethodBadge, ToggleSwitch } from './common'

interface WsContext {
  rules: Ref<MockRule[]>
  toggleRule: (id: string) => void
  deleteRule: (id: string) => void
}

const ws = inject<WsContext>('ws')!
const { openAdd, openEdit, openView } = useRuleModal()

const search = ref('')
const methodFilter = ref('')

const filteredRules = computed(() => {
  return ws.rules.value.filter((r: MockRule) => {
    if (search.value && !r.url.toLowerCase().includes(search.value.toLowerCase())) return false
    if (methodFilter.value && r.method !== methodFilter.value) return false
    return true
  }) as MockRule[]
})

function handleDelete(id: string) {
  if (confirm('Delete this rule?')) ws.deleteRule(id)
}

function handleToggle(rule: MockRule) {
  ws.toggleRule(rule.id)
}
</script>

<template>
  <div class="panel">
    <div class="toolbar">
      <SearchBox v-model="search" placeholder="Search URL..." />
      <MethodSelect v-model="methodFilter" show-all />
      <button class="btn btn-primary" @click="openAdd">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Add Rule
      </button>
    </div>
    <div class="list">
      <div v-if="!filteredRules.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <div>No mock rules yet</div>
      </div>
      <div v-for="rule in filteredRules" :key="rule.id" class="rule-item">
        <MethodBadge :method="rule.method" />
        <div class="rule-info">
          <div class="rule-url">{{ rule.url }}</div>
          <div class="rule-meta">Status: {{ rule.status }} · Delay: {{ rule.delay }}ms</div>
        </div>
        <ToggleSwitch :model-value="rule.enabled" @update:model-value="handleToggle(rule)" />
        <button class="btn btn-ghost btn-sm" @click="openView(rule)">View</button>
        <button class="btn btn-ghost btn-sm" @click="openEdit(rule)" title="Edit">Edit</button>
        <button class="btn btn-ghost btn-sm btn-danger" @click="handleDelete(rule.id)" title="Delete">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
  align-items: center;
}
.list {
  padding: 8px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
.list::-webkit-scrollbar { width: 6px; }
.list::-webkit-scrollbar-track { background: transparent; }
.list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
.list::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
.rule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius);
  margin-bottom: 4px;
  background: var(--bg);
}
.rule-info { flex: 1; }
.rule-url { font-family: 'SF Mono', Monaco, monospace; font-size: 13px; font-weight: 500; }
.rule-meta { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
</style>
