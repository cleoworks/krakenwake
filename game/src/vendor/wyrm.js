// wyrm.js — the King Wyrm: a GOLDEN sea serpent — layered golds, deep
// amber in shadow, pale-gold light on the crest, bronze horns and a
// bronze mane of dorsal spines, cream belly plates, one red eye. The
// body follows ONE smooth curve (Catmull-Rom through the spine points):
// wide low coils like a base, a swan-arc neck tapering to a long-snouted
// head held high. Canvas vector, poster style. See shapes.js.
import { shade, makeKit } from '../geom.js';

// Spine control points in s units (x right, y down, waterline y=0):
// tail, rear coil, a dip, mid coil, then the neck's S-arc to the head.
// Third value: half thickness — thick where the body leaves the water,
// finer toward the head. Index NECK is where the rising neck begins.
const SPINE = [
  [1.62, 0.02, 0.10], [1.52, -0.18, 0.15], [1.22, -0.30, 0.19], [0.92, -0.34, 0.20],
  [0.70, -0.22, 0.195], [0.62, -0.16, 0.185], [0.44, -0.22, 0.19], [0.25, -0.31, 0.185],
  [0.12, -0.30, 0.17], [0.13, -0.58, 0.155], [0.07, -0.85, 0.145], [-0.05, -1.08, 0.135],
  [-0.21, -1.27, 0.125], [-0.38, -1.40, 0.117], [-0.52, -1.48, 0.11],
];
const NECK = 9;
const BASE = '#c08a34', AMBER = '#8a5a1e', CREAM = '#f3e2b3', BRONZE = '#7d5220';
// ONE gold ramp for the whole animal — head, neck, coils, the dock
// loop, the tail. Water-level parts take WATER, the base hue stepped
// down a shade for depth: the same gold, never a different metal.
export const GOLD = { base: BASE, deep: AMBER, water: '#ab7f30', cream: CREAM, bronze: BRONZE };

function poly(ctx, pts, fill) {
  ctx.fillStyle = fill; ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.closePath(); ctx.fill();
}

// Catmull-Rom through the control points, SUB samples per segment —
// the ribbon is built from these, so no joint angle ever shows.
function smooth(ctrl, sub = 8) {
  const S = [];
  const at = (i) => ctrl[Math.max(0, Math.min(ctrl.length - 1, i))];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let j = 0; j < sub; j++) {
      const u = j / sub, u2 = u * u, u3 = u2 * u;
      S.push([0, 1, 2].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u
        + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2
        + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)));
    }
  }
  S.push([...ctrl[ctrl.length - 1]]);
  return S;
}

function ribbon(ctx, s, rear) {
  const ctrl = SPINE.map((p, i) => {
    const k = i < NECK ? 0 : (i - NECK) / (SPINE.length - 1 - NECK);
    return [(p[0] + 0.22 * rear * k) * s, (p[1] - 0.10 * rear * k) * s, p[2] * s];
  });
  const S = smooth(ctrl);
  // no blunt caps on the king either: the tail runs out to a point in
  // the water, and the neck narrows into the skull that covers its end.
  // Where a coil crosses the surface the body PINCHES — it slides
  // under the water instead of sitting on it like a loaf.
  for (let i = 0; i < S.length; i++) {
    if (i < 8) S[i][2] *= 0.15 + 0.85 * (i / 8);
    const j = S.length - 1 - i;
    if (j < 6) S[i][2] *= 0.55 + 0.45 * (j / 6);
    if (i < NECK * 8) S[i][2] *= 1 - 0.16 * Math.max(0, 1 - Math.abs(S[i][1]) / (0.085 * s));
  }
  const L = [], R = [];
  for (let i = 0; i < S.length; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    L.push([S[i][0] - dy * S[i][2], S[i][1] + dx * S[i][2]]);
    R.push([S[i][0] + dy * S[i][2], S[i][1] - dx * S[i][2]]);
  }
  const SUB = 8;
  const frameAt = (si) => {
    const a = S[Math.max(0, si - 1)], b = S[Math.min(S.length - 1, si + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    return { dx: dx / m, dy: dy / m };
  };
  // THE DIVE RULE: the body is clipped at the surface line — nothing
  // of the king shows below it, so no coil bottom, fin tip or belly
  // edge can end in a visible cut down in the water. Every stretch
  // dives at the line and the foam collars (drawWyrm) mark the spots.
  ctx.save();
  ctx.beginPath(); ctx.rect(-s * 1.2, -s * 2.6, s * 3.8, s * 2.6 + s * 0.035); ctx.clip();
  poly(ctx, [...L, ...R.reverse()], BASE);
  // pale-gold light along the top edge, amber shade along the belly edge
  ctx.strokeStyle = 'rgba(255,226,150,0.9)'; ctx.lineWidth = Math.max(2, s * 0.024);
  ctx.beginPath(); R.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  ctx.strokeStyle = 'rgba(110,70,18,0.65)'; ctx.lineWidth = Math.max(1.6, s * 0.02);
  ctx.beginPath(); L.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  // scale bands across the COILS: seams bowed along the curve, spaced
  // by arc length — the segmentation that stops a dome reading as a
  // smooth hill. Each band is a dark seam with a lit lip on its
  // head-side, like one plate overlapping the next.
  const bandAt = (si) => {
    const f = frameAt(si), th = S[si][2];
    const bow = th * 0.38;
    ctx.strokeStyle = shade(BASE, 0.55); ctx.lineWidth = Math.max(1.3, s * 0.016);
    ctx.beginPath(); ctx.moveTo(L[si][0], L[si][1]);
    ctx.quadraticCurveTo((L[si][0] + R[si][0]) / 2 + f.dx * bow, (L[si][1] + R[si][1]) / 2 + f.dy * bow, R[si][0], R[si][1]);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,226,150,0.35)'; ctx.lineWidth = Math.max(1, s * 0.008);
    ctx.beginPath(); ctx.moveTo(L[si][0] - f.dx * s * 0.035, L[si][1] - f.dy * s * 0.035);
    ctx.quadraticCurveTo((L[si][0] + R[si][0]) / 2 + f.dx * (bow - s * 0.035), (L[si][1] + R[si][1]) / 2 + f.dy * (bow - s * 0.035),
      R[si][0] - f.dx * s * 0.035, R[si][1] - f.dy * s * 0.035);
    ctx.stroke();
  };
  let acc = 0;
  for (let si = 6; si < NECK * SUB - 2; si++) {
    acc += Math.hypot(S[si][0] - S[si - 1][0], S[si][1] - S[si - 1][1]);
    if (acc >= s * 0.60) { acc = 0; if (S[si][1] < -s * 0.03) bandAt(si); }
  }
  // features ride the CONTROL points but take position and direction
  // from the smoothed curve (sample 8 per segment)
  const frame = (ci) => {
    const si = Math.min(S.length - 1, ci * SUB);
    const f = frameAt(si);
    return { p: S[si], l: L[si], dx: f.dx, dy: f.dy };
  };
  for (let ci = 1; ci < ctrl.length - 1; ci++) {
    const f = frame(ci);
    if (ci >= NECK || ci % 2 === 1) { // dorsal spines; on the neck they
      // lengthen and lean back along the curve — a bronze mane. A spine
      // whose base sits at the surface or whose tip would end under it
      // is never drawn: underwater fins were the blunt triangles.
      const big = (ci >= NECK ? 0.34 : 0.13) * s;
      const lean = ci >= NECK ? -0.55 : 0.04;
      const bx = f.p[0] + f.dy * ctrl[ci][2] * 0.78, by = f.p[1] - f.dx * ctrl[ci][2] * 0.78;
      const tip = [bx + f.dy * big + f.dx * big * lean, by - f.dx * big + f.dy * big * lean];
      if (by < -0.04 * s && tip[1] < 0.02 * s) {
        const hw = s * 0.085; // a wide base, sunk deep — grown, not pasted
        poly(ctx, [[bx - f.dx * hw, by - f.dy * hw], [bx + f.dx * hw, by + f.dy * hw], tip], shade(BRONZE, 0.72));
        poly(ctx, [[bx - f.dx * hw * 0.55, by - f.dy * hw * 0.55], [bx + f.dx * hw * 0.55, by + f.dy * hw * 0.55],
          [bx + (tip[0] - bx) * 0.62, by + (tip[1] - by) * 0.62]], ci % 2 ? BRONZE : shade(BRONZE, 0.85));
      }
    }
    if (ci >= NECK) { // a belly plate: a cream band across the neck's
      // front, laid along the curve, its lower edge shaded so each
      // plate reads as overlapping the next — segmentation, not bricks
      const g = 0.095 * s;
      const m = [f.l[0] + (f.p[0] - f.l[0]) * 0.8, f.l[1] + (f.p[1] - f.l[1]) * 0.8];
      poly(ctx, [f.l, m, [m[0] + f.dx * g, m[1] + f.dy * g],
        [f.l[0] + f.dx * g, f.l[1] + f.dy * g]], 'rgba(243,226,179,0.9)');
      ctx.strokeStyle = 'rgba(138,90,30,0.55)'; ctx.lineWidth = Math.max(1, s * 0.01);
      ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(m[0] + f.dx * g, m[1] + f.dy * g); ctx.stroke();
    }
  }
  ctx.restore();
  return ctrl;
}

function splash(ctx, x, y, r) {
  ctx.strokeStyle = CREAM; ctx.globalAlpha = 0.8; ctx.lineWidth = Math.max(1.4, r * 0.08);
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.3, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(x + i * r * 0.5, y - r * 0.1);
    ctx.lineTo(x + i * r * 0.72, y - r * (0.5 + 0.14 * (1 - Math.abs(i)))); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// The horned head in profile facing left: a longer snout than any fish
// in the bestiary, horns swept far back. maw 0..1 drops the jaw;
// rear 0..1 cocks the head back for the slam telegraph.
function head(ctx, s, K, hx, hy, maw, rear) {
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.06 - rear * 0.10);
  poly(ctx, [[0.10, -0.13], [0.36, -0.34], [0.17, -0.06]].map(p => [p[0] * s, p[1] * s]), BRONZE); // horn, swept back
  poly(ctx, [[0.02, -0.15], [0.22, -0.42], [0.09, -0.05]].map(p => [p[0] * s, p[1] * s]), shade(BRONZE, 0.8));
  poly(ctx, [[0.13, 0.02], [0.27, 0.06], [0.12, 0.10]].map(p => [p[0] * s, p[1] * s]), BRONZE); // cheek spike
  poly(ctx, [[0.16, -0.10], [-0.05, -0.17], [-0.34, -0.12], [-0.48, -0.03], [-0.40, 0.05], [0.02, 0.07], [0.20, 0.05]]
    .map(p => [p[0] * s, p[1] * s]), AMBER); // the skull, deep amber — its rear
  // runs long so the skull overlaps the neck top and the join blends
  poly(ctx, [[0.16, -0.10], [-0.05, -0.17], [-0.34, -0.12], [-0.20, -0.062], [-0.02, -0.072]]
    .map(p => [p[0] * s, p[1] * s]), shade(BASE, 1.3)); // lit crown — its lower
  // edge BOWS with the skull instead of cutting straight across it
  K.teeth(-0.45, 0.03, 2, 0.10, 0.055); // upper fangs
  K.slitEye(-0.20, -0.05, 0.085); // the red eye under its brow
  ctx.strokeStyle = '#2a1804'; ctx.lineWidth = Math.max(1.2, s * 0.022);
  ctx.beginPath(); ctx.moveTo(-0.28 * s, -0.09 * s); ctx.lineTo(-0.08 * s, -0.105 * s); ctx.stroke();
  ctx.save(); ctx.translate(0.10 * s, 0.05 * s); ctx.rotate(maw * 0.55); // the jaw
  poly(ctx, [[0.02, -0.01], [-0.36, 0.015], [-0.50, 0.055], [-0.40, 0.095], [0.02, 0.075]]
    .map(p => [p[0] * s, p[1] * s]), shade(AMBER, 1.25));
  K.teeth(-0.42, 0.028, 1, -0.06, 0.045); // one lower fang, pointing up
  ctx.restore(); ctx.restore();
}

// drawWyrm(ctx, x, y, s, t, color, maw, rear): the full serpent at the
// waterline point (x, y); broad low coils, a tapering S-neck, the head
// drawn a quarter larger again than the neck that carries it. color is
// the eye colour (the roster red).
export function drawWyrm(ctx, x, y, s, t, color = '#ff5a4e', maw = 0, rear = 0) {
  ctx.save(); ctx.translate(x, y);
  const ctrl = ribbon(ctx, s, rear);
  // a small tail fin breaks the surface where the body runs out —
  // the far end of the king, swept back like his horns, in his gold.
  // A crescent, not a wedge: its base dives INTO the ribbon's top
  // edge, so no straight join line shows where fin meets body.
  const fx = ctrl[0][0];
  ctx.fillStyle = shade(BASE, 1.15);
  ctx.beginPath();
  ctx.moveTo(fx - s * 0.13, s * 0.015);
  ctx.quadraticCurveTo(fx - s * 0.02, -s * 0.10, fx + s * 0.10, -s * 0.155);
  ctx.quadraticCurveTo(fx + s * 0.16, -s * 0.10, fx + s * 0.145, s * 0.015);
  ctx.quadraticCurveTo(fx, -s * 0.035, fx - s * 0.13, s * 0.015);
  ctx.closePath(); ctx.fill();
  const hp = ctrl[ctrl.length - 1];
  const hs = s * 1.25; // the head out-sizes the neck — the profile is the poster
  const KH = makeKit(ctx, hs, BASE, color);
  head(ctx, hs, KH, hp[0] - hs * 0.10, hp[1] - hs * 0.10, maw, rear);
  splash(ctx, ctrl[5][0], 2, s * 0.20);
  splash(ctx, ctrl[1][0], 2, s * 0.15); // a second collar where the tail-side dip kisses the surface
  splash(ctx, ctrl[2][0], 2, s * 0.15); // and one on the rear coil's flank as it slides under
  splash(ctx, ctrl[0][0], 2, s * 0.13); // the tail's own dive point gets its collar too
  ctx.restore();
}

// Compact serpent for roster cells and icons: coil, rising neck, horned head.
export function drawWyrmGlyph(ctx, x, y, s, color, eye = '#ffd23e') {
  ctx.save(); ctx.translate(x, y);
  const K = makeKit(ctx, s, color, eye);
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, s * 0.16); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(s * 0.16, s * 0.14, s * 0.30, Math.PI * 0.85, Math.PI * 2.3); ctx.stroke(); // coil
  ctx.beginPath(); ctx.moveTo(-s * 0.02, s * 0.05); ctx.quadraticCurveTo(-s * 0.10, -s * 0.18, -s * 0.17, -s * 0.32); ctx.stroke(); // neck
  poly(ctx, [[-0.31, -0.45], [-0.05, -0.51], [-0.10, -0.30], [-0.29, -0.29]].map(p => [p[0] * s, p[1] * s]), shade(color, 1.15)); // head
  poly(ctx, [[-0.08, -0.49], [0.07, -0.64], [0.0, -0.43]].map(p => [p[0] * s, p[1] * s]), BRONZE); // horn
  K.slitEye(-0.20, -0.385, 0.05);
  ctx.restore();
}
