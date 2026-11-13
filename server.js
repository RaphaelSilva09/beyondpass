import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { readdir } from 'node:fs/promises'

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

const publicFiles = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/styles.css', 'styles.css'],
  ['/app.js', 'app.js'],
])
for (const asset of await readdir(new URL('./assets/', import.meta.url))) {
  if (/^[\w-]+\.(svg|webp|woff2)$/.test(asset)) {
    publicFiles.set(`/assets/${asset}`, `assets/${asset}`)
  }
}

const routes = new Map()
for (const [route, path] of publicFiles) {
  const file = new URL(path, import.meta.url)
  const extension = path.slice(path.lastIndexOf('.'))
  routes.set(route, { file, type: contentTypes[extension] })
}

const server = createServer((request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }

  const pathname = request.url.split('?')[0]
  const route = routes.get(pathname)
  if (!route) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Página não encontrada.')
    return
  }

  response.writeHead(200, {
    'Content-Type': route.type,
    'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=86400' : 'no-cache',
  })
  if (request.method === 'HEAD') {
    response.end()
    return
  }

  const stream = createReadStream(route.file)
  response.on('close', () => stream.destroy())
  stream.on('error', () => response.destroy())
  stream.pipe(response)
})

const port = Number(process.env.PORT || '4173')
const host = process.env.HOST || '0.0.0.0'
server.listen(port, host, () => console.log(`BeyondPass disponível na porta ${port}`))
