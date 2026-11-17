// chain.js — one job: the chain itself. The ninja
// hurls the harpoon by hand and hauls the glowing rope in hand over
// hand. The neon language stays — the hue follows the tension: cyan-
// green at ease, amber working, red in the danger zone. leadHand is
// exported for ninja.js: the rear hand's grip as it hauls.
import { lurePos } from './render.js';

// Is he hauling the rope in? Read off the fight's distance, cached per
// distance value so rope and ninja agree within a frame.
function haulingNow(run, view) {
  const f = run.fight;
  if (run.phase !== 'fight' || !f) return false;
  const st = view._chain;
  if (!st || st.f !== f) {
    view._chain = { f, dist: f.dist, hauling: true };
    return true;
  }
  if (f.dist < st.dist - 0.002) st.hauling = true;
  else if (f.dist > st.dist + 0.002) st.hauling = false;
  st.dist = f.dist;
  return st.hauling;
}

// The rear hand's grip point, in world pixels. Hauling is a cycle:
// reach forward, grip, pull back to the shoulder — faster mid-surge.
// Feeding slack, the hand pushes forward and down, giving rope.
export function leadHand(run, view) {
  if (!haulingNow(run, view)) return { x: 212, y: 364 };
  const f = run.fight;
  const q = (view.t * (f && f.surgeT > 0 ? 2.6 : 1.7)) % 1;
  const pull = q < 0.32 ? q / 0.32 : 1 - (q - 0.32) / 0.68; // reach fast, haul slow
  return { x: 178 + pull * 28, y: 360 - pull * 8 };
}

// Where the rope leaves his hands, by the moment: the raised hand in
// the throw, the forward grip hauling, low feeding slack, high on guard.
function anchor(run, view) {
  if (run.phase === 'wait') {
    return run.wait && run.wait.t < 0.45 ? { x: 208, y: 350 } : { x: 180, y: 311 };
  }
  const f = run.fight;
  if (f && f.event && f.event.phase === 'tele') return { x: 170, y: 321 };
  return haulingNow(run, view) ? { x: 204, y: 353 } : { x: 218, y: 374 };
}

export function drawChain(ctx, run, view) {
  if (run.phase === 'idle' || run.phase === 'charge') return;
  const a = anchor(run, view);
  const p = lurePos(run);
  const fighting = run.phase === 'fight' && run.fight;
  const tension = fighting ? run.fight.tension : 0;
  const col = fighting
    ? (tension < 62 ? '#2effa8' : tension < 82 ? '#ffb02e' : '#ff3838')
    : 'rgba(110,230,255,0.9)';
  const sag = fighting ? (haulingNow(run, view) ? 3 : 20) : 30;
  const trace = () => {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo((a.x + p.x) / 2, Math.min(a.y, p.y) + sag + Math.sin(view.t * 2) * 1.5, p.x, p.y);
  };
  ctx.strokeStyle = col;
  ctx.lineCap = 'round';
  for (const [w, al] of [[3.8, 0.1], [2, 0.2], [1.6, 1]]) { // glow passes, then the core
    ctx.globalAlpha = al;
    ctx.lineWidth = w;
    trace();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (tension >= 82) { // red zone: a white-hot heart to the rope
    ctx.strokeStyle = 'rgba(255,235,230,0.85)';
    ctx.lineWidth = 0.8;
    trace();
    ctx.stroke();
  }
  // hard hauls ride over his shoulder for leverage: a second glowing
  // run from the grip, up over the shoulder, and away behind him
  if (fighting && tension >= 60 && haulingNow(run, view)) {
    ctx.strokeStyle = col;
    for (const [w, al] of [[2.6, 0.16], [1.4, 0.8]]) {
      ctx.globalAlpha = al;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(168, 322, 138, 348);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
