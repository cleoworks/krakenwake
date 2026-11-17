// bot.js — the autopilot policy. It hunts by the exact human rules: same
// strike window, same tension physics. It powers the title-screen attract
// demo and the seeded season proof (tools/bot-test.mjs).
import { RODS, BAITS, LOCATIONS } from './data.js';
import { buyRod, buyBait, travelTo, poolMissing } from './fishing.js';

// The shopping list, in order: gear up, then unlock darker water.
const BUY_ORDER = [
  ['rod', 1], ['bait', 2], ['loc', 1], ['rod', 2], ['bait', 3], ['loc', 2],
];

export function makeBot() {
  return { react: 0, relax: false, campT: 0 };
}

function nextPurchase(run) {
  for (const [kind, i] of BUY_ORDER) {
    if (kind === 'rod' && !run.rodsOwned[i]) return { kind, i, cost: RODS[i].cost };
    if (kind === 'bait' && !run.baitsOwned[i]) return { kind, i, cost: BAITS[i].cost };
    if (kind === 'loc' && !run.locsOpen[i]) return { kind, i, cost: LOCATIONS[i].cost };
  }
  return null;
}

function bestTravel(run) {
  // Hunt the unlocked sea with the most bestiary gaps; ties go to the
  // deepest sea (best income while waiting out a shy rare), so one
  // missing monster can never gate the whole season.
  let best = run.location, most = -1;
  for (let loc = 0; loc < 3; loc++) {
    if (!run.locsOpen[loc]) continue;
    const missing = poolMissing(run, loc).length;
    if (missing >= most) { most = missing; best = loc; }
  }
  return best;
}

// One camp visit: buy the next affordable item, equip the best gear for the
// water we are heading to, travel, leave. Returns true while still shopping.
export function botCamp(run) {
  const want = nextPurchase(run);
  if (want && run.coins >= want.cost) {
    if (want.kind === 'rod') buyRod(run, want.i);
    else if (want.kind === 'bait') buyBait(run, want.i);
    else travelTo(run, want.i);
    return true;
  }
  const dest = bestTravel(run);
  if (dest !== run.location) { travelTo(run, dest); return true; }
  // Equip the strongest harpoon and the best lure we own for this sea.
  for (let i = 2; i >= 0; i--) if (run.rodsOwned[i]) { run.rod = i; break; }
  run.bait = run.baitsOwned[3] && run.location === 2 ? 3
    : run.baitsOwned[2] ? 2 : run.baitsOwned[1] ? 1 : 0;
  return false;
}

// Per-step play policy. mem is the bot's scratch memory from makeBot().
export function botInput(run, mem) {
  const input = { hold: false, tap: false };
  if (run.screen === 'camp') return input;
  if (run.screen !== 'play') return input;
  switch (run.phase) {
    case 'idle': {
      const want = nextPurchase(run);
      const shouldShop = (want && run.coins >= want.cost) || bestTravel(run) !== run.location;
      if (shouldShop) { run.screen = 'camp'; break; }
      input.tap = true; input.hold = true;
      break;
    }
    case 'charge':
      input.hold = run.charge < 0.72;
      break;
    case 'wait':
      mem.react = 0;
      break;
    case 'bite':
      mem.react += 1 / 30;
      if (mem.react > 0.15) input.tap = true;
      break;
    case 'fight': {
      const t = run.tension;
      if (mem.relax && t < 58) mem.relax = false;
      if (t > 86) mem.relax = true;
      input.hold = !mem.relax && t < 78;
      break;
    }
  }
  return input;
}
