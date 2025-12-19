<script setup lang="ts">
import { ref, provide } from 'vue'
import type { TabType } from './types'
import { useWebSocket } from './composables/useWebSocket'
import AppHeader from './components/AppHeader.vue'
import NetworkPanel from './components/NetworkPanel.vue'
import RulesPanel from './components/RulesPanel.vue'
import RuleModal from './components/RuleModal.vue'

const activeTab = ref<TabType>('network')
const ws = useWebSocket()

provide('ws', ws)
</script>

<template>
  <div class="container">
    <AppHeader v-model:activeTab="activeTab" />
    <div class="card">
      <NetworkPanel v-show="activeTab === 'network'" />
      <RulesPanel v-show="activeTab === 'rules'" />
    </div>
    <RuleModal />
  </div>
</template>
