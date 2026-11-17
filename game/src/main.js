// main.js — one job: conduct. Owns the canvas, the frame loop, the view
// state (particles, shake, hit-stop, toast), the screens' flow (briefing,
// game, camp, draft, end), sound triggers, the attract demo inside the
// briefing, and the staged ?shot= states the screenshots are taken from.
// Rules live in fishing.js; the meta layer in salvage.js.
import { MONSTERS, FEATS } from './data.js';
import { createRun, journalCount, emptyBest, betterBest, gradeForScore } from './state.js';
import { step } from './fishing.js';
import { buyEquip, pickBoon } from './salvage.js';
import { makeBot, botShop, botDraft } from './bot.js';
import { makeInput } from './input.js';
import { initAudio, sfx } from './audio.js';
import { drawWorld, lurePos } from './render.js';
import { drawHUD, drawToast } from './ui.js';
import { drawBriefing, briefingLayout } from './briefing.js';
import { drawCamp, campLayout } from './camp.js';
import { drawDraft, draftLayout } from './draft.js';
import { drawEnd } from './end.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = makeInput(canvas);
const view = { t: 0, particles: [], shake: 0, freeze: 0, toast: null, toastT: 0, comboPop: 0, creakT: 0 };

function loadJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveJson(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* private mode */ }
}
let best = { ...emptyBest(), ...(loadJson('krakenwake-best') || {}) };
if (!best.result) best = emptyBest();
let last = loadJson('krakenwake-last');
let difficultySel = loadJson('krakenwake-difficulty') ?? 0;

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
      (r.tonightHauls ??= []).push({ mi: e.mi, kg: e.kg, coins: e.coins });
      const p = lastFightPos || lurePos(r);
      burst(p.x, p.y - 10, 22, ['#ffd94d', '#ffb52e', '#fff2b0'], 240, 5);
      sfx.coin();
      sfx.thud(e.kg);
      view.comboPop = 1;
      view.toast = { title: `${MONSTERS[e.mi].name} — ${e.kg.toFixed(1)} kg`, sub: `+${e.coins} coins • +${e.score} score • combo ×${r.combo}` };
      view.toastT = 2.2;
    } else if (e.type === 'feat') {
      const f = FEATS.find((ff) => ff.id === e.id);
      if (f) {
        view.toast = { title: `★ FEAT — ${f.name}`, sub: f.desc };
        view.toastT = 2.2;
        sfx.feat();
      }
    } else if (e.type === 'charm') {
      view.toast = { title: "Sailor's Charm!", sub: 'The cable parts — but the combo survives.' };
      view.toastT = 2.2;
      sfx.charm();
    } else if (e.type === 'snap') { sfx.snap(); view.shake = 9; }
    else if (e.type === 'ability') sfx.warn();
    else if (e.type === 'vital') sfx.vital();
    else if (e.type === 'escape') sfx.escape();
    else if (e.type === 'night') {
      // the night that just ended becomes the draft's recap; the panels
      // start a fresh tally, and the route remembers which sea it was
      r.lastNightHauls = r.tonightHauls || [];
      r.tonightHauls = [];
      (r.nightSeas ??= []).push(r.sea);
      sfx.night();
    }
    else if (e.type === 'end') {
      best = betterBest(best, r);
      saveJson('krakenwake-best', best);
      last = {
        result: r.result === 'victory' ? 'BESTIARY COMPLETE' : `${journalCount(r)}/13 species`,
        species: journalCount(r),
        score: r.score,
        grade: gradeForScore(r.score),
      };
      saveJson('krakenwake-last', last);
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
  run.difficulty = difficultySel;
  run.tonightHauls = []; run.lastNightHauls = []; run.nightSeas = [];
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

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
let shotState = null;
if (shot) {
  shotState = stageShot(shot, view, burst);
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
    if (shotState.mode === 'briefing') {
      drawWorld(ctx, shotState.demoShot, view);
      drawBriefing(ctx, shotState.difficulty, shotState.bestOverride, shotState.lastOverride, shotState.demoShot, view);
    } else if (shotState.mode === 'draft') { drawWorld(ctx, run, view); drawDraft(ctx, run, view); }
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
    // the attract demo hunts on its own behind the briefing — and in its
    // little window — drafting and shopping like a real hunter
    if (demo.screen === 'end') demo = createRun(7);
    if (demo.screen === 'draft') botDraft(demo);
    if (demo.phase === 'idle') botShop(demo);
    step(demo, dt, bot.input(demo));
    demo.events.length = 0;
    drawWorld(ctx, demo, view);
    drawBriefing(ctx, difficultySel, best, last, demo, view);
    let consumed = false;
    for (const c of input.takeClicks()) {
      const { diffs, sail } = briefingLayout();
      for (const d of diffs) {
        if (c.x >= d.x && c.x <= d.x + d.w && c.y >= d.y && c.y <= d.y + d.h) {
          difficultySel = d.idx;
          saveJson('krakenwake-difficulty', difficultySel);
          sfx.click();
          consumed = true;
        }
      }
      if (c.x >= sail.x && c.x <= sail.x + sail.w && c.y >= sail.y && c.y <= sail.y + sail.h) {
        initAudio();
        startRun((Math.random() * 1e9) | 0);
        return;
      }
    }
    for (const k of ['Digit1', 'Digit2', 'Digit3']) {
      if (snap.pressedKeys.has(k)) {
        difficultySel = Number(k.slice(-1)) - 1;
        saveJson('krakenwake-difficulty', difficultySel);
        sfx.click();
        consumed = true;
      }
    }
    if (!consumed && (snap.pressed || snap.pressedKeys.has('Enter'))) {
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

  if (run.screen === 'draft') {
    drawWorld(ctx, run, view);
    drawDraft(ctx, run, view);
    const { cards } = draftLayout();
    for (const c of input.takeClicks()) {
      cards.forEach((card, i) => {
        if (c.x >= card.x && c.x <= card.x + card.w && c.y >= card.y && c.y <= card.y + card.h) {
          if (pickBoon(run, run.draft.choices[i])) sfx.click();
        }
      });
    }
    ['Digit1', 'Digit2', 'Digit3'].forEach((k, i) => {
      if (snap.pressedKeys.has(k) && run.draft && run.draft.choices[i]) {
        if (pickBoon(run, run.draft.choices[i])) sfx.click();
      }
    });
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
