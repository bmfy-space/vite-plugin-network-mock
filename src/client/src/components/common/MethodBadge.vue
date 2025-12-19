<script setup lang="ts">
defineProps<{
  method: string
}>()
</script>

<template>
  <span class="method-badge" :class="method">{{ method }}</span>
</template>

<style scoped>
.method-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}
.method-badge.GET { background: #dbeafe; color: #1d4ed8; }
.method-badge.POST { background: #dcfce7; color: #15803d; }
.method-badge.PUT { background: #fef3c7; color: #b45309; }
.method-badge.DELETE { background: #fee2e2; color: #dc2626; }
.method-badge.PATCH { background: #f3e8ff; color: #7c3aed; }
</style>
