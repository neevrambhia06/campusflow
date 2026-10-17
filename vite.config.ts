import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function moodleProxyPlugin(): Plugin {
  return {
    name: 'moodle-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/moodle-proxy', async (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const { url, method = 'GET', headers = {}, data } = JSON.parse(body || '{}')
              if (!url) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Missing target url' }))
                return
              }

              const fetchHeaders: Record<string, string> = {
                'User-Agent': 'MoodleMobile/4.4.0 (CampusFlow Sync)',
                ...headers,
              }

              const fetchOptions: RequestInit = {
                method,
                headers: fetchHeaders,
              }

              if (data && (method === 'POST' || method === 'PUT')) {
                if (typeof data === 'string') {
                  fetchOptions.body = data
                } else if (fetchHeaders['Content-Type']?.includes('application/x-www-form-urlencoded')) {
                  fetchOptions.body = new URLSearchParams(data).toString()
                } else {
                  fetchOptions.body = JSON.stringify(data)
                }
              }

              const response = await fetch(url, fetchOptions)
              const contentType = response.headers.get('content-type') || 'text/plain'
              res.statusCode = response.status
              res.setHeader('Content-Type', contentType)

              if (contentType.includes('application/json')) {
                const json = await response.json()
                res.end(JSON.stringify(json))
              } else {
                const text = await response.text()
                res.end(text)
              }
            } catch (err: unknown) {
              const error = err as { message?: string }
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error?.message || 'Proxy request failed' }))
            }
          })
        } else {
          res.statusCode = 405
          res.end('Method Not Allowed')
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), moodleProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

