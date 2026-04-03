import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const port = 4173;
const baseDir = await (async () => {
  try {
    await stat(path.join(dist, 'index.html'));
    return dist;
  } catch {
    return root;
  }
})();

function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(baseDir, urlPath);
    await stat(filePath);
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}`);
});
