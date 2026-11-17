// salvage.js — one job: the meta layer around the hunt. The boons a run
// holds, the between-night salvage draft, the grade each night earns, and
// the camp purchases (moved here from fishing.js so the rules file stays
// lean). Pure logic, like fishing.js: no DOM, no canvas.
import { SEAS, HARPOONS, LURES, BOONS } from './data.js';

export const hasBoon = (run, id) => run.boons.includes(id);

// --- the draft --------------------------------------------------------------
// Three boons the hunter does not hold yet, drawn on the run's own rng so
// the seeded proof stays deterministic.
export function makeDraftChoices(run) {
  const pool = BOONS.map((b) => b.id).filter((id) => !hasBoon(run, id));
  const choices = [];
  while (choices.length < 3 && pool.length > 0) {
    const k = Math.floor(run.rng.next() * pool.length);
    choices.push(pool.splice(k, 1)[0]);
  }
  return choices;
}

export function pickBoon(run, id) {
  if (!run.draft || !run.draft.choices.includes(id) || hasBoon(run, id)) return false;
  run.boons.push(id);
  run.draft = null;
  run.screen = 'game';
  return true;
}

// --- night grades -------------------------------------------------------------
// Points for work done (hauls), for a decent score, and for a rich one —
// early seas are cheap, so the grade cannot ride on score alone. A snapped
// cable costs a point (two or more cost two). No hauls is always a C.
const GRADE_LETTERS = ['C', 'B', 'A', 'S'];
export function nightGrade(ns) {
  if (!ns || ns.hauls === 0) return 'C';
  let pts = (ns.hauls >= 5 ? 1 : 0) + (ns.score >= 300 ? 1 : 0) + (ns.score >= 1000 ? 1 : 0);
  pts -= ns.snaps >= 2 ? 2 : ns.snaps;
  return GRADE_LETTERS[Math.max(0, Math.min(3, pts))];
}

// --- camp actions (used by the camp screen clicks and by the bot) -----------

export function buyEquip(run, kind, idx) {
  if (kind === 'harpoon') {
    if (!run.ownedH[idx]) {
      if (run.coins < HARPOONS[idx].price) return false;
      run.coins -= HARPOONS[idx].price;
      run.ownedH[idx] = true;
    }
    run.harpoon = idx;
    return true;
  }
  if (kind === 'lure') {
    if (!run.ownedL[idx]) {
      if (run.coins < LURES[idx].price) return false;
      run.coins -= LURES[idx].price;
      run.ownedL[idx] = true;
    }
    run.lure = idx;
    return true;
  }
  if (kind === 'sea') {
    if (!run.seasOpen[idx]) {
      if (run.coins < SEAS[idx].unlock) return false;
      run.coins -= SEAS[idx].unlock;
      run.seasOpen[idx] = true;
    }
    run.sea = idx;
    return true;
  }
  return false;
}

export const boonsLabel = (run) =>
  run.boons.map((id) => (BOONS.find((b) => b.id === id) || {}).name || id).join(' • ');
