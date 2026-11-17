// fishing.js — one job: the rules of the hunt, as pure logic. createRun lives
// in state.js; step() advances a run by dt given {hold, pressed, released}.
// No DOM, no canvas, no audio: Node imports this file for the seeded proof.
import { MONSTERS, SEAS, HARPOONS, LURES, WEATHERS, NIGHT_SECONDS, SEASON_NIGHTS, poolFor } from './data.js';
import { journalCount } from './state.js';

const ev = (run, type, data = {}) => run.events.push({ type, ...data });

function finish(run, result) {
  run.result = result;
  run.screen = 'end';
  run.phase = 'idle';
  run.wait = null;
  run.fight = null;
  ev(run, 'end', { result });
}

function endNight(run) {
  if (run.night >= SEASON_NIGHTS) return finish(run, 'over');
  run.night += 1;
  run.nightT = 0;
  run.weatherIdx = run.rng.int(0, WEATHERS.length - 1);
  run.phase = 'idle';
  run.wait = null;
  run.fight = null;
  ev(run, 'night', { night: run.night });
}

// Which monster answers the lure: this sea's pool, the Kraken only when the
// Doom Bell rings, uncaught monsters far more likely, rares boosted by weather.
function pickMonster(run) {
  const lure = LURES[run.lure];
  const odds = WEATHERS[run.weatherIdx].odds;
  const pool = poolFor(run.sea).filter((i) => !MONSTERS[i].doom || lure.doom);
  let total = 0;
  const weights = pool.map((i) => {
    let w = MONSTERS[i].weight;
    if (run.bestiary[i].count === 0) w *= 2.0;
    if (MONSTERS[i].weight <= 13) w *= odds;
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
  const biteIn = run.rng.range(1.6, 4.2) * lure.bite * weather.bite;
  const fakes = [];
  if (run.rng.chance(0.35) && biteIn > 1.4) fakes.push(run.rng.range(0.5, biteIn - 0.8));
  if (run.rng.chance(0.15) && biteIn > 2.2) fakes.push(run.rng.range(0.4, biteIn - 1.0));
  run.wait = { t: 0, biteIn, open: false, window: 0, telegraph: false, fakes, dip: 0 };
  run.phase = 'wait';
}

function startFight(run) {
  const mi = pickMonster(run);
  const m = MONSTERS[mi];
  const kg = m.kgMin + Math.pow(run.rng.next(), 1.25) * (m.kgMax - m.kgMin);
  run.fight = { mi, kg, dist: run.castDist, tension: 12, t: 0, snapT: 0, surgePhase: run.rng.range(0, 6.28) };
  run.wait = null;
  run.phase = 'fight';
  ev(run, 'strike', { mi });
  ev(run, 'splash', { mi });
}

function haul(run) {
  const f = run.fight;
  const m = MONSTERS[f.mi];
  const gained = Math.round((6 + f.kg * m.vpk) * (1 + 0.1 * run.combo));
  run.coins += gained;
  run.coinsEarned += gained;
  run.combo += 1;
  run.bestCombo = Math.max(run.bestCombo, run.combo);
  run.hauled += 1;
  const b = run.bestiary[f.mi];
  b.count += 1;
  b.bestKg = Math.max(b.bestKg, f.kg);
  if (f.kg > run.biggestKg) {
    run.biggestKg = f.kg;
    run.biggestName = m.name;
  }
  ev(run, 'haul', { mi: f.mi, kg: f.kg, coins: gained });
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
    w.window = 0.5;
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

function stepFight(run, dt, input) {
  const f = run.fight;
  const m = MONSTERS[f.mi];
  const gear = HARPOONS[run.harpoon];
  f.t += dt;
  const surge01 = 0.5 + 0.5 * Math.sin(f.t * 1.6 + f.surgePhase) * Math.sin(f.t * 0.53 + 1.7);
  const load = m.power * (0.35 + 0.65 * Math.max(0, surge01));
  if (input.hold) {
    f.tension += (load * 2.05 - gear.control * 1.55) * dt;
    f.dist -= gear.reel * Math.max(0.35, 1.12 - f.tension / 160) * dt;
  } else {
    f.tension -= 46 * dt;
    f.dist += (2 + m.power * 0.05) * dt;
  }
  f.tension = Math.min(105, Math.max(0, f.tension));
  run.peakTension = Math.max(run.peakTension, Math.min(100, f.tension));
  if (f.tension >= 100) {
    f.snapT += dt;
    if (f.snapT > 0.7) {
      run.combo = 0;
      run.fight = null;
      run.phase = 'idle';
      ev(run, 'snap', { mi: f.mi });
      return;
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

// --- camp actions (used by the camp screen clicks and by the bot) ---

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
