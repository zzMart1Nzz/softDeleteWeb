import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 5500);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end('Metodoa ez dago baimenduta.');
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!/^(index\.html|(?:css|js)\/[a-zA-Z0-9_./-]+)$/.test(relative) ||
        relative.split('/').some(part => part.startsWith('.'))) {
      response.writeHead(404).end('Ez da orria aurkitu.');
      return;
    }
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root)) {
      response.writeHead(404).end('Ez da orria aurkitu.');
      return;
    }
    const content = await readFile(filename);
    response.writeHead(200, {
      'Content-Type': `${types[path.extname(filename)] || 'application/octet-stream'}; charset=utf-8`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404).end('Ez da orria aurkitu.');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `${port} ataka erabilita dago. Itxi aurreko web zerbitzaria.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Web interfazea: http://127.0.0.1:${port}`));
