import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import type { MockRule, NetworkLog } from './types'

export class MockStore {
  private rules: Map<string, MockRule> = new Map()
  private logs: NetworkLog[] = []
  private storePath: string
  private logsPath: string
  private maxLogs = 500

  constructor(projectRoot: string) {
    // 使用项目路径的 hash 作为唯一标识，存储到用户目录
    const projectHash = crypto.createHash('md5').update(projectRoot).digest('hex').slice(0, 8)
    const storeDir = path.join(os.homedir(), '.vite-network-mock', projectHash)
    
    this.storePath = path.join(storeDir, 'rules.json')
    this.logsPath = path.join(storeDir, 'logs.json')
    this.loadRules()
    this.loadLogs()
  }

  private loadRules() {
    try {
      if (fs.existsSync(this.storePath)) {
        const data = JSON.parse(fs.readFileSync(this.storePath, 'utf-8'))
        if (Array.isArray(data)) {
          data.forEach(rule => this.rules.set(rule.id, rule))
        }
      }
    } catch (e) {
      console.warn('[network-mock] Failed to load rules:', e)
    }
  }

  private loadLogs() {
    try {
      if (fs.existsSync(this.logsPath)) {
        const data = JSON.parse(fs.readFileSync(this.logsPath, 'utf-8'))
        if (Array.isArray(data)) {
          this.logs = data.slice(0, this.maxLogs)
        }
      }
    } catch (e) {
      console.warn('[network-mock] Failed to load logs:', e)
    }
  }

  private saveRules() {
    try {
      const dir = path.dirname(this.storePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.storePath, JSON.stringify(Array.from(this.rules.values()), null, 2))
    } catch (e) {
      console.warn('[network-mock] Failed to save rules:', e)
    }
  }

  private saveLogs() {
    try {
      const dir = path.dirname(this.logsPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.logsPath, JSON.stringify(this.logs, null, 2))
    } catch (e) {
      console.warn('[network-mock] Failed to save logs:', e)
    }
  }

  getRules(): MockRule[] {
    return Array.from(this.rules.values())
  }

  getRule(id: string): MockRule | undefined {
    return this.rules.get(id)
  }

  findMatchingRule(url: string, method: string): MockRule | undefined {
    for (const rule of this.rules.values()) {
      if (rule.enabled && rule.method === method && url.includes(rule.url)) {
        return rule
      }
    }
    return undefined
  }

  addRule(rule: MockRule) {
    this.rules.set(rule.id, rule)
    this.saveRules()
  }

  updateRule(id: string, updates: Partial<MockRule>) {
    const rule = this.rules.get(id)
    if (rule) {
      Object.assign(rule, updates)
      this.saveRules()
    }
  }

  deleteRule(id: string) {
    this.rules.delete(id)
    this.saveRules()
  }

  toggleRule(id: string) {
    const rule = this.rules.get(id)
    if (rule) {
      rule.enabled = !rule.enabled
      this.saveRules()
    }
  }

  getLogs(): NetworkLog[] {
    return this.logs
  }

  addLog(log: NetworkLog) {
    this.logs.unshift(log)
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }
    this.saveLogs()
  }

  clearLogs() {
    this.logs = []
    this.saveLogs()
  }

  // 检查是否已存在相同 URL 和 Method 的规则
  hasRule(url: string, method: string): MockRule | undefined {
    for (const rule of this.rules.values()) {
      if (rule.method === method && rule.url === url) {
        return rule
      }
    }
    return undefined
  }
}
