<script setup lang="ts">
import { SubModal } from './common'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  insert: [syntax: string]
}>()

const mockRules = [
  { category: 'Basic', rules: [
    { syntax: '@boolean', desc: 'Random boolean' },
    { syntax: '@natural(min?, max?)', desc: 'Natural number' },
    { syntax: '@integer(min?, max?)', desc: 'Integer' },
    { syntax: '@float(min, max, dmin?, dmax?)', desc: 'Float number' },
    { syntax: '@string(pool?, min?, max?)', desc: 'Random string' },
  ]},
  { category: 'Date', rules: [
    { syntax: '@date(format?)', desc: 'Date string' },
    { syntax: '@time(format?)', desc: 'Time string' },
    { syntax: '@datetime(format?)', desc: 'Datetime string' },
    { syntax: '@now(unit?, format?)', desc: 'Current time' },
  ]},
  { category: 'Image', rules: [
    { syntax: '@image(size?, bg?, fg?, format?, text?)', desc: 'Image URL' },
    { syntax: '@dataImage(size?, text?)', desc: 'Base64 image' },
  ]},
  { category: 'Color', rules: [
    { syntax: '@color', desc: 'Hex color' },
    { syntax: '@rgb', desc: 'RGB color' },
    { syntax: '@rgba', desc: 'RGBA color' },
  ]},
  { category: 'Text', rules: [
    { syntax: '@paragraph(min?, max?)', desc: 'Paragraph' },
    { syntax: '@sentence(min?, max?)', desc: 'Sentence' },
    { syntax: '@word(min?, max?)', desc: 'Word' },
    { syntax: '@title(min?, max?)', desc: 'Title' },
    { syntax: '@cparagraph', desc: 'Chinese paragraph' },
    { syntax: '@csentence', desc: 'Chinese sentence' },
    { syntax: '@cword(pool?, min?, max?)', desc: 'Chinese word' },
    { syntax: '@ctitle', desc: 'Chinese title' },
  ]},
  { category: 'Name', rules: [
    { syntax: '@first', desc: 'First name' },
    { syntax: '@last', desc: 'Last name' },
    { syntax: '@name(middle?)', desc: 'Full name' },
    { syntax: '@cfirst', desc: 'Chinese first name' },
    { syntax: '@clast', desc: 'Chinese last name' },
    { syntax: '@cname', desc: 'Chinese full name' },
  ]},
  { category: 'Web', rules: [
    { syntax: '@url(protocol?, host?)', desc: 'URL' },
    { syntax: '@domain(tld?)', desc: 'Domain' },
    { syntax: '@email(domain?)', desc: 'Email' },
    { syntax: '@ip', desc: 'IP address' },
  ]},
  { category: 'Address', rules: [
    { syntax: '@region', desc: 'Region' },
    { syntax: '@province', desc: 'Province' },
    { syntax: '@city(prefix?)', desc: 'City' },
    { syntax: '@county(prefix?)', desc: 'County' },
    { syntax: '@zip', desc: 'Zip code' },
  ]},
  { category: 'Helper', rules: [
    { syntax: '@guid', desc: 'GUID' },
    { syntax: '@id', desc: 'ID (18 digits)' },
    { syntax: '@increment(step?)', desc: 'Auto increment' },
  ]},
  { category: 'Array Rules', rules: [
    { syntax: '"list|count": [{}]', desc: 'Fixed count array' },
    { syntax: '"list|min-max": [{}]', desc: 'Random count array' },
    { syntax: '"id|+1": 1', desc: 'Auto increment' },
    { syntax: '"status|1": [0,1]', desc: 'Pick one from array' },
  ]},
]

function handleInsert(syntax: string) {
  const textToInsert = syntax.replace(/\(.*\)/, '').replace(/\?/g, '')
  emit('insert', textToInsert)
  emit('close')
}
</script>

<template>
  <SubModal :visible="visible" title="Mock.js Reference" tip="Click to insert at cursor" width="900px" @close="emit('close')">
    <div class="mock-ref-body">
      <div v-for="cat in mockRules" :key="cat.category" class="mock-category">
        <div class="category-title">{{ cat.category }}</div>
        <div class="mock-rules-grid">
          <div v-for="rule in cat.rules" :key="rule.syntax" class="mock-rule-item" @click="handleInsert(rule.syntax)">
            <code class="rule-syntax">{{ rule.syntax }}</code>
            <span class="rule-desc">{{ rule.desc }}</span>
          </div>
        </div>
      </div>
    </div>
  </SubModal>
</template>

<style scoped>
.mock-ref-body {
  max-height: calc(80vh - 60px);
  overflow-y: auto;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.mock-category { min-width: 0; }
.category-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.mock-rules-grid { display: flex; flex-direction: column; gap: 2px; }
.mock-rule-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.mock-rule-item:hover { background: var(--bg); }
.rule-syntax {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  color: var(--primary);
  word-break: break-all;
}
.rule-desc { font-size: 11px; color: var(--text-muted); }
</style>
