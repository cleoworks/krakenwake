// fishing.js — the whole game as pure logic: createRun(seed) + step(run, input, dt).
// No DOM, no canvas: Node imports this for the seeded bot proof, the browser
// imports it for play. Input is { hold, tap }; step returns event strings
// ('cast', 'bite', 'catch', ...) so the shell can play sounds and particles.
import { makeRng } from './rng.js';
import {
  SPECIES, RODS, BAITS, LOCATIONS, DAY_LEN, SEASON_DAYS,
  STRIKE_WINDOW, poolFor, weatherForDay,
} from './data.js';
import { newStats, recordBest } from './state.js';

export function createRun(seed) {
  const rng = makeRng(seed);
  const run = {
    seed, rng, t: 0, screen: 'play', phase: 'idle',
    day: 1, dayT: DAY_LEN, weather: weatherForDay(rng),
    coins: 0, combo: 0, location: 0, rod: 0, bait: 0,
    rodsOwned: [true, false, false], baitsOwned: [true, false, false, false],
    locsOpen: [true, false, false],
    charge: 0, chargeDir: 1, castPower: 0, tension: 0,
    cur: null, journal: {}, journalCount: 0, stats: newStats(),
    best: null, banner: '',
  };
  return run;
}

function pickFish(run) {
  const bait = BAITS[run.bait];
  const pool = poolFor(run.location);
  let total = 0;
  const weights = pool.map((sp) => {
    let w = sp.w * bait.tierMul[sp.tier];
    if (sp.tier >= 2) w *= run.weather.rare;
    total += w;
    return w;
  });
  let roll = run.rng.next() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function rollWeight(run, sp) {
  const [lo, hi] = sp.wt;
  return lo + (hi - lo) * Math.pow(run.rng.next(), 1.6);
}

function startFight(run, sp, kg) {
  run.cur = {
    sp, kg, dist: 22 + run.castPower * 24, stamina: sp.stam, maxStam: sp.stam,
    behavior: 'calm', bT: 1, redT: 0,
  };
  run.tension = 12;
  run.phase = 'fight';
}

function endSeason(run, events) {
  run.screen = run.journalCount >= SPECIES.length ? 'victory' : 'gameover';
  run.best = recordBest(run);
  events.push(run.screen);
}

function rollDay(run, events) {
  run.day += 1;
  if (run.day > SEASON_DAYS) { endSeason(run, events); return; }
  run.dayT = DAY_LEN;
  run.weather = weatherForDay(run.rng);
  run.cur = null; run.phase = 'idle'; run.tension = 0;
  run.banner = `Night ${run.day} — ${run.weather.name}`;
  events.push('day');
}

function catchFish(run, events) {
  const { sp, kg } = run.cur;
  const comboMul = 1 + 0.12 * Math.min(run.combo, 10); // combo pays, capped at x2.2
  const coins = Math.round(sp.base * (0.8 + (kg / sp.wt[1]) * 0.7) * comboMul);
  run.coins += coins;
  run.combo += 1;
  const st = run.stats;
  st.catches += 1; st.coinsEarned += coins;
  st.longestCombo = Math.max(st.longestCombo, run.combo);
  const rec = st.perSpecies[sp.id] ?? (st.perSpecies[sp.id] = { count: 0, best: 0 });
  rec.count += 1; rec.best = Math.max(rec.best, kg);
  if (!st.biggest || kg > st.biggest.kg) st.biggest = { id: sp.id, name: sp.name, kg };
  const isNew = !run.journal[sp.id];
  run.journal[sp.id] = rec;
  run.journalCount = Object.keys(run.journal).length;
  run.lastCatch = { sp, kg, coins, isNew };
  run.cur = null; run.tension = 0; run.phase = 'idle';
  events.push('catch');
  if (run.journalCount >= SPECIES.length) endSeason(run, events);
}

function loseFish(run, events, why) {
  run.cur = null; run.tension = 0; run.phase = 'idle'; run.combo = 0;
  events.push(why);
}

function stepFight(run, input, dt, events) {
  const cur = run.cur, sp = cur.sp, rod = RODS[run.rod];
  cur.bT -= dt;
  if (cur.bT <= 0) {
    const r = run.rng.next();
    if (r < 0.34) { cur.behavior = 'calm'; cur.bT = run.rng.range(1.0, 2.0); }
    else if (r < 0.64) { cur.behavior = 'run'; cur.bT = run.rng.range(0.6, 1.2); }
    else if (r < 0.86) { cur.behavior = 'dive'; cur.bT = run.rng.range(0.8, 1.4); }
    else { cur.behavior = cur.dist > 10 ? 'jump' : 'run'; cur.bT = 0.45; }
    if (cur.behavior !== 'calm') events.push('splash');
  }
  const tired = cur.stamina <= 0;
  const pull = tired ? 0.4
    : cur.behavior === 'run' ? sp.pull
    : cur.behavior === 'dive' ? sp.pull * 0.75
    : cur.behavior === 'jump' ? sp.pull * 0.4 : sp.pull * 0.25;
  if (input.hold) {
    cur.dist -= rod.reel * 6.2 * (tired ? 1.7 : 1) * dt;
    cur.dist += pull * 0.55 * dt;
    run.tension += (dt * (9 + pull * 3.4 + (cur.behavior === 'jump' ? 16 : 0))) / rod.control;
  } else {
    cur.dist += (pull * 0.6 + 1.0) * dt;
    run.tension -= dt * 40;
  }
  if (run.weather.gust) run.tension += Math.sin(run.t * 9.1) * run.weather.gust * 5 * dt;
  run.tension = Math.max(0, Math.min(105, run.tension));
  run.stats.peakTension = Math.max(run.stats.peakTension, Math.round(run.tension));
  if (run.tension > 30) {
    const drain = (dt * (run.tension / 100) * sp.stam) / 5;
    cur.stamina -= cur.behavior === 'jump' ? drain * 1.5 : drain;
  } else if (!input.hold) {
    cur.stamina = Math.min(cur.maxStam, cur.stamina + dt * 1.2);
  }
  if (run.tension >= 97) { cur.redT += dt; if (cur.redT > 1.2) { loseFish(run, events, 'snap'); return; } }
  else cur.redT = Math.max(0, cur.redT - dt * 2);
  if (cur.dist <= 2.5) { catchFish(run, events); return; }
  if (cur.dist >= 78) loseFish(run, events, 'escape');
}

export function step(run, input, dt) {
  const events = [];
  if (run.screen !== 'play') return events;
  run.t += dt;
  run.dayT -= dt;
  if (run.dayT <= 0) { rollDay(run, events); return events; }
  switch (run.phase) {
    case 'idle':
      if (input.tap) { run.phase = 'charge'; run.charge = 0; run.chargeDir = 1; }
      break;
    case 'charge':
      if (input.hold) {
        run.charge += run.chargeDir * dt * 1.5;
        if (run.charge >= 1) { run.charge = 1; run.chargeDir = -1; }
        if (run.charge <= 0) { run.charge = 0; run.chargeDir = 1; }
      } else {
        run.castPower = run.charge;
        run.stats.casts += 1;
        const wait = run.rng.range(1.8, 4.6) * BAITS[run.bait].wait * run.weather.bite;
        // a fake bite may tease the lure first; the real bite always
        // telegraphs a beat ahead, so the strike window feels fair
        const fakeAt = run.rng.chance(0.35) ? wait * run.rng.range(0.3, 0.55) : -1;
        run.cur = { waitT: wait, biteT: 0, fakeAt, faked: false, telegraphed: false };
        run.phase = 'wait';
        events.push('cast');
      }
      break;
    case 'wait':
      run.cur.waitT -= dt;
      if (!run.cur.faked && run.cur.fakeAt > 0 && run.cur.waitT <= run.cur.fakeAt) {
        run.cur.faked = true;
        events.push('fakebite');
      }
      if (!run.cur.telegraphed && run.cur.waitT <= 0.55) {
        run.cur.telegraphed = true;
        events.push('telegraph');
      }
      if (run.cur.waitT <= 0) {
        const sp = pickFish(run);
        run.cur = { sp, kg: rollWeight(run, sp), biteT: STRIKE_WINDOW * sp.win };
        run.phase = 'bite';
        events.push('bite');
      }
      break;
    case 'bite':
      if (input.tap) { startFight(run, run.cur.sp, run.cur.kg); events.push('strike'); }
      else {
        run.cur.biteT -= dt;
        if (run.cur.biteT <= 0) { run.cur = null; run.phase = 'idle'; events.push('spook'); }
      }
      break;
    case 'fight':
      stepFight(run, input, dt, events);
      break;
  }
  return events;
}

// --- Camp (shop + travel): every purchase is a hunting upgrade. ---
export function buyRod(run, i) {
  if (run.rodsOwned[i] || run.coins < RODS[i].cost) return false;
  run.coins -= RODS[i].cost; run.rodsOwned[i] = true; run.rod = i;
  return true;
}
export function equipRod(run, i) { if (run.rodsOwned[i]) run.rod = i; }
export function buyBait(run, i) {
  if (run.baitsOwned[i]) { run.bait = i; return true; }
  if (run.coins < BAITS[i].cost) return false;
  run.coins -= BAITS[i].cost; run.baitsOwned[i] = true; run.bait = i;
  return true;
}
export function travelTo(run, i) {
  if (run.locsOpen[i]) { run.location = i; return true; }
  if (run.coins < LOCATIONS[i].cost) return false;
  run.coins -= LOCATIONS[i].cost; run.locsOpen[i] = true; run.location = i;
  return true;
}
export function poolMissing(run, loc) {
  return poolFor(loc).filter((sp) => !run.journal[sp.id]);
}
