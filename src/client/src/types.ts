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
  isMocked: boolean
  requestBody?: any
  responseBody?: any
}

export type TabType = 'network' | 'rules'
