// bot.js — one job: the policy that plays the loop. The title-screen attract
// demo and the seeded proof in tools/bot-test.mjs both drive the game with
// this. It plays like a decent hunter: full-ish casts, strikes on the bite,
// reels under the yellow and slacks off before the cable pops.
import { MONSTERS, SEAS, poolFor } from './data.js';
import { buyEquip } from './fishing.js';

export function makeBot() {
  let releasing = false;
  return {
    input(run) {
      if (run.screen !== 'game') return {};
      if (run.phase === 'idle') return { pressed: true, hold: true };
      if (run.phase === 'charge') {
        if (run.charge >= 0.72) return { released: true };
        return { hold: true };
      }
      if (run.phase === 'wait') {
        if (run.wait && run.wait.open) return { pressed: true };
        return {};
      }
      if (run.phase === 'fight') {
        const t = run.fight.tension;
        if (t > 82) releasing = true;
        if (t < 55) releasing = false;
        return releasing ? {} : { hold: true };
      }
      return {};
    },
  };
}

// Between casts: spend coins in a fixed priority and sail to the deepest open
// sea that still hides an uncaught monster. The Mother Kraken only answers
// the Doom Bell, so the bell is bought and rung whenever the Maw is the hunt.
export function botShop(run) {
  const uncaughtAt = (sea) => poolFor(sea).some((i) => run.bestiary[i].count === 0);
  // unlock seas first, then the winch, then the bell, then the rig
  if (!run.seasOpen[1] && run.coins >= SEAS[1].unlock) buyEquip(run, 'sea', 1);
  if (!run.ownedH[1] && run.coins >= 150) buyEquip(run, 'harpoon', 1);
  if (!run.seasOpen[2] && run.coins >= SEAS[2].unlock) buyEquip(run, 'sea', 2);
  if (!run.ownedL[3] && run.coins >= 100) buyEquip(run, 'lure', 3);
  if (!run.ownedH[2] && run.coins >= 350) buyEquip(run, 'harpoon', 2);
  if (!run.ownedL[2] && run.coins >= 80) buyEquip(run, 'lure', 2);
  if (!run.ownedL[1] && run.coins >= 60) buyEquip(run, 'lure', 1);
  // where to hunt
  let target = 0;
  for (let s = 2; s >= 0; s--) {
    if (run.seasOpen[s] && uncaughtAt(s)) { target = s; break; }
  }
  if (run.sea !== target) buyEquip(run, 'sea', target);
  // the right lure for the water: bell in the Maw, fastest elsewhere
  const wantLure = target === 2 && run.ownedL[3] ? 3 : run.ownedL[2] ? 2 : run.ownedL[1] ? 1 : 0;
  if (run.lure !== wantLure) buyEquip(run, 'lure', wantLure);
  // best harpoon owned
  const wantH = run.ownedH[2] ? 2 : run.ownedH[1] ? 1 : 0;
  if (run.harpoon !== wantH) buyEquip(run, 'harpoon', wantH);
  void MONSTERS;
}
