export interface MockRule {
  id: string
  url: string
  method: string
  status: number
  delay: number
  response: any
  headers?: Record<string, string>
  enabled: boolean
  createdAt: number
}

export interface NetworkLog {
  id: string
  url: string
  method: string
  status: number
  duration: number
  timestamp: string
  requestHeaders?: Record<string, string>
  requestBody?: any
  responseHeaders?: Record<string, string>
  responseBody?: any
  isMocked: boolean
}

export interface PluginOptions {
  enabled?: boolean
  panelPath?: string
  include?: string[]
  exclude?: string[]
}

export interface WebSocketMessage {
  type: 'log' | 'rules' | 'add-rule' | 'update-rule' | 'delete-rule' | 'toggle-rule' | 'clear-logs'
  data?: any
}
