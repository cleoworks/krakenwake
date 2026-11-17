// bot.js — one job: the policy that plays the loop. The title-screen attract
// demo and the seeded proof in tools/bot-test.mjs both drive the game with
// this. It plays like a decent hunter: full-ish casts, strikes on the bite,
// pulse-reels a fresh monster to tire it out, then hauls hard once it fades.
import { MONSTERS, SEAS, poolFor } from './data.js';
import { buyEquip, pickBoon } from './salvage.js';

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
        // pulse against a fresh monster (short holds, let the tension sit
        // in the yellow so its stamina drains); commit once it is tired.
        const t = run.fight.tension;
        const fresh = run.fight.stamina > 55;
        const releaseAt = fresh ? 72 : 84;
        if (t > releaseAt) releasing = true;
        if (t < releaseAt - 26) releasing = false;
        return releasing ? {} : { hold: true };
      }
      return {};
    },
  };
}

// The draft pick, by fixed priority: protect the combo and the cable first,
// then fight control, then speed and luck.
const DRAFT_PRIORITY = ['charm', 'cable', 'grip', 'winch', 'aperture', 'chum', 'glow', 'sinkers', 'sails'];
export function botDraft(run) {
  if (run.screen !== 'draft' || !run.draft) return false;
  for (const id of DRAFT_PRIORITY) {
    if (run.draft.choices.includes(id)) return pickBoon(run, id);
  }
  return pickBoon(run, run.draft.choices[0]);
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
