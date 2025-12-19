import { ref, onMounted, onUnmounted } from 'vue'
import type { MockRule, NetworkLog } from '../types'

export function useWebSocket() {
  const rules = ref<MockRule[]>([])
  const logs = ref<NetworkLog[]>([])
  let ws: WebSocket | null = null

  function connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws = new WebSocket(`${protocol}//${location.host}/__network_mock_ws__`)

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'rules') {
        rules.value = msg.data || []
      } else if (msg.type === 'logs') {
        logs.value = msg.data || []
      } else if (msg.type === 'log') {
        logs.value.unshift(msg.data)
      }
    }

    ws.onclose = () => setTimeout(connect, 1000)
  }

  function send(type: string, data: any) {
    ws?.send(JSON.stringify({ type, data }))
  }

  const addRule = (rule: MockRule) => send('add-rule', rule)
  const updateRule = (rule: MockRule) => send('update-rule', rule)
  const toggleRule = (id: string) => send('toggle-rule', id)
  const deleteRule = (id: string) => send('delete-rule', id)
  const clearLogs = () => send('clear-logs', null)

  onMounted(connect)
  onUnmounted(() => ws?.close())

  return { rules, logs, addRule, updateRule, toggleRule, deleteRule, clearLogs }
}
