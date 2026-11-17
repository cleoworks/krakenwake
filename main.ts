// main.ts — the entry program the grader runs: copy game/ and screenshots/
// into the output directory and write the dossier the scorer will rebuild
// and compare byte for byte.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync('game', join(out, 'game'), { recursive: true });
cpSync('screenshots', join(out, 'screenshots'), { recursive: true });
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
console.log(`dossier written to ${join(out, 'dossier.json')}`);
