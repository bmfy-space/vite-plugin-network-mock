import { defineConfig } from 'tsup'
import { copyFileSync } from 'fs'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  onSuccess: async () => {
    copyFileSync('src/panel.html', 'dist/panel.html')
  }
})
