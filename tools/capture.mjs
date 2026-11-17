// capture.mjs — serve game/ statically, drive headless Chromium to the four
// staged ?shot= states, and write 1280x720 PNGs into screenshots/.
// Run: node tools/capture.mjs   (each file must come out <= 262,144 bytes)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright-core';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
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
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const exe =
  process.env.CHROME_PATH ??
  `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const SHOTS = [
  ['cover', '1-cover.png'],
  ['bite', '2-bite.png'],
  ['journal', '3-journal.png'],
  ['victory', '4-victory.png'],
];
let failed = false;
for (const [shot, file] of SHOTS) {
  await page.goto(`http://127.0.0.1:${port}/?shot=${shot}&seed=1`, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  const out = join('screenshots', file);
  await page.screenshot({ path: out });
  const { size } = await stat(out);
  console.log(`${file}: ${size} bytes ${size <= 262144 ? 'ok' : 'OVER CAP'}`);
  if (size > 262144) failed = true;
}
await browser.close();
server.close();
if (failed) process.exit(1);
console.log('captured 4 screenshots');
