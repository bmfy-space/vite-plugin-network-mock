import { defineConfig } from 'tsup'
import { copyFileSync, existsSync } from 'fs'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  external: ['vite'],
  onSuccess: async () => {
    // 复制 Vue3 构建产物
    if (existsSync('src/index.html')) {
      copyFileSync('src/index.html', 'dist/index.html')
    }
  }
})
