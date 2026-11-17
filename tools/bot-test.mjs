// bot-test.mjs — the seeded proof: the bot policy from game/src/bot.js plays
// a full season of the pure logic in game/src/fishing.js on seed 7. It must
// complete the bestiary (13/13) and record a BEST. Run: node tools/bot-test.mjs
import { createRun, journalCount, emptyBest, betterBest } from '../game/src/state.js';
import { step } from '../game/src/fishing.js';
import { makeBot, botShop } from '../game/src/bot.js';

const run = createRun(7);
const bot = makeBot();
const DT = 1 / 30;
let ticks = 0;
while (run.screen !== 'end' && ticks < 400000) {
  if (run.phase === 'idle') botShop(run);
  step(run, DT, bot.input(run));
  run.events.length = 0;
  ticks++;
}

const species = journalCount(run);
console.log(
  `seed 7: result=${run.result} night=${run.night} species=${species}/13 ` +
  `throws=${run.throws} hauled=${run.hauled} coinsEarned=${run.coinsEarned} ` +
  `biggest=${run.biggestName} ${run.biggestKg.toFixed(1)} kg bestCombo=x${run.bestCombo} ` +
  `peakTension=${Math.round(run.peakTension)}% ticks=${ticks}`,
);
if (run.result !== 'victory' || species !== 13) {
  console.error('FAIL: the seeded bot did not complete the bestiary');
  process.exit(1);
}
const best = betterBest(emptyBest(), run);
if (!best.result || best.species !== 13) {
  console.error('FAIL: BEST was not recorded');
  process.exit(1);
}
console.log(`BEST recorded: ${best.result} • biggest ${best.biggestName} ${best.biggestKg.toFixed(1)} kg • combo x${best.combo} • ${best.coins} coins`);
console.log('PASS: seeded bot completed the bestiary — the game is beatable.');
