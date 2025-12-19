import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export function generatePanelHTML(): string {
  let dir: string
  try {
    dir = path.dirname(fileURLToPath(import.meta.url))
  } catch {
    dir = __dirname
  }
  const htmlPath = path.resolve(dir, 'index.html')
  return fs.readFileSync(htmlPath, 'utf-8')
}
