import type { Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { MockStore } from './store'
import type { PluginOptions, NetworkLog, MockRule } from './types'
import { generatePanelHTML } from './panel'

export type { PluginOptions, MockRule, NetworkLog }

const DEFAULT_OPTIONS: PluginOptions = {
  enabled: true,
  panelPath: '/__network_mock__',
  include: ['/api/', '/prod-api/'],
  exclude: ['/__', '/@', '/node_modules/', '.hot-update.', '.js', '.ts', '.css', '.vue', '.json', '.map', '.ico', '.png', '.jpg', '.svg', '.woff', '.ttf', '/src/']
}

export default function networkMockPlugin(options: PluginOptions = {}): Plugin {
  const opts = {
    enabled: options.enabled ?? DEFAULT_OPTIONS.enabled,
    panelPath: options.panelPath ?? DEFAULT_OPTIONS.panelPath,
    include: options.include?.length ? options.include : DEFAULT_OPTIONS.include,
    exclude: options.exclude?.length ? options.exclude : DEFAULT_OPTIONS.exclude
  } as Required<PluginOptions>
  let store: MockStore
  let wss: WebSocketServer
  const clients = new Set<WebSocket>()

  const broadcast = (type: string, data?: any) => {
    const message = JSON.stringify({ type, data })
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  const shouldIntercept = (url: string): boolean => {
    if (opts.exclude.some(pattern => url.includes(pattern))) return false
    if (opts.include.length === 0) return true
    return opts.include.some(pattern => url.includes(pattern))
  }

  const generateId = () => Math.random().toString(36).substring(2, 15)

  return {
    name: 'vite-plugin-network-mock',
    apply: 'serve',

    configureServer(server: ViteDevServer) {
      if (!opts.enabled) return

      // 使用项目根目录作为唯一标识
      store = new MockStore(server.config.root)

      wss = new WebSocketServer({ noServer: true })
      
      server.httpServer?.on('upgrade', (request, socket, head) => {
        if (request.url === '/__network_mock_ws__') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            clients.add(ws)
            ws.send(JSON.stringify({ type: 'rules', data: store.getRules() }))
            ws.send(JSON.stringify({ type: 'logs', data: store.getLogs() }))

            ws.on('message', (raw) => {
              try {
                const msg = JSON.parse(raw.toString())
                handleWsMessage(msg)
              } catch (e) {}
            })

            ws.on('close', () => clients.delete(ws))
          })
        }
      })

      const handleWsMessage = (msg: any) => {
        switch (msg.type) {
          case 'add-rule':
            store.addRule(msg.data)
            broadcast('rules', store.getRules())
            break
          case 'update-rule':
            store.updateRule(msg.data.id, msg.data)
            broadcast('rules', store.getRules())
            break
          case 'delete-rule':
            store.deleteRule(msg.data)
            broadcast('rules', store.getRules())
            break
          case 'toggle-rule':
            store.toggleRule(msg.data)
            broadcast('rules', store.getRules())
            break
          case 'clear-logs':
            store.clearLogs()
            broadcast('logs', [])
            break
          case 'page-refresh':
            // 主页面刷新时清空 logs
            store.clearLogs()
            broadcast('logs', [])
            break
        }
      }

      // 监听 Vite HMR，当页面完全刷新时清空 logs
      server.ws.on('connection', () => {
        store.clearLogs()
        broadcast('logs', [])
      })

      // Panel route
      server.middlewares.use((req, res, next) => {
        if (req.url === opts.panelPath) {
          res.setHeader('Content-Type', 'text/html')
          res.end(generatePanelHTML())
          return
        }
        next()
      })

      // Request interceptor
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url || ''
        const method = req.method || 'GET'

        if (!shouldIntercept(url)) return next()

        const matchedRule = store.findMatchingRule(url, method)
        
        if (matchedRule) {
          const startTime = Date.now()
          if (matchedRule.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, matchedRule.delay))
          }

          const log: NetworkLog = {
            id: generateId(),
            url,
            method,
            status: matchedRule.status,
            duration: Date.now() - startTime,
            timestamp: new Date().toLocaleTimeString(),
            responseBody: matchedRule.response,
            isMocked: true
          }

          store.addLog(log)
          broadcast('log', log)

          res.statusCode = matchedRule.status
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('X-Mock-Response', 'true')
          res.end(JSON.stringify(matchedRule.response))
          return
        }

        const startTime = Date.now()
        let requestBody = ''
        req.on('data', chunk => { requestBody += chunk.toString() })

        const originalWrite = res.write.bind(res)
        const originalEnd = res.end.bind(res)
        const chunks: Buffer[] = []

        res.write = function(chunk: any, ...args: any[]) {
          if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }
          return originalWrite(chunk, ...args)
        } as any

        res.end = function(chunk?: any, ...args: any[]) {
          if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }
          
          const responseBody = Buffer.concat(chunks).toString('utf-8')

          const log: NetworkLog = {
            id: generateId(),
            url,
            method,
            status: res.statusCode,
            duration: Date.now() - startTime,
            timestamp: new Date().toLocaleTimeString(),
            requestBody: requestBody ? tryParseJSON(requestBody) : undefined,
            responseBody: tryParseJSON(responseBody),
            isMocked: false
          }

          store.addLog(log)
          broadcast('log', log)

          return originalEnd(chunk, ...args)
        } as any

        next()
      })
    }
  }
}

function tryParseJSON(str: string): any {
  try { return JSON.parse(str) } catch { return str }
}
