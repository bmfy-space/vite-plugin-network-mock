<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  placeholder?: string
}>()
</script>

<template>
  <div class="search-box">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
    <input 
      type="text" 
      class="search-input" 
      v-model="model" 
      :placeholder="placeholder || 'Search...'"
    >
  </div>
</template>

<style scoped>
.search-box { 
  flex: 1; 
  min-width: 200px; 
  position: relative; 
}
.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}
.search-input { 
  width: 100%; 
  padding-left: 38px; 
}
</style>
