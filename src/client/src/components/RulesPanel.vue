<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import type { MockRule } from '../types'
import { useRuleModal } from '../composables/useRuleModal'

interface WsContext {
  rules: Ref<MockRule[]>
  toggleRule: (id: string) => void
  deleteRule: (id: string) => void
}

const ws = inject<WsContext>('ws')!
const { openAdd, openEdit } = useRuleModal()

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
</script>

<template>
  <div class="panel">
    <div class="toolbar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" class="search-input" v-model="search" placeholder="Search URL...">
      </div>
      <select class="select" v-model="methodFilter">
        <option value="">All Methods</option>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
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
        <span class="method-badge" :class="rule.method">{{ rule.method }}</span>
        <div class="rule-info">
          <div class="rule-url">{{ rule.url }}</div>
          <div class="rule-meta">Status: {{ rule.status }} · Delay: {{ rule.delay }}ms</div>
        </div>
        <label class="toggle" @click.stop>
          <input type="checkbox" :checked="rule.enabled" @change="ws.toggleRule(rule.id)">
          <span class="toggle-track"></span>
          <span class="toggle-thumb"></span>
        </label>
        <button class="btn btn-ghost btn-sm" @click="openEdit(rule)">Edit</button>
        <button class="btn btn-ghost btn-sm btn-danger" @click="handleDelete(rule.id)">Delete</button>
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
.search-box { flex: 1; min-width: 200px; position: relative; }
.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}
.search-input { width: 100%; padding-left: 38px; }
.select {
  padding: 9px 32px 9px 12px;
  background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center;
  appearance: none;
  cursor: pointer;
}
.list {
  padding: 8px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
.list::-webkit-scrollbar {
  width: 6px;
}
.list::-webkit-scrollbar-track {
  background: transparent;
}
.list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
.list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
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
.toggle { position: relative; width: 40px; height: 22px; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
.toggle-track {
  position: absolute;
  inset: 0;
  background: #cbd5e1;
  border-radius: 11px;
  transition: background 0.2s;
}
.toggle-thumb {
  position: absolute;
  width: 18px;
  height: 18px;
  left: 2px;
  top: 2px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle input:checked + .toggle-track { background: var(--primary); }
.toggle input:checked ~ .toggle-thumb { transform: translateX(18px); }
</style>
