// main.js — boot, the frame loop, screen routing, sound/particle wiring,
// the title attract demo, the ?bot= autopilot and the ?shot= staging used
// to render the entry's screenshots from the game's own render path.
// The juice lives here: hit-stop and shake on the strike, coin bursts and
// a weight-scaled drum on the haul, a combo pop when the chain grows.
import { createRun, step, buyRod, equipRod, buyBait, travelTo } from './fishing.js';
import { makeBot, botInput, botCamp } from './bot.js';
import { makeInput } from './input.js';
import { initAudio, sfx, ambience } from './audio.js';
import { drawWorld, bobberX, fishX, WATER_Y } from './render.js';
import { drawHUD, drawTitle, drawCamp, drawEnd } from './ui.js';
import { loadBest } from './state.js';
import { SPECIES, WEATHERS } from './data.js';

// particles live here: splash bursts, coin bursts, sparkles
function spawnSplash(view, x, y, n = 16, color = '#dff4ff') {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI - Math.PI;
    view.fx.push({
      x, y, vx: Math.cos(a) * (30 + Math.random() * 90), vy: -40 - Math.random() * 110,
      life: 0.7 + Math.random() * 0.3, color, size: 1.6 + Math.random() * 2.6,
    });
  }
}
function stepFx(view, dt) {
  for (const p of view.fx) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt * 1.4; }
  view.fx = view.fx.filter((p) => p.life > 0);
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const input = makeInput(canvas);
const view = { t: 0, fx: [], catchAge: 9, bannerAge: 9, buttons: [], freeze: 0, shake: 0, comboPop: 0, fakeAge: 9 };
let lastSplash = 0;

let mode = 'title';
let run = createRun(7);
let demo = createRun(11);
const demoBot = makeBot();
let bot = null, botMem = null;
let best = loadBest();

function handleEvents(events, r) {
  for (const e of events) {
    if (e === 'cast') { sfx.cast(); spawnSplash(view, bobberX(r), WATER_Y, 8); }
    else if (e === 'telegraph') { sfx.plip(); }
    else if (e === 'fakebite') { view.fakeAge = 0; sfx.plip(); spawnSplash(view, bobberX(r), WATER_Y, 5); }
    else if (e === 'bite') { sfx.plip(); spawnSplash(view, bobberX(r), WATER_Y, 10); }
    else if (e === 'strike') {
      sfx.strike();
      view.freeze = 0.08; view.shake = 7; // hit-stop: the harpoon landing lands
      if (r.phase === 'fight') spawnSplash(view, fishX(r), WATER_Y, 20);
    }
    else if (e === 'splash') { if (view.t - lastSplash > 0.3) { lastSplash = view.t; sfx.splash(); if (r.phase === 'fight') spawnSplash(view, fishX(r), WATER_Y, 7); } }
    else if (e === 'catch') {
      sfx.coin(); sfx.drum(r.lastCatch.kg);
      view.catchAge = 0; view.comboPop = 1;
      spawnSplash(view, 300, WATER_Y - 10, 18, '#ffe9a8');
      spawnSplash(view, 330, WATER_Y - 26, 12, '#ffd23e'); // the coin burst
    }
    else if (e === 'snap') { sfx.snap(); view.shake = 5; }
    else if (e === 'spook' || e === 'escape') sfx.spook();
    else if (e === 'day') { sfx.day(); view.bannerAge = 0; }
    else if (e === 'victory') { sfx.win(); best = r.best ?? best; }
    else if (e === 'gameover') { sfx.lose(); best = r.best ?? best; }
  }
}

function campClick(action) {
  const [kind, arg] = action.split(':');
  const i = Number(arg);
  if (kind === 'buyRod') buyRod(run, i) ? sfx.coin() : sfx.click();
  else if (kind === 'equipRod') { equipRod(run, i); sfx.click(); }
  else if (kind === 'buyBait') buyBait(run, i) ? sfx.coin() : sfx.click();
  else if (kind === 'travel') { if (travelTo(run, i)) { run.phase = 'idle'; run.cur = null; sfx.day(); } }
  else if (kind === 'close') { run.screen = 'play'; sfx.click(); }
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, frame.dt ?? 0.016);
  frame.dt = undefined;
  view.t += dt; view.catchAge += dt; view.bannerAge += dt; view.fakeAge += dt;
  view.comboPop = Math.max(0, view.comboPop - dt * 2.6);
  view.shake = Math.max(0, view.shake - dt * 26);
  stepFx(view, dt);
  const keys = [...input.keys], clicks = [...input.clicks];
  // hit-stop: while frozen, the world holds its breath but still draws
  const frozen = view.freeze > 0;
  if (frozen) view.freeze -= dt;
  ctx.save();
  if (view.shake > 0.2) ctx.translate((Math.random() - 0.5) * view.shake, (Math.random() - 0.5) * view.shake);

  if (mode === 'title') {
    if (!frozen) {
      if (demo.screen === 'camp') { if (!botCamp(demo)) demo.screen = 'play'; }
      else if (demo.screen === 'play') handleEvents(step(demo, botInput(demo, demoBot), dt), demo);
      else demo = createRun(11 + ((Math.random() * 90) | 0));
    }
    drawWorld(ctx, demo, view);
    drawTitle(ctx, demo, view, best);
    if (input.tap || keys.includes('Space') || clicks.length) startGame();
    input.consume();
    ctx.restore();
    return;
  }

  // in game
  if (run.screen === 'victory' || run.screen === 'gameover') {
    if (keys.includes('KeyR')) { startGame(); input.consume(); ctx.restore(); return; }
  } else if (keys.includes('KeyR') && run.phase === 'idle') {
    startGame(); input.consume(); ctx.restore(); return;
  }
  if (run.screen === 'camp') {
    view.buttons = [];
    drawWorld(ctx, run, view);
    drawCamp(ctx, run, view.buttons);
    for (const c of clicks) {
      const b = view.buttons.find((b) => c.x >= b.x && c.x <= b.x + b.w && c.y >= b.y && c.y <= b.y + b.h);
      if (b) { campClick(b.action); input.tap = false; }
    }
    if (keys.includes('Escape') || keys.includes('KeyS')) run.screen = 'play';
    input.consume();
    ctx.restore();
    return;
  }
  if ((keys.includes('KeyS') || keys.includes('KeyJ')) && run.phase === 'idle') {
    run.screen = 'camp'; input.consume(); ctx.restore(); return;
  }

  let inp = input;
  if (bot) {
    if (run.screen === 'camp') { if (!botCamp(run)) run.screen = 'play'; inp = { hold: false, tap: false }; }
    else inp = botInput(run, botMem);
  }
  if (!frozen) {
    const events = step(run, inp, dt);
    handleEvents(events, run);
  }
  ambience(run.weather.id, run.phase === 'fight' && inp.hold, run.tension);
  drawWorld(ctx, run, view);
  drawHUD(ctx, run, view);
  if (run.screen === 'victory' || run.screen === 'gameover') drawEnd(ctx, run, view);
  if (bot) { ctx.font = "700 20px system-ui"; ctx.fillStyle = '#ffd94d'; ctx.fillText('AUTOPILOT DEMO', 24, 706); }
  input.consume();
  ctx.restore();
}

function startGame() {
  initAudio();
  const seed = Number(params.get('seed')) || (Date.now() % 100000);
  run = createRun(seed);
  mode = 'game';
  if (params.get('bot')) { bot = true; botMem = makeBot(); }
}

// --- screenshot staging: exact scenes, rendered by the real render path ---
function fillJournal(r, entries) {
  for (const [id, count, kg] of entries) {
    const sp = SPECIES.find((s) => s.id === id);
    r.journal[id] = { count, best: kg };
    r.stats.perSpecies[id] = { count, best: kg };
  }
  r.journalCount = Object.keys(r.journal).length;
}
function stage(name) {
  const r = createRun(1);
  mode = 'game';
  if (name === 'cover') {
    r.location = 2; r.locsOpen = [true, true, true]; r.rod = 2; r.bait = 3;
    r.rodsOwned = [true, true, true]; r.baitsOwned = [true, true, true, true];
    r.coins = 1240; r.combo = 6; r.day = 5; r.dayT = 41; r.weather = WEATHERS[1]; // Blood Moon
    fillJournal(r, [['eel', 6, 0.1], ['crab', 4, 0.4], ['sailfin', 5, 2.1], ['whale', 1, 2.8],
      ['monkfish', 5, 0.5], ['witch', 3, 1.6], ['shark', 2, 5.9], ['king', 1, 1.9], ['ghost', 4, 0.8]]);
    r.stats.casts = 41; r.stats.catches = 31; r.stats.coinsEarned = 2380; r.stats.longestCombo = 8;
    r.stats.biggest = { id: 'shark', name: 'Ironjaw Shark', kg: 5.9 };
    r.castPower = 0.8; r.phase = 'fight'; r.tension = 63; // marker on the green/yellow boundary
    const sp = SPECIES.find((s) => s.id === 'kraken');
    r.cur = { sp, kg: 47.2, dist: 62, stamina: 30, maxStam: sp.stam, behavior: 'run', bT: 1, redT: 0 };
    let s = 42; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 10; i++) view.fx.push({ x: 780 + rnd() * 130, y: WATER_Y - rnd() * 46, vx: 0, vy: 0, life: 0.9, color: i % 3 ? '#dff4ff' : '#ffd23e', size: 2 + rnd() * 2.6 });
  } else if (name === 'bite') {
    r.location = 1; r.locsOpen = [true, true, false]; r.day = 2; r.dayT = 58;
    r.weather = WEATHERS[2]; r.coins = 145; r.combo = 2; r.castPower = 0.62;
    fillJournal(r, [['eel', 3, 0.09], ['crab', 2, 0.3], ['sailfin', 1, 1.4]]);
    r.stats.casts = 9; r.stats.catches = 6;
    const sp = SPECIES.find((s) => s.id === 'witch');
    r.phase = 'bite'; r.cur = { sp, kg: 1.1, biteT: 0.4 };
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 6; i++) view.fx.push({ x: bobberX(r) - 20 + rnd() * 40, y: WATER_Y - rnd() * 26, vx: 0, vy: 0, life: 0.85, color: '#dff4ff', size: 1.8 + rnd() * 2 });
  } else if (name === 'journal') {
    r.location = 1; r.locsOpen = [true, true, false]; r.coins = 385; r.day = 3;
    r.rodsOwned = [true, true, false]; r.rod = 1; r.baitsOwned = [true, true, true, false]; r.bait = 2;
    fillJournal(r, [['eel', 6, 0.1], ['crab', 4, 0.4], ['sailfin', 5, 2.1], ['whale', 1, 2.8],
      ['monkfish', 5, 0.5], ['witch', 3, 1.6], ['shark', 2, 5.9]]);
    r.screen = 'camp';
  } else if (name === 'victory') {
    r.location = 2; r.day = 6; r.coins = 860;
    fillJournal(r, SPECIES.map((sp, i) => [sp.id, 2 + (i % 4), sp.wt[0] + (sp.wt[1] - sp.wt[0]) * 0.62]));
    r.stats.casts = 63; r.stats.catches = 47; r.stats.coinsEarned = 4210;
    r.stats.longestCombo = 11; r.stats.peakTension = 96;
    r.stats.biggest = { id: 'kraken', name: 'Mother Kraken', kg: 52.4 };
    r.screen = 'victory';
    r.best = { result: 'BESTIARY COMPLETE', species: 13, biggestKg: 52.4, biggestName: 'Mother Kraken', combo: 11, coins: 4210, day: 6 };
  }
  return r;
}

const shot = params.get('shot');
if (shot) {
  run = stage(shot);
  view.t = shot === 'victory' ? 4.4 : 3.7; // land each blink cycle on a visible beat
  const renderShot = () => {
    drawWorld(ctx, run, view);
    if (run.screen === 'camp') { view.buttons = []; drawCamp(ctx, run, view.buttons); }
    else if (run.screen === 'victory' || run.screen === 'gameover') { drawHUD(ctx, run, view); drawEnd(ctx, run, view); }
    else drawHUD(ctx, run, view);
    requestAnimationFrame(renderShot);
  };
  renderShot();
} else {
  if (params.get('bot')) startGame();
  let prev = performance.now();
  const loop = (now) => { frame.dt = Math.min(0.05, (now - prev) / 1000); prev = now; frame(now); };
  requestAnimationFrame(loop);
}
