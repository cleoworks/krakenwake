// capture.mjs — renders the four entry screenshots with headless Chromium.
// Starts serve.ts, opens each shots.json URL at 1280x720 (the scenes are
// staged deterministically by game/src/main.js via ?shot=), saves the PNGs
// into screenshots/. These are real renders of the game's own code.
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = fileURLToPath(new URL('..', import.meta.url));
const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));
mkdirSync(join(here, 'screenshots'), { recursive: true });

const server = spawn('node', ['serve.ts', '--port', '8080'], { cwd: here, stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(700);
try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  for (const shot of shots) {
    await page.goto(shot.url, { waitUntil: 'load' });
    await wait(1100);
    const path = join(here, 'screenshots', shot.file);
    await page.screenshot({ path });
    console.log('captured', shot.file);
  }
  await browser.close();
} finally {
  server.kill();
}
