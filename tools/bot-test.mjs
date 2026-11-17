// bot-test.mjs — the seeded season proof. Imports the game's pure logic
// (the same step() the browser runs), plays a full season with seed 7 and
// the autopilot policy, and asserts the bot completes the bestiary fairly:
// same strike windows, same tension rules, same prices as a human player.
import { createRun, step } from '../game/src/fishing.js';
import { makeBot, botInput, botCamp } from '../game/src/bot.js';

const DT = 1 / 20;
const run = createRun(7);
const mem = makeBot();
let steps = 0;
const MAX_STEPS = 400000;

while (run.screen !== 'victory' && run.screen !== 'gameover' && steps < MAX_STEPS) {
  if (run.screen === 'camp') {
    if (!botCamp(run)) run.screen = 'play';
  } else {
    step(run, botInput(run, mem), DT);
  }
  steps++;
}

const st = run.stats;
console.log(`result:   ${run.screen.toUpperCase()} on night ${run.day}`);
console.log(`throws:   ${st.casts}`);
console.log(`hauls:    ${st.catches}`);
console.log(`coins:    earned ${st.coinsEarned}, on hand ${run.coins}`);
console.log(`bestiary: ${run.journalCount}/13 monsters`);
console.log(`biggest:  ${st.biggest ? `${st.biggest.name} ${st.biggest.kg.toFixed(1)} kg` : '—'}`);
console.log(`combo:    longest ×${st.longestCombo}, peak tension ${st.peakTension}%`);
console.log(`best set: ${JSON.stringify(run.best)}`);
if (run.screen !== 'victory') {
  console.error('FAIL: bot did not complete the bestiary');
  process.exit(1);
}
console.log('PASS: seeded bot completed the bestiary — the game is beatable.');
