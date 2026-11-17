// tackle.js — one job: the harpoon-rod itself. A tapered blank with guide
// rings, a cork grip, and a spinning reel whose crank the ninja's rear
// hand rides (crankKnob is exported for ninja.js). The bend deepens with
// tension; the line runs off the spool, through the guides, to the lure.
import { poleTip, lurePos } from './render.js';

const BUTT = { x: 194, y: 360 };
const REEL = { x: 192, y: 374 };
const PIVOT = { x: 194.5, y: 375.5 };
const CRANK_R = 8;

// Is he working the cable in? Read off the fight's distance, cached per
// distance value so rod and ninja agree within a frame.
export function reelingNow(run, view) {
  const f = run.fight;
  if (run.phase !== 'fight' || !f) return false;
  const st = view._rod;
  if (!st || st.f !== f) {
    view._rod = { f, dist: f.dist, reeling: true };
    return true;
  }
  if (f.dist < st.dist - 0.002) st.reeling = true;
  else if (f.dist > st.dist + 0.002) st.reeling = false;
  st.dist = f.dist;
  return st.reeling;
}

function crankAngle(run, view) {
  if (!reelingNow(run, view)) return 2.3; // at rest the knob hangs down-back
  return view.t * (run.fight && run.fight.surgeT > 0 ? 14 : 9.5);
}

// Where the crank knob is, in world pixels — the ninja's hand goes here.
export function crankKnob(run, view) {
  const a = crankAngle(run, view);
  return { x: PIVOT.x + Math.cos(a) * CRANK_R, y: PIVOT.y + Math.sin(a) * CRANK_R };
}

// The blank's curve: butt, a control that sags as tension loads the rod,
// and the shared tip. Near-straight at rest, a deep bow in the red zone.
function blank(run) {
  const tip = poleTip(run);
  const tension = run.phase === 'fight' && run.fight ? run.fight.tension : 0;
  const c = { x: 280 + tension * 0.05, y: 300 + tension * 0.3 };
  const at = (s) => {
    const u = 1 - s;
    return {
      x: u * u * BUTT.x + 2 * u * s * c.x + s * s * tip.x,
      y: u * u * BUTT.y + 2 * u * s * c.y + s * s * tip.y,
    };
  };
  const down = (s) => { // the unit perpendicular, guides hang on its low side
    const u = 1 - s;
    let tx = 2 * u * (c.x - BUTT.x) + 2 * s * (tip.x - c.x);
    let ty = 2 * u * (c.y - BUTT.y) + 2 * s * (tip.y - c.y);
    const m = Math.hypot(tx, ty) || 1;
    tx /= m; ty /= m;
    return ty < 0 ? { x: -ty, y: tx } : { x: ty, y: -tx };
  };
  return { tip, at, down };
}

const GUIDE_S = [0.3, 0.47, 0.63, 0.78, 0.9];
function guideCenters(b) {
  return GUIDE_S.map((s) => {
    const p = b.at(s);
    const d = b.down(s);
    return { x: p.x + d.x * 3.4, y: p.y + d.y * 3.4, s };
  });
}

function drawReel(ctx, run, view) {
  // the housing: a faceted black drum with a crimson side plate
  ctx.fillStyle = '#1d1d24';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = i * 1.047 + 0.5;
    const px = REEL.x + Math.cos(a) * 8.4, py = REEL.y + Math.sin(a) * 8.4;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#454552';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = '#8f1220';
  ctx.beginPath(); ctx.arc(REEL.x - 1, REEL.y, 6.4, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#71859c'; // the oversized spool, wound with pale line
  ctx.beginPath(); ctx.arc(REEL.x - 1, REEL.y, 5.4, 0, 6.29); ctx.fill();
  ctx.strokeStyle = 'rgba(215,226,238,0.9)';
  ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.arc(REEL.x - 1, REEL.y, 3.6, 0.6, 4.6); ctx.stroke();
  ctx.beginPath(); ctx.arc(REEL.x - 1, REEL.y, 2.2, 2.4, 5.8); ctx.stroke();
  ctx.fillStyle = '#ffffff'; // metal glints
  ctx.fillRect(REEL.x - 4.4, REEL.y - 4.6, 1.6, 1.6);
  ctx.fillRect(REEL.x + 2.6, REEL.y + 3.4, 1.3, 1.3);
  // the crank: stem and knob, turning while he reels
  const knob = crankKnob(run, view);
  ctx.strokeStyle = '#c7d3df';
  ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(PIVOT.x, PIVOT.y); ctx.lineTo(knob.x, knob.y); ctx.stroke();
  ctx.fillStyle = '#101016';
  ctx.beginPath(); ctx.arc(knob.x, knob.y, 3.2, 0, 6.29); ctx.fill();
  ctx.strokeStyle = '#c7d3df';
  ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.arc(knob.x, knob.y, 3.2, 0, 6.29); ctx.stroke();
}

export function drawRod(ctx, run, view) {
  if (run.phase === 'idle' || run.phase === 'charge') return;
  const b = blank(run);
  const guides = guideCenters(b);
  const p = lurePos(run);
  const fighting = run.phase === 'fight' && run.fight;
  const tension = fighting ? run.fight.tension : 0;
  // the line is NEON now: hue follows the tension — cyan-green at ease,
  // amber working, red neon in the danger zone; a dim cyan out of fights
  const lineCol = fighting
    ? (tension < 62 ? '#2effa8' : tension < 82 ? '#ffb02e' : '#ff3838')
    : 'rgba(110,230,255,0.9)';
  // the line first, under the blank: spool, through the guides, to the
  // tip, then the long run out — sagging slack, dead taut reeling
  const sag = fighting ? (reelingNow(run, view) ? 3 : 20) : 44;
  const traceLine = () => {
    ctx.beginPath();
    ctx.moveTo(REEL.x, REEL.y - 5);
    for (const g of guides) ctx.lineTo(g.x, g.y);
    ctx.lineTo(b.tip.x, b.tip.y);
    ctx.quadraticCurveTo((b.tip.x + p.x) / 2, Math.min(b.tip.y, p.y) + sag + Math.sin(view.t * 2) * 1.5, p.x, p.y);
  };
  ctx.strokeStyle = lineCol;
  ctx.lineCap = 'round';
  for (const [w, a] of [[3.8, 0.1], [2, 0.2], [1.6, 1]]) { // glow passes, then the core
    ctx.globalAlpha = a;
    ctx.lineWidth = w;
    traceLine();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (tension >= 82) { // red zone: a white-hot heart to the line
    ctx.strokeStyle = 'rgba(255,235,230,0.85)';
    ctx.lineWidth = 0.8;
    traceLine();
    ctx.stroke();
  }
  // the blank, tapered butt to tip: black lacquer, crimson-wrapped grip
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const s0 = i / 16, s1 = (i + 1) / 16;
    const a = b.at(s0), c = b.at(s1);
    ctx.strokeStyle = s0 < 0.15 ? '#8f1220' : '#17171d';
    ctx.lineWidth = (5 - 3.6 * s0) * (s0 < 0.15 ? 1.25 : 1);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(10,8,10,0.8)'; // the grip's cross-wrap
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 3; i++) {
    const a = b.at(0.03 + i * 0.045), c = b.at(0.075 + i * 0.045);
    ctx.beginPath(); ctx.moveTo(a.x - 2, a.y + 2.5); ctx.lineTo(c.x + 2, c.y - 2.5); ctx.stroke();
  }
  ctx.fillStyle = '#c7d3df'; // the butt cap, steel
  ctx.beginPath(); ctx.arc(BUTT.x, BUTT.y, 2.8, 0, 6.29); ctx.fill();
  // the guides: steel rings on crimson feet, sharp against the blank
  for (const g of guides) {
    const a = b.at(g.s);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#a31628';
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(g.x, g.y); ctx.stroke();
    ctx.strokeStyle = '#d7e2ec';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(g.x, g.y, 3.3 - 1.4 * g.s, 0, 6.29); ctx.stroke();
  }
  drawReel(ctx, run, view);
}
