// main.ts — the entry program the grader runs: copy game/ and screenshots/
// into the output directory and write the dossier the scorer will rebuild
// and compare byte for byte. The grader mounts this repository read-only
// and starts the program from an arbitrary working directory, so inputs
// are located from MAKEFUN_BOT_DIR or this file's own directory — never
// the working directory — and the output directory, a mount of its own,
// is emptied rather than removed.
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = process.env.MAKEFUN_BOT_DIR ?? dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}
cpSync(join(root, 'game'), join(out, 'game'), { recursive: true });
cpSync(join(root, 'screenshots'), join(out, 'screenshots'), { recursive: true });
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
