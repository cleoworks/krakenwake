// fishing.js — one job: the rules of the hunt, as pure logic. createRun lives
// in state.js; step() advances a run by dt given {hold, pressed, released}.
// No DOM, no canvas, no audio: Node imports this file for the seeded proof.
import { MONSTERS, HARPOONS, LURES, WEATHERS, DIFFICULTIES, NIGHT_SECONDS, SEASON_NIGHTS, poolFor } from './data.js';
import { journalCount } from './state.js';
import { hasBoon, makeDraftChoices, nightGrade } from './salvage.js';
import { initFightFx, stepFightEvents, stepWeakPoint, addSurge } from './abilities.js';

const ev = (run, type, data = {}) => run.events.push({ type, ...data });

export function earnFeat(run, id) {
  if (run.feats[id]) return;
  run.feats[id] = true;
  ev(run, 'feat', { id });
}

function finish(run, result) {
  if (result === 'victory') earnFeat(run, 'full');
  run.result = result;
  run.screen = 'end';
  run.phase = 'idle';
  run.wait = null;
  run.fight = null;
  ev(run, 'end', { result });
}

// The night that just ended is graded and its feats settled; then, unless
// the season is over, the salvage draft opens before the next night.
function endNight(run) {
  const ns = run.nightStats;
  run.nightGrades.push(nightGrade(ns));
  if (ns.hauls > 0 && ns.snaps === 0) earnFeat(run, 'untouched');
  if (ns.coins >= 2000) earnFeat(run, 'rich');
  const wname = WEATHERS[run.weatherIdx].name;
  if (wname === 'Gale' || wname === 'Blood Moon') earnFeat(run, 'storm');
  if (run.night >= SEASON_NIGHTS) return finish(run, 'over');
  run.night += 1;
  run.nightT = 0;
  run.weatherIdx = run.rng.int(0, WEATHERS.length - 1);
  run.nightStats = { hauls: 0, snaps: 0, coins: 0, score: 0 };
  run.charmReady = true;
  run.phase = 'idle';
  run.wait = null;
  run.fight = null;
  run.draft = { choices: makeDraftChoices(run), afterNight: run.night - 1 };
  run.screen = 'draft';
  ev(run, 'night', { night: run.night });
  ev(run, 'draft', { afterNight: run.draft.afterNight });
}

// Which monster answers the lure: this sea's pool, the Kraken only when the
// Doom Bell rings, uncaught monsters far more likely, rares boosted by weather.
function pickMonster(run) {
  const lure = LURES[run.lure];
  const odds = WEATHERS[run.weatherIdx].odds;
  const glow = hasBoon(run, 'glow');
  const pool = poolFor(run.sea).filter((i) => !MONSTERS[i].doom || lure.doom);
  let total = 0;
  const weights = pool.map((i) => {
    let w = MONSTERS[i].weight;
    if (run.bestiary[i].count === 0) w *= 2.0;
    if (MONSTERS[i].weight <= 13) w *= odds;
    if (glow && MONSTERS[i].weight <= 13) w *= 1.6; // Glow Bait: rares answer
    total += w;
    return w;
  });
  let roll = run.rng.next() * total;
  for (let k = 0; k < pool.length; k++) {
    roll -= weights[k];
    if (roll <= 0) return pool[k];
  }
  return pool[pool.length - 1];
}

function startWait(run) {
  const lure = LURES[run.lure];
  const weather = WEATHERS[run.weatherIdx];
  // Storm Sails halves a weather penalty (a bite factor above 1); Blood
  // Chum shaves a fifth off every wait.
  let wBite = weather.bite;
  if (hasBoon(run, 'sails') && wBite > 1) wBite = 1 + (wBite - 1) / 2;
  const biteIn = run.rng.range(1.6, 4.2) * lure.bite * wBite * (hasBoon(run, 'chum') ? 0.8 : 1);
  const fakes = [];
  if (run.rng.chance(0.35) && biteIn > 1.4) fakes.push(run.rng.range(0.5, biteIn - 0.8));
  if (run.rng.chance(0.15) && biteIn > 2.2) fakes.push(run.rng.range(0.4, biteIn - 1.0));
  run.wait = { t: 0, biteIn, open: false, window: 0, telegraph: false, fakes, dip: 0 };
  run.phase = 'wait';
}

function startFight(run) {
  const mi = pickMonster(run);
  const m = MONSTERS[mi];
  // Heavy Sinkers flatten the weight roll: heavier specimens take the lure.
  const roll = hasBoon(run, 'sinkers') ? Math.pow(run.rng.next(), 0.85) : Math.pow(run.rng.next(), 1.25);
  const kg = m.kgMin + roll * (m.kgMax - m.kgMin);
  run.fight = { mi, kg, dist: run.castDist, tension: 12, t: 0, snapT: 0, surgePhase: run.rng.range(0, 6.28), stamina: 100 };
  initFightFx(run, run.fight);
  run.wait = null;
  run.phase = 'fight';
  ev(run, 'strike', { mi });
  ev(run, 'splash', { mi });
}

function haul(run) {
  const f = run.fight;
  const m = MONSTERS[f.mi];
  const comboMult = 1 + 0.1 * run.combo;
  const gained = Math.round((6 + f.kg * m.vpk) * comboMult);
  // SCORE is its own currency: haul value x combo x difficulty.
  const scoreGain = Math.round((6 + f.kg * m.vpk) * comboMult * DIFFICULTIES[run.difficulty].mult);
  run.coins += gained;
  run.coinsEarned += gained;
  run.score += scoreGain;
  run.nightStats.hauls += 1;
  run.nightStats.coins += gained;
  run.nightStats.score += scoreGain;
  run.combo += 1;
  addSurge(run, 0.5); // every haul banks half a SURGE charge
  run.bestCombo = Math.max(run.bestCombo, run.combo);
  run.hauled += 1;
  const b = run.bestiary[f.mi];
  b.count += 1;
  b.bestKg = Math.max(b.bestKg, f.kg);
  if (f.kg > run.biggestKg) {
    run.biggestKg = f.kg;
    run.biggestName = m.name;
  }
  earnFeat(run, 'first');
  if (f.kg >= 50) earnFeat(run, 'heavy');
  if (f.mi === 12) earnFeat(run, 'kraken');
  if (run.bestCombo >= 8) earnFeat(run, 'combo8');
  ev(run, 'haul', { mi: f.mi, kg: f.kg, coins: gained, score: scoreGain });
  run.fight = null;
  run.phase = 'idle';
  if (journalCount(run) >= 13) finish(run, 'victory');
}

function stepWait(run, dt, input) {
  const w = run.wait;
  w.t += dt;
  w.dip = Math.max(0, w.dip - dt);
  for (const ft of w.fakes) {
    if (w.t - dt < ft && w.t >= ft) {
      w.dip = 0.35;
      ev(run, 'fake');
    }
  }
  if (!w.telegraph && w.t >= w.biteIn - 0.55) {
    w.telegraph = true;
    ev(run, 'telegraph');
  }
  if (!w.open && w.t >= w.biteIn) {
    w.open = true;
    w.window = hasBoon(run, 'aperture') ? 0.75 : 0.5; // Wide Aperture
    ev(run, 'bite');
  }
  if (w.open) {
    if (input.pressed) return startFight(run);
    w.window -= dt;
    if (w.window <= 0) {
      run.wait = null;
      run.phase = 'idle';
      ev(run, 'escape');
    }
  }
}

// The fight, with stamina: a FRESH monster pulls at full strength and reels
// in slowly. Holding the cable in the yellow/red drains it; thrashing drains
// it too. Slacken and it breathes again (slower with Iron Grip, faster on
// LEVIATHAN). A SPENT monster comes in fast and pulls weak.
export const staminaWord = (s) => (s > 70 ? 'FRESH' : s > 40 ? 'WINDING' : s > 15 ? 'TIRING' : 'SPENT');
// The fight's floating callouts share one column over the monster: the
// stamina word holds the bottom line, VITAL! and THRASHING! take the
// lines above it in that order. Returns each callout's line number
// (0 = not showing) so the three never print on top of each other.
export function calloutLines(f) {
  const surge01 = 0.5 + 0.5 * Math.sin(f.t * 1.6 + f.surgePhase) * Math.sin(f.t * 0.53 + 1.7);
  const lines = { vital: 0, thrash: 0 };
  let n = 0;
  if (f.vitalFlash > 0 && f.wpT > 0) lines.vital = ++n;
  if (surge01 > 0.78) lines.thrash = ++n;
  return lines;
}
export const snapPoint = (run) => (hasBoon(run, 'cable') ? 106 : 100);

function stepFight(run, dt, input) {
  const f = run.fight;
  const m = MONSTERS[f.mi];
  const gear = HARPOONS[run.harpoon];
  const diff = DIFFICULTIES[run.difficulty];
  f.t += dt;
  const emit = (type, data = {}) => ev(run, type, data);
  const mods = stepFightEvents(run, f, dt, input, emit);
  const held = input.hold && !mods.phaseSlack; // a phased cable cannot be worked
  const wp = stepWeakPoint(run, f, dt, { ...input, hold: held }, emit);
  const surge01 = 0.5 + 0.5 * Math.sin(f.t * 1.6 + f.surgePhase) * Math.sin(f.t * 0.53 + 1.7);
  const st = f.stamina / 100;
  const load = m.power * diff.power * (0.35 + 0.65 * Math.max(0, surge01)) * (0.85 + 0.3 * st);
  // SURGE: spend a banked charge for 1.5 s of double reel on a hotter cable
  if (f.surgeT > 0) f.surgeT -= dt;
  const surgeKey = input.surge || (input.pressedKeys && input.pressedKeys.has('KeyF'));
  if (surgeKey && !mods.phaseSlack && run.surgeCharges > 0 && f.surgeT <= 0) {
    run.surgeCharges -= 1;
    f.surgeT = 1.5;
    ev(run, 'surge', { mi: f.mi });
  }
  if (held) {
    let dT = (load * 2.05 - gear.control * 1.55) * dt;
    if (f.surgeT > 0 && dT > 0) dT *= 1.5; // the surge climbs the tension faster
    f.tension += dT;
    const reelRate = gear.reel * (hasBoon(run, 'winch') ? 1.25 : 1) * (f.surgeT > 0 ? 2 : 1);
    f.dist -= reelRate * Math.max(0.35, 1.12 - f.tension / 160) * (0.68 + 0.32 * (1 - st)) * dt;
    if (wp.exposed && wp.fake) {
      f.tension += 12 * dt; // hauling on a pale lie: no drain, and the cable pays
    } else if (mods.armor && !wp.exposed) {
      f.stamina += 24 * dt; // the shell drinks the pull — triple regen
    } else if (f.tension >= 50) {
      f.stamina -= (8 + (f.tension - 50) * 0.28) * (wp.exposed ? 2.2 : 1) * dt;
    }
  } else {
    f.tension -= 46 * dt;
    f.dist += (2 + m.power * 0.05) * dt;
    f.stamina += (mods.armor ? 24 : 8 * diff.regen * (hasBoon(run, 'grip') ? 0.5 : 1)) * dt;
  }
  if (f.spikeT > 0) f.tension += 50 * dt; // a lunge you held through lands now
  if (surge01 > 0.7) f.stamina -= 4 * dt; // thrashing tires it either way
  f.stamina = Math.min(100, Math.max(0, f.stamina));
  const snapAt = snapPoint(run);
  f.tension = Math.min(snapAt + 5, Math.max(0, f.tension));
  run.peakTension = Math.max(run.peakTension, Math.min(100, f.tension));
  if (f.tension >= snapAt) {
    f.snapT += dt;
    if (f.snapT > 0.7) {
      if (hasBoon(run, 'charm') && run.charmReady) {
        // the charm takes the snap: combo survives, the fight goes on
        run.charmReady = false;
        f.tension = 55;
        f.snapT = 0;
        ev(run, 'charm', { mi: f.mi });
      } else {
        run.combo = 0;
        run.nightStats.snaps += 1;
        run.fight = null;
        run.phase = 'idle';
        ev(run, 'snap', { mi: f.mi });
        return;
      }
    }
  } else {
    f.snapT = Math.max(0, f.snapT - dt * 2);
  }
  if (f.dist <= 0) return haul(run);
  if (f.t > 30) {
    run.fight = null;
    run.phase = 'idle';
    ev(run, 'escape');
  }
}

export function step(run, dt, input = {}) {
  if (run.screen !== 'game') return;
  run.nightT += dt;
  if (run.nightT >= NIGHT_SECONDS) {
    endNight(run);
    return;
  }
  if (run.phase === 'idle') {
    if (input.pressed) {
      run.phase = 'charge';
      run.charge = 0;
      run.chargeDir = 1;
    }
  } else if (run.phase === 'charge') {
    if (input.hold) {
      run.charge += run.chargeDir * dt * 1.35;
      if (run.charge >= 1) { run.charge = 1; run.chargeDir = -1; }
      if (run.charge <= 0) { run.charge = 0; run.chargeDir = 1; }
    }
    if (input.released) {
      run.throws += 1;
      run.castDist = 34 + run.charge * 56;
      ev(run, 'throw', { dist: run.castDist });
      startWait(run);
    }
  } else if (run.phase === 'wait') {
    stepWait(run, dt, input);
  } else if (run.phase === 'fight') {
    stepFight(run, dt, input);
  }
}

