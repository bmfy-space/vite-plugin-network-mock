<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  showAll?: boolean
}>()
</script>

<template>
  <select class="method-select" v-model="model">
    <option v-if="showAll" value="">All Methods</option>
    <option value="GET">GET</option>
    <option value="POST">POST</option>
    <option value="PUT">PUT</option>
    <option value="DELETE">DELETE</option>
    <option value="PATCH">PATCH</option>
  </select>
</template>

<style scoped>
.method-select {
  padding: 9px 32px 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  outline: none;
  background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center;
  appearance: none;
  cursor: pointer;
}
.method-select:focus { 
  border-color: var(--primary); 
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); 
}
</style>
