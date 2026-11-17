// bot-test.mjs — the seeded proof: the bot policy from game/src/bot.js plays
// a full season of the pure logic in game/src/fight.js on seed 7, at
// GENIN difficulty, drafting salvage by its fixed priority after every
// night. It must complete the bestiary (13/13) and record a BEST.
// Run: node tools/bot-test.mjs
import { createRun, journalCount, emptyBest, betterBest, gradeForScore } from '../game/src/state.js';
import { step } from '../game/src/fight.js';
import { makeBot, botShop, botDraft } from '../game/src/bot.js';

const run = createRun(7);
run.difficulty = 0; // GENIN
const bot = makeBot();
const DT = 1 / 30;
let ticks = 0;
while (run.screen !== 'end' && ticks < 600000) {
  if (run.screen === 'draft') botDraft(run);
  else if (run.phase === 'idle') botShop(run);
  step(run, DT, bot.input(run));
  run.events.length = 0;
  ticks++;
}

const species = journalCount(run);
console.log(
  `seed 7: result=${run.result} night=${run.night} species=${species}/13 ` +
  `throws=${run.throws} hauled=${run.hauled} coinsEarned=${run.coinsEarned} ` +
  `score=${run.score} grade=${gradeForScore(run.score)} ` +
  `bestCombo=x${run.bestCombo} ` +
  `peakTension=${Math.round(run.peakTension)}% ticks=${ticks}`,
);
console.log(`night grades: ${run.nightGrades.join(' ')} • boons held: ${run.boons.join(', ')}`);
console.log(`feats earned: ${Object.keys(run.feats).filter((k) => run.feats[k]).join(', ')}`);
if (run.result !== 'victory' || species !== 13) {
  console.error('FAIL: the seeded bot did not complete the bestiary');
  process.exit(1);
}
const best = betterBest(emptyBest(), run);
if (!best.result || best.species !== 13) {
  console.error('FAIL: BEST was not recorded');
  process.exit(1);
}
console.log(`BEST recorded: ${best.result} • grade ${best.grade} • score ${best.score} • combo x${best.combo} • ${best.coins} coins`);
console.log('PASS: seeded bot completed the bestiary — the game is beatable.');
