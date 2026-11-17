// theatre.js — one job: stage the fight. The telegraph banner, the weak
// point and its VITAL callout, the wyrm's coil around the dock post, the
// ink wash, a second monster mid-distance, and the harpoon's flight.
import { MONSTERS } from './data.js';
import { ABILITY_INFO } from './abilities.js';
import { WATER_Y, lurePos, calloutX } from './render.js';
import { drawFishShape } from './vendor/shapes.js';
import { drawWyrmGlyph, GOLD, blendCrossing } from './vendor/wyrm.js';
import { drawSeaTerrain } from './terrain.js';
import { calloutLines } from './fight.js';

// the fighting monster's on-screen geometry, so the weak point lands true
function monsterGeom(run) {
  const f = run.fight;
  const p = lurePos(run);
  const near = Math.max(0, 1 - f.dist / 95);
  if (MONSTERS[f.mi].shape === 'wyrm') return { x: p.x, y: WATER_Y + 22, s: 150 + near * 45, wyrm: true };
  return { x: p.x, y: WATER_Y - 4 - near * 12, s: 20 + near * 30 + MONSTERS[f.mi].bulk, wyrm: false };
}
function weakPointPos(run) {
  const g = monsterGeom(run);
  const f = run.fight;
  // the wyrm's weak point rides his throat, under the jaw on the neck's
  // front edge — and it BURNS crimson-white: gold on gold would vanish,
  // so the vital core is the one red thing on the golden king
  if (g.wyrm) return { x: g.x - g.s * 0.30 + f.wpDx * g.s * 0.3, y: g.y - g.s * 1.38 + f.wpDy * g.s * 0.3 };
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
  if (shape === 'wyrm') drawWyrmGlyph(ctx, sx, sy + 4, 15, '#0a1420', '#ff5040');
  else drawFishShape(ctx, shape, sx, sy, 15, '#0a1420', '#ff5040');
}

function drawHarpoonTrail(ctx, run, t) {
  const w = run.wait;
  if (!w || w.t <= 0 || w.t >= 0.45) return;
  const q = w.t / 0.45;
  const tip = { x: 208, y: 350 }; // the throwing hand, mid-hurl (ninja.js)
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

// One stretch of the swimming body as a tapered ribbon along a smooth
// curve — gold, banded with scales, moonlit on its top edge. Drawn in
// humps with water between them, it reads as a back crossing the sea.
function loopRibbon(ctx, pts, w0, w1, tipStart = 1, tipEnd = 1, tipLen = 0.22) {
  const S = [];
  const at = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = at(i - 1), p1 = pts[i], p2 = pts[i + 1], p3 = at(i + 2);
    for (let j = 0; j < 7; j++) {
      const u = j / 7, u2 = u * u, u3 = u2 * u;
      S.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u
        + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2
        + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)));
    }
  }
  S.push([...pts[pts.length - 1]]);
  const L = [], R = [];
  for (let i = 0; i < S.length; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    // the base taper runs flank to post; on top of it, an end may run
    // out to a point — but only in its submerged lead (tipLen is kept
    // short), so at the surface line itself the body is at FULL gauge:
    // a body entering water does not thin, the blend zone does the
    // marrying. (A long thinning snout was tried and rejected.)
    let w = w0 + (w1 - w0) * (i / (S.length - 1));
    const u = i / (S.length - 1);
    if (tipStart < 1) w *= tipStart + (1 - tipStart) * Math.min(1, u / tipLen);
    if (tipEnd < 1) w *= tipEnd + (1 - tipEnd) * Math.min(1, (1 - u) / tipLen);
    L.push([S[i][0] - dy * w, S[i][1] + dx * w]);
    R.push([S[i][0] + dy * w, S[i][1] - dx * w]);
  }
  ctx.fillStyle = GOLD.water;
  ctx.beginPath();
  [...L, ...R.reverse()].forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.closePath(); ctx.fill();
  // scale bands across the back — bowed along the curve and spaced by
  // arc length, each a dark seam with a lit lip, never a straight slash
  ctx.lineCap = 'round';
  let acc = 0;
  for (let i = 2; i < S.length - 2; i++) {
    acc += Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]);
    if (acc < 200) continue;
    acc = 0;
    const a = S[i - 1], b = S[i + 1];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    const w = Math.hypot(L[i][0] - R[i][0], L[i][1] - R[i][1]) / 2;
    const mx = (L[i][0] + R[i][0]) / 2 + dx * w * 0.38, my = (L[i][1] + R[i][1]) / 2 + dy * w * 0.38;
    ctx.strokeStyle = 'rgba(46,26,4,0.55)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(L[i][0], L[i][1]); ctx.quadraticCurveTo(mx, my, R[i][0], R[i][1]); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,226,150,0.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); R.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
}

// --- the wyrm, close: his body swims to the dock and coils its post ---
function drawWyrmTheatre(ctx, run, t) {
  const f = run.fight;
  if (MONSTERS[f.mi].shape !== 'wyrm') return;
  const g = monsterGeom(run);
  // the body crosses in ONE TALL ARC — steep flanks, a high crown —
  // then a submerged stretch, then a steep rise into the long run to
  // the post: blend zones dissolve every dive and rise, and no shallow
  // dome ever squats on the surface (the blunt look, banned for good)
  const bob = Math.sin(t * 1.1) * 3, W = WATER_Y;
  loopRibbon(ctx, [
    [g.x - g.s * 0.52, W + 6], [g.x - g.s * 0.74, W - g.s * 0.30 + bob], [g.x - g.s * 1.02, W - g.s * 0.42 + bob],
    [g.x - g.s * 1.30, W - g.s * 0.28 + bob], [g.x - g.s * 1.50, W + 4],
  ], g.s * 0.16, g.s * 0.11, 0.08, 0.05, 0.04); // out of his flank, a tall
  // arc, a steep dive — the end points live in the submerged lead
  // only; at the line the body is full gauge, the blend does the rest
  loopRibbon(ctx, [
    [g.x - g.s * 1.88, W + 16], [g.x - g.s * 2.04, W - g.s * 0.20 + bob], [g.x - g.s * 2.40, W - g.s * 0.15 + bob],
    [(g.x - g.s * 2.40 + 336) / 2, W - 6 + bob], // a shallow sag in the long
    [336, 398], [272, 394], // run to the post — a swimming back, not a slide
  ], g.s * 0.09, g.s * 0.06, 0.05, 1, 0.04); // rises STEEP out of the water
  // at full gauge — no thinning snout (tried, rejected by the owner):
  // the point runs out below the surface, the blend zone marries the
  // crossing. Water breaks around the body; the body does not shrink.
  blendCrossing(ctx, g.x - g.s * 0.52, W + 3, g.s * 0.17, t, 0.0);
  blendCrossing(ctx, g.x - g.s * 1.50, W + 3, g.s * 0.12, t, 0.4);
  blendCrossing(ctx, g.x - g.s * 1.90, W + 3, g.s * 0.10, t, 0.75);
  blendCrossing(ctx, 264, W + 3, g.s * 0.09, t, 0.55); // the post's foot,
  // where the lowest wrap meets the water — foam lapping the coil home
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { // the coil: three wraps stepping down the
    const cy = 397 + i * 13, rx = 14 - i, ry = 5.5 + i * 0.5; // post — each
    const wMax = Math.max(6, g.s * 0.09); // a WRAP, not a ring: three arc
    // passes around the post's front, fat at the front, thinning to
    // nothing where they tuck behind the post's sides. (Full ellipses
    // stacked like sausage slices — the blunt look the owner flagged.)
    for (const [a0, a1, wf] of [[0.03, 0.35, 0.38], [0.35, 0.65, 1], [0.65, 0.97, 0.38]]) {
      ctx.strokeStyle = GOLD.water;
      ctx.lineWidth = Math.max(1.8, wMax * wf);
      ctx.beginPath();
      ctx.ellipse(264 - i * 1.5, cy, rx, ry, 0, Math.PI * a0, Math.PI * a1);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(243,226,179,0.4)'; // the wrap's lit top rim
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(264 - i * 1.5, cy - ry * 0.55, rx * 0.92, ry * 0.5, 0, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
  }  // the slam, telegraphed: the head itself rears (render.js) — here the
  // water under it warns, a red ring widening as the strike nears
  if (f.event && f.event.id === 'slam' && f.event.phase === 'tele') {
    const q = 1 - Math.max(0, f.event.t) / 1.0;
    ctx.strokeStyle = 'rgba(255,80,64,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(g.x - g.s * 0.55, WATER_Y + 6, 20 + q * 18, 6 + q * 4, 0, 0, 6.29);
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
  // in a counter window the point flares — the ring and core swell
  // (the halo stays small: radial gradients are PNG-expensive)
  const flare = f.counterT > 0 ? 1.7 : 1;
  const pulse = 1 + 0.16 * Math.sin(t * 14);
  const hg = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 21 * pulse);
  hg.addColorStop(0, 'rgba(255,70,45,0.6)');
  hg.addColorStop(1, 'rgba(255,70,45,0)');
  ctx.fillStyle = hg;
  ctx.fillRect(p.x - 23, p.y - 23, 46, 46);
  ctx.strokeStyle = '#ff4a3c';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 10 * pulse * flare, 0, 6.29);
  ctx.stroke();
  ctx.fillStyle = '#ff2d1e';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 6 * flare, 0, 6.29);
  ctx.fill();
  ctx.fillStyle = '#fff6ee';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3 * flare, 0, 6.29);
  ctx.fill();
}

function drawVital(ctx, run, t) {
  const f = run.fight;
  if (!(f.vitalFlash > 0) || f.wpT <= 0) return;
  const p = weakPointPos(run);
  const a = f.vitalFlash / 0.5;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = '#ff5a48';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 14 + (1 - a) * 22, 0, 6.29);
  ctx.stroke();
  // the word joins the callout column over the monster, on its own
  // line — never printed across THRASHING! or the stamina word
  const lines = calloutLines(f);
  ctx.font = "800 22px system-ui, 'Segoe UI', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff6a55';
  ctx.fillText('VITAL!', calloutX(run), WATER_Y - 64 - Math.max(1, lines.vital) * 38);
  ctx.restore();
  void t;
}

function drawVanish(ctx, run, t) {
  const f = run.fight;
  if (!(f.vanishFlash > 0)) return;
  const lines = calloutLines(f);
  ctx.save();
  ctx.globalAlpha = Math.min(1, f.vanishFlash / 0.35);
  ctx.font = "800 24px system-ui, 'Segoe UI', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9fe8ff';
  ctx.fillText('VANISH!', calloutX(run), WATER_Y - 64 - Math.max(1, lines.vanish) * 38);
  ctx.restore();
  void t;
}

// A monster hauled in close and SPENT gets the chain wrapped round its
// body — dashed neon loops, visual only, the kusarigama finish.
function drawChainWraps(ctx, run, t) {
  const f = run.fight;
  if (f.stamina > 15) return;
  const g = monsterGeom(run);
  const near = Math.max(0, 1 - f.dist / 95);
  if (near < 0.7) return;
  const cx = g.wyrm ? g.x - g.s * 0.02 : g.x;
  const cy = g.wyrm ? g.y - g.s * 1.0 : g.y;
  const rx = g.wyrm ? g.s * 0.30 : g.s * 0.95;
  const ry = g.wyrm ? g.s * 0.55 : g.s * 0.42;
  ctx.save();
  ctx.strokeStyle = '#2effa8';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([7, 5]);
  ctx.lineDashOffset = -t * 22;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx + i * rx * 0.22 - rx * 0.22, cy, rx * (1 - i * 0.13), ry * (1 - i * 0.1), g.wyrm ? 0.5 : 0, 0, 6.29);
    ctx.stroke();
  }
  ctx.restore();
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
  // the banner heads the callout stack: raised into the open sky and
  // shifted left of the stack's column, because the rearing head
  // reaches further left than the neck suggests — measured on a
  // banner-free frame, its gold stands at x≈711 (y≈198) with the
  // snout's fangs at x≈695 below y≈205. Centred on calloutX the box
  // would meet the face at any readable width, so it sits 50 left:
  // right edge ≈668, a clear 20+ px of sky from the dragon at every
  // row it spans. It may rest on the moon's edge (background),
  // never on the dragon.
  const cx = calloutX(run) - 50;
  if (e.phase === 'tele') {
    const info = ABILITY_INFO[e.id];
    if (!info) return;
    const label = `⚠ ${info.word} — ${info.counter}`;
    ctx.font = "800 18px system-ui, 'Segoe UI', sans-serif";
    const w = ctx.measureText(label).width + 24;
    const bx = Math.max(w / 2 + 8, Math.min(1272 - w / 2, cx));
    ctx.fillStyle = 'rgba(9,16,28,0.88)';
    ctx.beginPath();
    ctx.roundRect(bx - w / 2, 140, w, 54, 12);
    ctx.fill();
    ctx.strokeStyle = BANNER_COLORS[e.id];
    ctx.lineWidth = 2 + Math.sin(t * 12) * 0.7;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, bx, 176);
  } else if (e.id === 'phase') {
    ctx.font = "700 19px system-ui, 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(199,125,255,0.9)';
    ctx.fillText('THE CHAIN HANGS SLACK — HAULING DOES NOTHING', cx, 176);
  } else if (e.id === 'armor') {
    ctx.font = "700 19px system-ui, 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,181,46,0.9)';
    ctx.fillText('ARMORED — ONLY THE WEAK POINT DRAINS IT', cx, 176);
  }
}

// First-night coaching, drawn once per run: the first real weak point
// names the strike; the first telegraph names its two answers. The
// timers live on the run and burn down in stepFight — never repeated.
function drawCoaching(ctx, run, t) {
  const f = run.fight;
  ctx.save();
  ctx.textAlign = 'center';
  if (run.coachWpT > 0 && f.wpT > 0 && !f.wpFake) {
    const p = weakPointPos(run);
    ctx.globalAlpha = Math.min(1, run.coachWpT);
    ctx.font = "800 20px system-ui, 'Segoe UI', sans-serif";
    ctx.fillStyle = '#9fe8ff';
    ctx.fillText('STRIKE — SPACE!', p.x, p.y - 46 - Math.sin(t * 6) * 2);
  }
  if (run.coachTeleT > 0 && f.event && f.event.phase === 'tele') {
    ctx.globalAlpha = Math.min(1, run.coachTeleT);
    ctx.font = "800 20px system-ui, 'Segoe UI', sans-serif";
    ctx.fillStyle = '#ffd94d';
    ctx.fillText('ANSWER IT: LET GO to slacken — or DASH through it!  [Shift / J]', 640, 246);
  }
  ctx.restore();
}

export function drawTheatre(ctx, run, t) {
  drawSeaTerrain(ctx, run, t); // terrain first: everything fights on top of it
  if (run.phase === 'wait') drawHarpoonTrail(ctx, run, t);
  if (run.phase === 'fight' && run.fight) {
    drawSecondMonster(ctx, run, t);
    drawWyrmTheatre(ctx, run, t);
    drawChainWraps(ctx, run, t);
    drawWeakPoint(ctx, run, t);
  }
  drawInk(ctx, run); // the ink wash goes over the scene, under the banner
  if (run.phase === 'fight' && run.fight) {
    drawBanner(ctx, run, t);
    drawVital(ctx, run, t);
    drawVanish(ctx, run, t);
    drawCoaching(ctx, run, t);
  }
  // vignette cut for byte budget
}
