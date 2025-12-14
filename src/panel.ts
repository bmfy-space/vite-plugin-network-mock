import fs from 'fs'
import path from 'path'

export function generatePanelHTML(): string {
  // 兼容 ESM 和 CJS
  let dir: string
  try {
    dir = path.dirname(new URL(import.meta.url).pathname)
  } catch {
    dir = __dirname
  }
  const htmlPath = path.resolve(dir, 'panel.html')
  return fs.readFileSync(htmlPath, 'utf-8')
}
