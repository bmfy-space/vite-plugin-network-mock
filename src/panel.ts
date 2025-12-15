import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export function generatePanelHTML(): string {
  // 兼容 ESM 和 CJS，正确处理 Windows 路径
  let dir: string
  try {
    // 使用 fileURLToPath 正确转换 file:// URL 到系统路径
    dir = path.dirname(fileURLToPath(import.meta.url))
  } catch {
    dir = __dirname
  }
  const htmlPath = path.resolve(dir, 'panel.html')
  return fs.readFileSync(htmlPath, 'utf-8')
}
