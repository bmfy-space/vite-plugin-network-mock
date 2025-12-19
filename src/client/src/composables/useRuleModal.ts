import { ref, reactive } from 'vue'
import type { MockRule, NetworkLog } from '../types'

const visible = ref(false)
const isEdit = ref(false)
const viewOnly = ref(false)

const form = reactive({
  id: '',
  url: '',
  method: 'GET',
  status: 200,
  delay: 0,
  response: '',
  headers: '',
  enabled: true,
  createdAt: 0,
})

export function useRuleModal() {
  function openAdd() {
    isEdit.value = false
    viewOnly.value = false
    Object.assign(form, {
      id: '', url: '', method: 'GET', status: 200, delay: 0,
      response: '', headers: '', enabled: true, createdAt: 0
    })
    visible.value = true
  }

  function openEdit(rule: MockRule) {
    isEdit.value = true
    viewOnly.value = false
    Object.assign(form, {
      ...rule,
      response: typeof rule.response === 'object' ? JSON.stringify(rule.response, null, 2) : (rule.response || ''),
      headers: rule.headers ? JSON.stringify(rule.headers, null, 2) : ''
    })
    visible.value = true
  }

  function openView(rule: MockRule) {
    isEdit.value = false
    viewOnly.value = true
    Object.assign(form, {
      ...rule,
      response: typeof rule.response === 'object' ? JSON.stringify(rule.response, null, 2) : (rule.response || ''),
      headers: rule.headers ? JSON.stringify(rule.headers, null, 2) : ''
    })
    visible.value = true
  }

  function openFromLog(log: NetworkLog) {
    isEdit.value = false
    viewOnly.value = false
    Object.assign(form, {
      id: '',
      url: log.url,
      method: log.method,
      status: log.status,
      delay: 0,
      response: typeof log.responseBody === 'object' ? JSON.stringify(log.responseBody, null, 2) : (log.responseBody || ''),
      headers: '',
      enabled: true,
      createdAt: 0
    })
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  return { visible, isEdit, viewOnly, form, openAdd, openEdit, openView, openFromLog, close }
}
