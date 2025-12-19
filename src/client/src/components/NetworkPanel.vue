<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import type { NetworkLog, MockRule } from '../types'
import { stringifyJSON } from '../utils/json'
import { useRuleModal } from '../composables/useRuleModal'
import { SearchBox, MethodSelect, MethodBadge, CodeEditor } from './common'

interface WsContext {
  rules: Ref<MockRule[]>
  logs: Ref<NetworkLog[]>
  clearLogs: () => void
}

const ws = inject<WsContext>('ws')!
const { openEdit, openFromLog } = useRuleModal()

const search = ref('')
const methodFilter = ref('')
const mockFilter = ref('')
const expandedId = ref<string | null>(null)

function findExistingRule(url: string, method: string) {
  return ws.rules.value.find(r => r.method === method && url.includes(r.url))
}

function getDeduplicatedLogs(logs: NetworkLog[]) {
  const seen = new Map<string, boolean>()
  const result: NetworkLog[] = []
  for (const log of logs) {
    const key = `${log.method}:${log.url}`
    if (log.isMocked) {
      if (!seen.has(key)) { seen.set(key, true); result.push(log) }
    } else { result.push(log) }
  }
  return result
}

const filteredLogs = computed(() => {
  let filtered = ws.logs.value.filter(log => {
    if (search.value && !log.url.toLowerCase().includes(search.value.toLowerCase())) return false
    if (methodFilter.value && log.method !== methodFilter.value) return false
    if (mockFilter.value === 'mocked' && !log.isMocked) return false
    if (mockFilter.value === 'real' && log.isMocked) return false
    return true
  })
  return getDeduplicatedLogs(filtered)
})

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div class="panel">
    <div class="toolbar">
      <SearchBox v-model="search" placeholder="Search URL..." />
      <MethodSelect v-model="methodFilter" show-all />
      <select class="select" v-model="mockFilter">
        <option value="">All Status</option>
        <option value="mocked">Mocked</option>
        <option value="real">Real</option>
      </select>
      <button class="btn btn-ghost" @click="ws.clearLogs()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
        Clear
      </button>
    </div>
    <div class="list">
      <div v-if="!filteredLogs.length" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        <div>No network requests yet</div>
      </div>
      <div 
        v-for="log in filteredLogs" 
        :key="log.id" 
        class="list-item"
        :class="{ expanded: expandedId === log.id }"
        @click="toggleExpand(log.id)"
      >
        <div class="item-header">
          <span class="status-code" :class="log.status >= 200 && log.status < 300 ? 'success' : 'error'">{{ log.status }}</span>
          <MethodBadge :method="log.method" />
          <span class="item-url">{{ log.url }}</span>
          <span class="tag" :class="log.isMocked ? 'tag-mock' : 'tag-real'">{{ log.isMocked ? 'MOCK' : 'REAL' }}</span>
          <div class="item-actions" @click.stop>
            <button v-if="findExistingRule(log.url, log.method)" class="btn btn-ghost btn-sm" @click="openEdit(findExistingRule(log.url, log.method)!)">Edit</button>
            <button v-else class="btn btn-primary btn-sm" @click="openFromLog(log)">+ Mock</button>
          </div>
        </div>
        <div class="item-meta">
          <span>{{ log.duration }}ms</span>
          <span>{{ log.timestamp }}</span>
        </div>
        <div class="item-detail" @click.stop>
          <div v-if="log.requestBody" class="detail-section">
            <div class="detail-label">Request Body</div>
            <CodeEditor :model-value="stringifyJSON(log.requestBody)" height="200px" disabled />
          </div>
          <div class="detail-section">
            <div class="detail-label">Response Body</div>
            <CodeEditor :model-value="stringifyJSON(log.responseBody)" height="280px" disabled />
          </div>
        </div>
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
.select {
  padding: 9px 32px 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  outline: none;
  background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center;
  appearance: none;
  cursor: pointer;
}
.select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
.list {
  padding: 8px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
.list::-webkit-scrollbar { width: 6px; }
.list::-webkit-scrollbar-track { background: transparent; }
.list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
.list::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
.list-item {
  padding: 14px 16px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
}
.list-item:hover { background: var(--bg); }
.list-item.expanded { background: #f1f5f9; }
.item-header { display: flex; align-items: center; gap: 12px; }
.status-code { font-weight: 600; font-size: 13px; min-width: 32px; }
.status-code.success { color: var(--success); }
.status-code.error { color: var(--danger); }
.item-url {
  flex: 1;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  padding-left: 44px;
  font-size: 12px;
  color: var(--text-muted);
}
.item-actions { display: flex; gap: 8px; margin-left: auto; }
.item-detail {
  display: none;
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.list-item.expanded .item-detail { display: block; }
.detail-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.detail-section { margin-bottom: 12px; }
.detail-section:last-child { margin-bottom: 0; }
</style>
