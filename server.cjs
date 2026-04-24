/**
 * Simple proxy server:
 *  - Serves React static build from frontend/dist on port 3000
 *  - Proxies /api/* to NestJS backend on port 3001
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const FRONTEND_DIST = path.join(__dirname, 'frontend', 'dist')
const BACKEND_HOST = '127.0.0.1'
const BACKEND_PORT = 3998
const PORT = 3999

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

function proxyToBackend(req, res) {
  const options = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${BACKEND_HOST}:${BACKEND_PORT}` },
  }
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res, { end: true })
  })
  proxyReq.on('error', () => {
    res.writeHead(502)
    res.end(JSON.stringify({ error: 'Backend unavailable' }))
  })
  req.pipe(proxyReq, { end: true })
}

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0]
  if (urlPath === '/') urlPath = '/index.html'

  let filePath = path.join(FRONTEND_DIST, urlPath)
  if (!fs.existsSync(filePath)) {
    // SPA fallback
    filePath = path.join(FRONTEND_DIST, 'index.html')
  }

  const ext = path.extname(filePath)
  const contentType = MIME[ext] || 'text/plain'

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    proxyToBackend(req, res)
  } else {
    serveStatic(req, res)
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Proxy server running on http://0.0.0.0:${PORT}`)
  console.log(`   → Static: frontend/dist`)
  console.log(`   → API:    http://${BACKEND_HOST}:${BACKEND_PORT}`)
})
