// serve.ts — a tiny static server for playing the game locally:
//   node serve.ts   →   http://127.0.0.1:8377
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    const path = normalize(join('game', url.pathname === '/' ? 'index.html' : url.pathname));
    if (path.startsWith('..')) throw new Error('no');
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
server.listen(8377, () => console.log('KRAKENWAKE at http://127.0.0.1:8377'));
