// theatre.js — one job: stage the fight. The telegraph banner, the weak
// point and its VITAL callout, the kraken's wrap and slam tentacles, the
// ink wash, a second monster mid-distance, and the harpoon's flight.
import { MONSTERS } from './data.js';
import { ABILITY_INFO } from './abilities.js';
import { WATER_Y, lurePos, poleTip } from './render.js';
import { drawFishShape } from './shapes.js';
import { drawKraken } from './shapes2.js';
import { drawSeaTerrain } from './terrain.js';
import { drawLimb } from './geom.js';
import { calloutLines } from './fishing.js';

// the fighting monster's on-screen geometry, so the weak point lands true
function monsterGeom(run) {
  const f = run.fight;
  const p = lurePos(run);
  const near = Math.max(0, 1 - f.dist / 95);
  if (MONSTERS[f.mi].shape === 'kraken') return { x: p.x, y: WATER_Y + 6, s: 85 + near * 85, kraken: true };
  return { x: p.x, y: WATER_Y - 4 - near * 12, s: 20 + near * 30 + Math.min(16, f.kg * 0.3), kraken: false };
}
function weakPointPos(run) {
  const g = monsterGeom(run);
  const f = run.fight;
  if (g.kraken) return { x: g.x + f.wpDx * g.s * 0.8, y: g.y - g.s * 0.55 + f.wpDy * g.s * 0.35 };
  return { x: g.x + f.wpDx * g.s * 1.3, y: g.y + f.wpDy * g.s };
}

// --- mid-frame life ---------------------------------------------------------
function drawSecondMonster(ctx, run, t) {
  const f = run.fight;
  const p = lurePos(run);
  const sx = p.x - 300 + Math.sin(t * 0.27) * 30;
  if (sx < 400) return; // too close to the main event to read as another animal
  const shape = MONSTERS[(f.mi + 5) % 13].shape;
  const sy = WATER_Y - 2 + Math.sin(t * 1.7) * 2;
  if (shape === 'kraken') drawKraken(ctx, sx, sy + 4, 15, t);
  else drawFishShape(ctx, shape, sx, sy, 15, '#0a1420', '#ff5040');
}

function drawHarpoonTrail(ctx, run, t) {
  const w = run.wait;
  if (!w || w.t <= 0 || w.t >= 0.45) return;
  const q = w.t / 0.45;
  const tip = poleTip(run);
  const target = lurePos(run);
  const hx = tip.x + (target.x - tip.x) * q;
  const hy = tip.y + (target.y - tip.y) * q - Math.sin(q * 3.14) * 26;
  ctx.strokeStyle = 'rgba(230,242,252,0.75)';
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const bq = Math.max(0, q - i * 0.07);
    const bx = tip.x + (target.x - tip.x) * bq;
    const by = tip.y + (target.y - tip.y) * bq - Math.sin(bq * 3.14) * 26;
    ctx.globalAlpha = 0.5 - i * 0.11;
    ctx.lineWidth = 3.4 - i * 0.6;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(hx, hy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // the harpoon itself in flight: short shaft, barbed head, angled true
  const ang = Math.atan2(target.y - tip.y, target.x - tip.x);
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ang + Math.sin(t * 26) * 0.05);
  ctx.strokeStyle = '#6b4a2a';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-4, 0); ctx.stroke();
  ctx.fillStyle = '#cfd8e2';
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(-5, -4.4);
  ctx.lineTo(-5, 4.4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-3, -1);
  ctx.lineTo(-9, -6);
  ctx.lineTo(-1.5, -4.6);
  ctx.fill();
  ctx.restore();
}

// --- the kraken, close: a wrap on the dock post, a slam rearing ---
function drawKrakenTheatre(ctx, run, t) {
  const f = run.fight;
  if (MONSTERS[f.mi].shape !== 'kraken') return;
  const g = monsterGeom(run);
  // one long tentacle has hold of the dock's end post: a tapered limb
  // off her flank, suckers underneath, that coils the post and curls free
  const sag = Math.sin(t * 1.1) * 4;
  drawLimb(ctx, [
    g.x - g.s * 0.72, WATER_Y + 2, (g.x + 262) / 2, WATER_Y - 30 + sag,
    336, 374, 272, 400,
  ], Math.max(8, g.s * 0.17), Math.max(5, g.s * 0.09), '#07090f', -1, 3);
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { // the coil: full bands stepping down the post,
    const cy = 397 + i * 12, rx = 13 - i, ry = 5 + i * 0.5; // each lit on top so it reads as a wrap
    ctx.strokeStyle = '#07090f';
    ctx.lineWidth = Math.max(5, g.s * 0.075);
    ctx.beginPath();
    ctx.ellipse(264 - i * 1.5, cy, rx, ry, 0, 0, 6.29);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(190,205,225,0.20)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(264 - i * 1.5, cy, rx, ry, 0, 3.4, 5.9);
    ctx.stroke();
  }
  // the slam, telegraphed: a tapered limb rears, its tip hooked to
  // strike, taller as the landing nears
  if (f.event && f.event.id === 'slam' && f.event.phase === 'tele') {
    const q = 1 - Math.max(0, f.event.t) / 1.0;
    const bx = g.x + g.s * 0.92;
    const h = g.s * (0.7 + q * 1.5);
    const wob = Math.sin(t * 6) * 3;
    drawLimb(ctx, [
      bx, WATER_Y + 4, bx + g.s * 0.30, WATER_Y - h * 0.55,
      bx + g.s * 0.04, WATER_Y - h * 0.94, bx - g.s * 0.36 + wob, WATER_Y - h * 0.84,
    ], Math.max(9, g.s * 0.21), Math.max(3, g.s * 0.055), '#07090f', -1, 3);
    ctx.strokeStyle = 'rgba(255,80,64,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bx, WATER_Y + 6, 20 + q * 16, 6 + q * 4, 0, 0, 6.29);
    ctx.stroke();
  }
}

// --- weak point, vital, ink, banner ----------------------------------------
function drawWeakPoint(ctx, run, t) {
  const f = run.fight;
  if (!(f.wpT > 0)) return;
  const p = weakPointPos(run);
  if (f.wpFake) {
    // the monkfish's lie: pale blue, small, and cold — no halo
    ctx.strokeStyle = 'rgba(168,200,232,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, 6.29);
    ctx.stroke();
    ctx.fillStyle = 'rgba(168,200,232,0.7)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.6, 0, 6.29);
    ctx.fill();
    return;
  }
  const pulse = 1 + 0.16 * Math.sin(t * 14);
  const hg = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 30 * pulse);
  hg.addColorStop(0, 'rgba(255,217,77,0.6)');
  hg.addColorStop(1, 'rgba(255,217,77,0)');
  ctx.fillStyle = hg;
  ctx.fillRect(p.x - 32, p.y - 32, 64, 64);
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 10 * pulse, 0, 6.29);
  ctx.stroke();
  ctx.fillStyle = '#fff2b0';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, 6.29);
  ctx.fill();
}

function drawVital(ctx, run, t) {
  const f = run.fight;
  if (!(f.vitalFlash > 0) || f.wpT <= 0) return;
  const p = weakPointPos(run);
  const a = f.vitalFlash / 0.5;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 14 + (1 - a) * 22, 0, 6.29);
  ctx.stroke();
  // the word joins the callout column over the monster, on its own
  // line — never printed across THRASHING! or the stamina word
  const lines = calloutLines(f);
  ctx.font = "800 22px system-ui, 'Segoe UI', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94d';
  ctx.fillText('VITAL!', lurePos(run).x, WATER_Y - 64 - Math.max(1, lines.vital) * 38);
  ctx.restore();
  void t;
}

function drawInk(ctx, run) {
  const f = run.fight;
  if (!f || !(f.inkT > 0)) return;
  const elapsed = 2.5 - f.inkT;
  const a = 0.52 * Math.min(1, elapsed / 0.3) * Math.min(1, f.inkT / 0.5);
  ctx.fillStyle = `rgba(3,5,12,${a.toFixed(3)})`;
  ctx.fillRect(0, 0, 1280, 720);
}

const BANNER_COLORS = { lunge: '#ff5040', slam: '#ff5040', phase: '#c77dff', armor: '#ffb52e', ink: '#a8c8e8' };
function drawBanner(ctx, run, t) {
  const f = run.fight;
  if (!f || !f.event) return;
  const e = f.event;
  if (e.phase === 'tele') {
    const info = ABILITY_INFO[e.id];
    if (!info) return;
    const label = `⚠ ${info.word} — ${info.counter}`;
    ctx.font = "800 27px system-ui, 'Segoe UI', sans-serif";
    const w = ctx.measureText(label).width + 56;
    const x = 640 - w / 2;
    ctx.fillStyle = 'rgba(9,16,28,0.88)';
    ctx.beginPath();
    ctx.roundRect(x, 168, w, 54, 12);
    ctx.fill();
    ctx.strokeStyle = BANNER_COLORS[e.id];
    ctx.lineWidth = 2 + Math.sin(t * 12) * 0.7;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, 640, 204);
  } else if (e.id === 'phase') {
    ctx.font = "700 19px system-ui, 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(199,125,255,0.9)';
    ctx.fillText('THE CABLE HANGS SLACK — REELING DOES NOTHING', 640, 208);
  } else if (e.id === 'armor') {
    ctx.font = "700 19px system-ui, 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,181,46,0.9)';
    ctx.fillText('ARMORED — ONLY THE WEAK POINT DRAINS IT', 640, 208);
  }
}

export function drawTheatre(ctx, run, t) {
  drawSeaTerrain(ctx, run, t); // terrain first: everything fights on top of it
  if (run.phase === 'wait') drawHarpoonTrail(ctx, run, t);
  if (run.phase === 'fight' && run.fight) {
    drawSecondMonster(ctx, run, t);
    drawKrakenTheatre(ctx, run, t);
    drawWeakPoint(ctx, run, t);
  }
  drawInk(ctx, run); // the ink wash goes over the scene, under the banner
  if (run.phase === 'fight' && run.fight) {
    drawBanner(ctx, run, t);
    drawVital(ctx, run, t);
  }
  // vignette cut for byte budget
}
