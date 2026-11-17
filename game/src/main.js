// main.js — one job: conduct. Owns the canvas, the frame loop, the view
// state (particles, shake, hit-stop, toast), the screens' flow, sound
// triggers, the attract demo behind the title, and the staged ?shot= states
// the screenshots are taken from. Rules live in fishing.js.
import { MONSTERS } from './data.js';
import { createRun, journalCount, emptyBest, betterBest } from './state.js';
import { step, buyEquip } from './fishing.js';
import { makeBot, botShop } from './bot.js';
import { makeInput } from './input.js';
import { initAudio, sfx } from './audio.js';
import { drawWorld, lurePos } from './render.js';
import { drawHUD, drawTitle, drawCamp, drawEnd, drawToast, campLayout } from './ui.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = makeInput(canvas);
const view = { t: 0, particles: [], shake: 0, freeze: 0, toast: null, toastT: 0, comboPop: 0, creakT: 0 };

let best = emptyBest();
try {
  const raw = localStorage.getItem('krakenwake-best');
  if (raw) best = { ...emptyBest(), ...JSON.parse(raw) };
} catch { /* private mode: play without a saved best */ }
function saveBest() {
  try { localStorage.setItem('krakenwake-best', JSON.stringify(best)); } catch { /* ignore */ }
}

let run = createRun((Math.random() * 1e9) | 0);
run.screen = 'title';
let demo = createRun(7);
const bot = makeBot();
let lastFightPos = null;

function burst(x, y, n, colors, speed = 190, size = 5) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.29;
    const v = speed * (0.3 + Math.random() * 0.7);
    view.particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 90,
      life: 0.55 + Math.random() * 0.4,
      maxLife: 0.9,
      color: colors[i % colors.length],
      size: size * (0.6 + Math.random() * 0.7),
    });
  }
}

function drainEvents(r) {
  for (const e of r.events) {
    if (e.type === 'telegraph') sfx.plip();
    else if (e.type === 'fake') sfx.fake();
    else if (e.type === 'bite') sfx.bite();
    else if (e.type === 'throw') sfx.throwIt();
    else if (e.type === 'strike') { sfx.strike(); view.freeze = 0.08; view.shake = 7; }
    else if (e.type === 'splash') {
      const p = lurePos(r);
      burst(p.x, p.y, 20, ['#dff2ff', '#9fd0ee', '#ffffff'], 210, 5);
      sfx.splash();
    } else if (e.type === 'haul') {
      const p = lastFightPos || lurePos(r);
      burst(p.x, p.y - 10, 22, ['#ffd94d', '#ffb52e', '#fff2b0'], 240, 5);
      sfx.coin();
      sfx.thud(e.kg);
      view.comboPop = 1;
      view.toast = { title: `${MONSTERS[e.mi].name} — ${e.kg.toFixed(1)} kg`, sub: `+${e.coins} coins • combo ×${r.combo}` };
      view.toastT = 2.2;
    } else if (e.type === 'snap') { sfx.snap(); view.shake = 9; }
    else if (e.type === 'escape') sfx.escape();
    else if (e.type === 'night') sfx.night();
    else if (e.type === 'end') {
      best = betterBest(best, r);
      saveBest();
      if (e.result === 'victory') sfx.win();
    }
  }
  r.events.length = 0;
}

function stepParticles(dt) {
  for (const p of view.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 520 * dt;
  }
  view.particles = view.particles.filter((p) => p.life > 0);
}

function startRun(seed) {
  run = createRun(seed);
  run.screen = 'game';
  view.toast = null;
  view.toastT = 0;
  view.particles = [];
}

function handleCampClicks() {
  for (const c of input.takeClicks()) {
    const { rows, hunt } = campLayout(run);
    if (c.x >= hunt.x && c.x <= hunt.x + hunt.w && c.y >= hunt.y && c.y <= hunt.y + hunt.h) {
      run.screen = 'game';
      sfx.click();
      continue;
    }
    for (const r of rows) {
      if (c.x >= r.x && c.x <= r.x + r.w && c.y >= r.y && c.y <= r.y + r.h) {
        if (buyEquip(run, r.kind, r.idx)) sfx.click();
      }
    }
  }
}

// --- staged states for the screenshots (?shot=NAME&seed=1) ------------------
function markCaught(r, list) {
  list.forEach(([i, count, kg]) => {
    r.bestiary[i].count = count;
    r.bestiary[i].bestKg = kg;
  });
}
function stageShot(name) {
  const r = createRun(1);
  r.screen = 'game';
  view.t = 1.35;
  if (name === 'cover') {
    r.night = 5; r.weatherIdx = 3; r.sea = 2; r.seasOpen = [true, true, true];
    r.coins = 1240; r.combo = 6; r.bestCombo = 6; r.throws = 34; r.hauled = 30;
    markCaught(r, [[0, 6, 4.1], [1, 4, 6.2], [2, 5, 8.4], [3, 1, 33.0], [4, 5, 9.1], [5, 3, 6.8], [6, 2, 19.4], [7, 5, 15.2], [8, 3, 38.6]]);
    r.phase = 'fight';
    r.castDist = 62;
    r.fight = { mi: 12, kg: 58, dist: 62, tension: 63, t: 2.2, snapT: 0, surgePhase: 1 };
    burst(800, 436, 16, ['#dff2ff', '#9fd0ee', '#ffffff'], 170, 5);
    return { r, mode: 'game' };
  }
  if (name === 'bite') {
    r.night = 2; r.weatherIdx = 1; r.sea = 1; r.seasOpen = [true, true, false];
    r.coins = 145; r.combo = 2; r.bestCombo = 2;
    markCaught(r, [[0, 3, 3.4], [1, 2, 5.0], [3, 1, 24.0]]);
    r.phase = 'wait';
    r.castDist = 58;
    r.wait = { t: 2, biteIn: 2, open: true, window: 0.4, telegraph: true, fakes: [], dip: 0.2 };
    return { r, mode: 'game' };
  }
  if (name === 'journal') {
    r.screen = 'camp';
    r.coins = 385; r.sea = 1; r.seasOpen = [true, true, false];
    r.harpoon = 1; r.ownedH = [true, true, false];
    r.lure = 2; r.ownedL = [true, true, true, false];
    markCaught(r, [[0, 6, 4.1], [1, 4, 6.2], [2, 5, 8.4], [3, 1, 33.0], [4, 5, 9.1], [5, 3, 6.8], [6, 2, 19.4]]);
    return { r, mode: 'camp' };
  }
  // victory
  r.screen = 'end';
  r.result = 'victory';
  r.night = 6; r.weatherIdx = 1; r.sea = 2;
  r.coins = 860; r.coinsEarned = 4210; r.bestCombo = 11; r.peakTension = 96;
  r.throws = 63; r.hauled = 47; r.biggestKg = 52.4; r.biggestName = 'Mother Kraken';
  markCaught(r, [[0, 4, 4.4], [1, 3, 6.6], [2, 4, 8.8], [3, 5, 36.2], [4, 2, 9.4], [5, 3, 7.2], [6, 4, 21.0], [7, 5, 16.8], [8, 2, 41.3], [9, 3, 10.9], [10, 4, 30.5], [11, 6, 18.2], [12, 2, 52.4]]);
  const shotBest = { result: 'BESTIARY COMPLETE', species: 13, biggestKg: 52.4, biggestName: 'Mother Kraken', combo: 11, coins: 4210 };
  return { r, mode: 'end', bestOverride: shotBest };
}

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
let shotState = null;
if (shot) {
  shotState = stageShot(shot);
  run = shotState.r;
}

let lastTs = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, lastTs ? (ts - lastTs) / 1000 : 0.016);
  lastTs = ts;
  const snap = input.frame();

  if (shotState) {
    ctx.clearRect(0, 0, 1280, 720);
    if (shotState.mode === 'camp') drawCamp(ctx, run);
    else if (shotState.mode === 'end') { drawWorld(ctx, run, view); drawEnd(ctx, run, shotState.bestOverride); }
    else { drawWorld(ctx, run, view); drawHUD(ctx, run, view); }
    return;
  }

  view.t += dt;
  view.toastT = Math.max(0, view.toastT - dt);
  view.comboPop = Math.max(0, view.comboPop - dt * 3);
  view.shake *= Math.pow(0.001, dt);
  if (view.shake < 0.05) view.shake = 0;

  if (run.screen === 'title') {
    // the attract demo plays itself behind the title
    if (demo.screen === 'end') demo = createRun(7);
    if (demo.phase === 'idle') botShop(demo);
    step(demo, dt, bot.input(demo));
    demo.events.length = 0;
    drawWorld(ctx, demo, view);
    drawTitle(ctx, demo, view, best);
    if (snap.pressed || snap.pressedKeys.has('Enter')) {
      initAudio();
      startRun((Math.random() * 1e9) | 0);
    }
    return;
  }

  if (run.screen === 'camp') {
    handleCampClicks();
    drawCamp(ctx, run);
    if (snap.pressedKeys.has('KeyS') || snap.pressedKeys.has('Escape')) run.screen = 'game';
    return;
  }

  if (run.screen === 'end') {
    drawWorld(ctx, run, view);
    drawEnd(ctx, run, best);
    if (snap.pressedKeys.has('KeyR')) startRun((Math.random() * 1e9) | 0);
    return;
  }

  // live game
  if (snap.pressedKeys.has('KeyR')) {
    startRun((Math.random() * 1e9) | 0);
    return;
  }
  if (snap.pressedKeys.has('KeyS') && run.phase === 'idle') {
    run.screen = 'camp';
    input.takeClicks();
    return;
  }
  if (run.fight) lastFightPos = lurePos(run);
  if (view.freeze > 0) {
    view.freeze -= dt;
  } else {
    step(run, dt, snap);
  }
  drainEvents(run);
  if (run.phase === 'fight' && run.fight) {
    view.creakT += dt;
    if (view.creakT > 0.13) {
      view.creakT = 0;
      sfx.creak(run.fight.tension / 100);
    }
  }
  stepParticles(dt);
  ctx.save();
  if (view.shake > 0) ctx.translate((Math.random() - 0.5) * view.shake, (Math.random() - 0.5) * view.shake);
  drawWorld(ctx, run, view);
  ctx.restore();
  drawHUD(ctx, run, view);
  drawToast(ctx, view);
}
requestAnimationFrame(frame);
void journalCount;
