<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="toggle" @click.stop>
    <input type="checkbox" v-model="model">
    <span class="toggle-track"></span>
    <span class="toggle-thumb"></span>
  </label>
</template>

<style scoped>
.toggle { 
  position: relative; 
  width: 40px; 
  height: 22px; 
  cursor: pointer; 
}
.toggle input { 
  opacity: 0; 
  width: 0; 
  height: 0; 
  position: absolute; 
}
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
