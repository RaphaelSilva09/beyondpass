import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { brotliCompressSync, gzipSync } from 'node:zlib'

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
  ['/pt/', 'pt.html'],
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
  const type = contentTypes[extension]
  const text = type.startsWith('text/') ? await readFile(file) : null
  const variants = text ? {
    br: brotliCompressSync(text),
    gzip: gzipSync(text),
    identity: text,
  } : null
  routes.set(route, { file, type, variants })
}

const server = createServer((request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }

  const pathname = request.url.split('?')[0]
  if (pathname === '/pt') {
    response.writeHead(308, { Location: '/pt/' }).end()
    return
  }
  const route = routes.get(pathname === '/index.html' ? '/' : pathname)
  if (!route) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end(pathname.startsWith('/pt/') ? 'Página não encontrada.' : 'Page not found.')
    return
  }

  const headers = {
    'Content-Type': route.type,
    'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=86400' : 'no-cache',
  }

  if (route.variants) {
    const accepted = new Map((request.headers['accept-encoding'] || '').split(',').map(value => {
      const [name, quality = 'q=1'] = value.trim().toLowerCase().split(/\s*;\s*/)
      return [name, Number(quality.slice(2))]
    }))
    const quality = name => accepted.get(name) ?? accepted.get('*') ?? 0
    const encoding = quality('br') > 0 && quality('br') >= quality('gzip') ? 'br'
      : quality('gzip') > 0 ? 'gzip' : 'identity'
    const body = route.variants[encoding]
    headers.Vary = 'Accept-Encoding'
    headers['Content-Length'] = body.length
    if (encoding !== 'identity') headers['Content-Encoding'] = encoding
    response.writeHead(200, headers).end(request.method === 'HEAD' ? undefined : body)
    return
  }

  response.writeHead(200, headers)
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
