// bot.js — one job: the policy that plays the loop. The title-screen attract
// demo and the seeded proof in tools/bot-test.mjs both drive the game with
// this. It plays like a decent hunter: full-ish casts, strikes on the bite,
// pulse-hauls a fresh monster to tire it out, then hauls hard once it fades,
// and dashes through telegraphs to open counter windows.
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
        const f = run.fight;
        const t = f.tension;
        const e = f.event;
        if (f.dashT > 0) return { hold: true }; // mid-vanish: stay on the chain so the dodge lands
        // telegraphed lunges, slams and phases: with the dash ready and
        // the blow about to land, vanish through it still holding on —
        // a perfect dodge opens the counter window. Otherwise let go
        // before they land; a phased chain is slack water — hauling is wasted
        if (e && e.phase === 'tele' && (e.id === 'lunge' || e.id === 'slam' || e.id === 'phase')) {
          if (f.dashCd <= 0 && e.t <= 0.24) return { hold: true, dash: true };
          releasing = true;
          return {};
        }
        if (e && e.phase === 'active' && e.id === 'phase') {
          releasing = true;
          return {};
        }
        // the monkfish lies in pale blue: hands off until the fake fades
        if (f.wpT > 0 && f.wpFake) {
          releasing = true;
          return {};
        }
        // pulse against a fresh monster (short holds, let the tension sit
        // in the yellow so its stamina drains); commit once it is tired.
        const fresh = f.stamina > 55;
        const releaseAt = fresh ? 72 : 84;
        if (t > releaseAt) releasing = true;
        if (t < releaseAt - 26) releasing = false;
        const out = releasing ? {} : { hold: true };
        // a real weak point is worth holding for, even past the pulse
        // line — and a counter window doubly so
        if (((f.wpT > 0 && !f.wpFake) || f.counterT > 0) && t < 92) out.hold = true;
        // spend a banked SURGE once the monster is fading and we are working it
        if (out.hold && run.surgeCharges > 0 && f.stamina < 40 && !(f.surgeT > 0)) out.surge = true;
        return out;
      }
      return {};
    },
  };
}

// The draft pick, by fixed priority: protect the combo and the chain first,
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
// sea that still hides an uncaught monster. The King Wyrm only answers
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
