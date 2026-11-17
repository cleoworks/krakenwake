// abilities.js — one job: the second layer of the fight. Weak points that
// reward a held chain, one telegraphed species event per family, and the
// SURGE meter. Pure logic: fight.js calls stepFightEvents /
// stepWeakPoint per tick and reads back the modifiers.
import { DIFFICULTIES, MONSTERS } from './data.js';

// Which family event each species owns, by MONSTERS index. Sailfin Horror
// (2) and Corpse Whale (3) have none; the King Wyrm (12) is 'slam',
// alternating with a plain lunge. Pale Monkfish (4): see the weak points.
const ABILITY_BY_INDEX = {
  0: 'lunge', 1: 'armor', 4: 'falseglow', 5: 'ink', 6: 'lunge', 7: 'armor',
  8: 'phase', 9: 'phase', 10: 'armor', 11: 'ink', 12: 'slam',
};
export const abilityOf = (mi) => ABILITY_BY_INDEX[mi] ?? null;

// The banner copy: the word, and the counter-play that answers it.
export const ABILITY_INFO = {
  lunge: { word: 'LUNGE', counter: 'SLACKEN!' },
  slam: { word: 'COIL SLAM', counter: 'SLACKEN — OR DASH!' },
  phase: { word: 'PHASE', counter: 'SLACKEN BEFORE THE YANK!' },
  armor: { word: 'ARMOR', counter: 'HIT THE WEAK POINT!' },
  ink: { word: 'INK', counter: 'HOLD YOUR NERVE!' },
};

// Telegraph lengths, seconds — long enough to read and react, no longer.
const TELE = { lunge: 0.7, slam: 1.0, phase: 0.8, armor: 0.7, ink: 0.6 };

export function initFightFx(run, f) {
  f.wpNext = run.rng.range(4, 7); // first weak point 4–7 s in
  f.wpT = 0;
  f.wpFake = false;
  f.wpDx = 0;
  f.wpDy = 0;
  f.evIn = run.rng.range(6, 10); // first species event 6–10 s in
  f.evCount = 0;
  f.event = null;
  f.surgeT = 0;
  f.vitalAcc = 0;
  f.vitalFlash = 0;
  f.spikeT = 0;
  f.inkT = 0;
  f.dashT = 0; // >0 while the dash step lasts: impacts whiff through him
  f.dashCd = 0; // the dash's cooldown, 1.2 s between steps
  f.counterT = 0; // >0 inside the counter window a perfect dodge opens
  f.vanishFlash = 0; // the VANISH! callout's lifetime
}

// A PERFECT DODGE: the impact landed while he was mid-dash, so the punish
// is negated outright — and the monster overcommits. The counter window
// opens: the weak point flares (forced open if it was hiding, never a
// fake) and VITAL work drains stamina at the counter rate while it lasts.
export function perfectDodge(run, f, emit) {
  f.counterT = 2.0;
  f.vanishFlash = 0.7;
  if (f.wpT <= 0) f.wpT = 2.0;
  f.wpFake = false;
  emit('perfectdodge', { mi: f.mi });
}

// Bank surge charge: hauls pay half a charge, vital ticks a quarter.
export function addSurge(run, amt) {
  if (run.surgeCharges >= 2) { run.surgeFill = 0; return; }
  run.surgeFill += amt;
  while (run.surgeFill >= 1 && run.surgeCharges < 2) {
    run.surgeFill -= 1;
    run.surgeCharges += 1;
  }
  if (run.surgeCharges >= 2) run.surgeFill = 0;
}

// The weak point: exposed for 1.2 s every 4–7 s. Holding through a real
// one pays VITAL ticks; the Pale Monkfish lies — half her glows are fakes.
export function stepWeakPoint(run, f, dt, input, emit) {
  f.vitalFlash = Math.max(0, f.vitalFlash - dt);
  if (f.wpT > 0) {
    f.wpT -= dt;
    if (!f.wpFake && input.hold) {
      f.vitalAcc += dt;
      while (f.vitalAcc >= 0.25) {
        f.vitalAcc -= 0.25;
        const tick = Math.round((2 + MONSTERS[f.mi].bulk * 0.4) * (1 + 0.1 * run.combo) * DIFFICULTIES[run.difficulty].mult);
        run.score += tick;
        run.nightStats.score += tick;
        addSurge(run, 0.25);
        f.vitalFlash = 0.5;
        emit('vital', { mi: f.mi, score: tick });
      }
    }
  } else {
    f.wpNext -= dt;
    if (f.wpNext <= 0) {
      f.wpT = 1.2;
      f.wpFake = abilityOf(f.mi) === 'falseglow' ? run.rng.chance(0.45) : false;
      f.wpDx = run.rng.range(-0.55, 0.55);
      f.wpDy = run.rng.range(-0.3, 0.25);
      f.wpNext = run.rng.range(4, 7);
      // first-night coaching: the run's first REAL weak point teaches itself
      if (!run.coachedWp && !f.wpFake) { run.coachedWp = true; run.coachWpT = 2.6; }
      emit('weakpoint', { mi: f.mi, fake: f.wpFake });
    }
  }
  return { exposed: f.wpT > 0, fake: f.wpFake };
}

function landEvent(run, f, e, input, emit) {
  emit('abilityland', { mi: f.mi, id: e.id });
  if (e.id === 'lunge') {
    e.phase = 'active';
    e.t = 0.5;
    if (input.hold && f.dashT > 0) perfectDodge(run, f, emit); // vanished through it
    else if (input.hold) f.spikeT = 0.5; // +25 tension across the next half second
  } else if (e.id === 'slam') {
    if (input.hold && f.dashT > 0) perfectDodge(run, f, emit);
    else if (input.hold) f.tension += 35;
    f.event = null;
    f.evIn = run.rng.range(6, 10);
  } else if (e.id === 'phase') {
    e.phase = 'active';
    e.t = 1.0;
  } else if (e.id === 'armor') {
    e.phase = 'active';
    e.t = 3.0;
  } else if (e.id === 'ink') {
    f.inkT = 2.5;
    f.event = null;
    f.evIn = run.rng.range(6, 10);
  }
}

// The species event clock. Returns the modifiers fight.js integrates
// with: armor (stamina regen triples unless a weak point is worked) and
// phaseSlack (hauling wasted, distance slips). Landings apply at the
// frame the telegraph ends, against that frame's input.
export function stepFightEvents(run, f, dt, input, emit) {
  const mods = { armor: false, phaseSlack: false };
  if (f.spikeT > 0) f.spikeT -= dt;
  if (f.inkT > 0) f.inkT -= dt;
  if (!f.event) {
    f.evIn -= dt;
    if (f.evIn <= 0 && f.t >= 3) {
      let id = abilityOf(f.mi);
      if (id === 'slam') id = f.evCount % 2 === 0 ? 'slam' : 'lunge';
      if (id && id !== 'falseglow') {
        f.evCount += 1;
        f.event = { id, phase: 'tele', t: TELE[id] };
        // first-night coaching: the run's first telegraph names its answers
        if (!run.coachedTele) { run.coachedTele = true; run.coachTeleT = 3.2; }
        emit('ability', { mi: f.mi, id });
      } else {
        f.evIn = run.rng.range(6, 10);
      }
    }
    return mods;
  }
  const e = f.event;
  e.t -= dt;
  if (e.phase === 'tele') {
    if (e.t <= 0) landEvent(run, f, e, input, emit);
    return mods;
  }
  if (e.id === 'phase') {
    mods.phaseSlack = true;
    f.dist += 4 * dt; // the line pays out while she is somewhere else
  }
  if (e.id === 'armor') mods.armor = true;
  if (e.t <= 0) {
    if (e.id === 'phase') {
      // the yank: braced for with a slack chain, or paid for in tension —
      // unless he dashed through the strike, which negates both prices
      if (f.dashT > 0) perfectDodge(run, f, emit);
      else if (input.hold) f.tension += 20;
      else f.dist += 3;
      emit('yank', { mi: f.mi });
    }
    f.event = null;
    f.evIn = run.rng.range(6, 10);
  }
  return mods;
}
