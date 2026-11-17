// wyrm.js — the King Wyrm: a GOLDEN sea serpent — layered golds, deep
// amber in shadow, pale-gold light on the crest, bronze horns and a
// bronze mane of dorsal spines, cream belly plates, one red eye. The
// body follows ONE smooth curve (Catmull-Rom through the spine points):
// ONE TALL LOOP rearing out of the water — steep flanks, so every
// surface crossing is a near-vertical dive dissolved by its blend
// zone, never a shallow dome squatting on the surface — then a submerged
// valley, and the swan-arc neck bursting out to a long-snouted head
// held high. Canvas vector, poster style. See shapes.js.
import { shade, makeKit } from '../geom.js';

// Spine control points in s units (x right, y down, waterline y=0):
// tail tip, the tall loop (steep rise, high crown, steep dive), a
// submerged valley (clipped away by the dive rule), then the neck's
// S-arc to the head. Third value: half thickness — thick where the
// body leaves the water, finer toward the head. Index NECK is where
// the rising neck begins.
const SPINE = [
  [1.64, 0.08, 0.055], [1.58, -0.14, 0.12], [1.48, -0.52, 0.165], [1.30, -0.84, 0.185],
  [1.04, -0.95, 0.19], [0.80, -0.78, 0.185], [0.64, -0.40, 0.18], [0.54, -0.02, 0.17],
  [0.42, 0.16, 0.16], [0.24, -0.30, 0.155], [0.14, -0.60, 0.145], [0.05, -0.85, 0.138],
  [-0.06, -1.07, 0.13], [-0.21, -1.26, 0.122], [-0.38, -1.40, 0.115], [-0.52, -1.48, 0.11],
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
  // But at the surface itself the body keeps its FULL gauge — a body
  // entering water does not thin (a hand does not taper); the blend
  // zones at the crossings are what marry body to water.
  for (let i = 0; i < S.length; i++) {
    if (i < 8) S[i][2] *= 0.15 + 0.85 * (i / 8);
    const j = S.length - 1 - i;
    if (j < 6) S[i][2] *= 0.55 + 0.45 * (j / 6);
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
  // dives at the line and the blend zones (drawWyrm) dissolve the spots.
  ctx.save();
  ctx.beginPath(); ctx.rect(-s * 1.2, -s * 2.6, s * 3.8, s * 2.6 + s * 0.035); ctx.clip();
  poly(ctx, [...L, ...R.reverse()], BASE);
  // pale-gold light along the top edge, amber shade along the belly edge
  ctx.strokeStyle = 'rgba(255,226,150,0.9)'; ctx.lineWidth = Math.max(1.6, s * 0.017);
  ctx.beginPath(); R.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  ctx.strokeStyle = 'rgba(110,70,18,0.65)'; ctx.lineWidth = Math.max(1.3, s * 0.014);
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
  };
  let acc = 0;
  for (let si = 6; si < NECK * SUB - 2; si++) {
    acc += Math.hypot(S[si][0] - S[si - 1][0], S[si][1] - S[si - 1][1]);
    if (acc >= s * 1.5) { acc = 0; if (S[si][1] < -s * 0.03) bandAt(si); }
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

// a BLEND ZONE where the body breaks the surface — "penuh tapi nyatu
// sama air": full thickness, dissolved into the water. Not a ring
// sitting on the line: ripple rings spread on the surface, foam
// spreads out and MOUNDS climb and hug the body's base, pale streaks
// sheet UP the gold, droplets hang in the air above the foam — the
// body's lowest stretch mixes with splash and surface foam until no
// hard boundary survives and body and water read as one thing, the
// way a painted serpent's base dissolves into its splash. r is the
// body's half-thickness at the crossing, so the zone hugs the gauge.
export function blendCrossing(ctx, x, y, r, t, ph = 0) {
  const j = (k) => Math.sin(ph * 39.7 + k * 2.39) * 0.5; // per-crossing jitter
  ctx.lineCap = 'round';
  // one ripple ring, expanding and fading — only the near arc, kept
  // short and faint: translucent ellipse edges are the PNG budget's
  // worst enemy, so the ring whispers instead of drawing a target
  const u = (t * 0.4 + ph) % 1;
  ctx.strokeStyle = `rgba(220,238,250,${(0.2 * (1 - u)).toFixed(3)})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(x, y + 2, r * (1.2 + u * 0.7), r * (1.2 + u * 0.7) * 0.3, 0, Math.PI * 0.3, Math.PI * 0.7); ctx.stroke();
  // the mound hugging the base, climbing the flanks — chunky, mostly
  // opaque blobs side by side (overlapping translucency is what
  // costs), jittered so it reads as churned water, not scoops; the
  // wide flank blobs double as the foam spreading on the surface
  for (const [dx, dy, w, a] of [[-0.85, -0.04, 0.64, 0.68], [0, -0.15, 0.74, 0.92], [0.87, -0.04, 0.62, 0.68]]) {
    ctx.fillStyle = `rgba(244,250,255,${a})`;
    ctx.beginPath(); ctx.ellipse(x + (dx + j(dx * 3) * 0.14) * r, y + dy * r, r * w, r * w * 0.46, 0, 0, 6.29); ctx.fill();
  }
  ctx.strokeStyle = CREAM; ctx.globalAlpha = 0.9; // the crown's spikes,
  ctx.lineWidth = Math.max(1.4, r * 0.09); // thrown up through the mound
  for (let i = -1; i <= 1; i++) {
    const h = 0.74 - 0.14 * Math.abs(i); // the middle spike flies highest
    ctx.beginPath(); ctx.moveTo(x + i * r * 0.36, y - r * 0.25);
    ctx.lineTo(x + i * r * 0.5, y - r * h); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(235,246,255,0.6)'; // water sheeting UP the body:
  ctx.lineWidth = Math.max(1.2, r * 0.07); // pale runs climbing the gold
  for (const [dx, h] of [[-0.5, 0.9], [0.3, 1.05]]) {
    ctx.beginPath(); ctx.moveTo(x + dx * r, y - r * 0.1);
    ctx.quadraticCurveTo(x + dx * r * 1.15, y - r * h * 0.55, x + dx * r * 0.88, y - r * h); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(240,248,255,0.85)'; // droplets above the foam line
  for (const [dx, dy, d] of [[-0.9, -0.7, 0.09], [0.1, -0.95, 0.075], [0.85, -0.6, 0.06]]) {
    ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, Math.max(1, r * d), 0, 6.29); ctx.fill();
  }
}

// a tapered strand along a cubic bezier, in head units: thick at the
// root, hair-fine at the tip — whisker barbels, the chin beard, and
// the antler beams are all strands of different weights.
function strand(ctx, s, p, w0, w1, fill) {
  const P = (t) => {
    const u = 1 - t;
    return [u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6],
      u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7]];
  };
  const N = 10, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, pt = P(t), a = P(Math.max(0, t - 0.04)), b = P(Math.min(1, t + 0.04));
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    const w = (w0 + (w1 - w0) * t) / 2;
    L.push([(pt[0] - dy * w) * s, (pt[1] + dx * w) * s]);
    R.push([(pt[0] + dy * w) * s, (pt[1] - dx * w) * s]);
  }
  poly(ctx, [...L, ...R.reverse()], fill);
}

// the horns: TWO bold blades, UNBRANCHED — one great horn curving off
// the skull in a smooth S, swept far back, and a shorter second blade
// behind it, roughly parallel. A dragon's weapons, not a deer's rack:
// no tines, no branching, just taper and curve.
// (ox, oy) shifts the root; k scales the pair; fill shades it.
function horns(ctx, s, ox, oy, k, fill) {
  const P = (pts) => pts.map((v, i) => (i % 2 ? oy + v * k : ox + v * k));
  strand(ctx, s, P([0.06, -0.13, 0.13, -0.25, 0.26, -0.31, 0.41, -0.40]), 0.078 * k, 0.004, fill); // the great horn
  strand(ctx, s, P([0.17, -0.095, 0.24, -0.16, 0.31, -0.20, 0.40, -0.265]), 0.046 * k, 0.004, fill); // the second blade
}

// The DRAGON head in profile facing left — not a snake's smooth wedge:
// a squared muzzle with nostril bumps, a heavy brow plate over the red
// eye, two bold unbranched HORN blades swept back, long whisker BARBELS streaming back from
// the snout, a finned MANE flaring behind the jaw, a fang row along the
// jaw line and a small beard under the chin. maw 0..1 drops the jaw;
// rear 0..1 cocks the head back for the slam telegraph.
function head(ctx, s, K, hx, hy, maw, rear) {
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.06 - rear * 0.10);
  const M = (pts) => pts.map(p => [p[0] * s, p[1] * s]);
  // the finned mane, layered membranes flaring behind the jaw — outer
  // deep, inner lit, bronze rays running from the cheek anchor
  poly(ctx, M([[0.10, -0.16], [0.26, -0.26], [0.42, -0.18], [0.47, 0.02], [0.40, 0.22], [0.24, 0.30], [0.13, 0.16]]), shade(AMBER, 0.92));
  poly(ctx, M([[0.12, -0.10], [0.24, -0.16], [0.36, -0.09], [0.385, 0.05], [0.31, 0.19], [0.18, 0.20], [0.13, 0.06]]), BASE);
  ctx.strokeStyle = 'rgba(125,82,32,0.85)'; ctx.lineWidth = Math.max(1, s * 0.013);
  for (const [rx, ry] of [[0.40, -0.17], [0.455, 0.02], [0.385, 0.205], [0.26, 0.285]]) {
    ctx.beginPath(); ctx.moveTo(0.14 * s, 0.0); ctx.lineTo(rx * s, ry * s); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,226,150,0.75)';
  ctx.beginPath(); ctx.moveTo(0.26 * s, -0.26 * s); ctx.lineTo(0.42 * s, -0.18 * s);
  ctx.lineTo(0.47 * s, 0.02 * s); ctx.lineTo(0.40 * s, 0.22 * s); ctx.stroke();
  horns(ctx, s, -0.035, 0.01, 0.88, shade(BRONZE, 0.62)); // the far horns, darker, root hidden by the skull
  poly(ctx, M([[0.20, -0.06], [0.04, -0.15], [-0.14, -0.175], [-0.32, -0.155], [-0.455, -0.12], [-0.515, -0.06], [-0.52, -0.005], [-0.475, 0.04], [-0.22, 0.062], [0.02, 0.068], [0.20, 0.04]]), AMBER);
  // the skull, deep amber — a SQUARED muzzle: the front edge drops near-
  // vertical instead of rounding away, and the rear runs long so the
  // skull overlaps the neck top and the join blends
  poly(ctx, M([[0.20, -0.06], [0.04, -0.15], [-0.14, -0.175], [-0.32, -0.155], [-0.455, -0.12], [-0.40, -0.075], [-0.18, -0.068], [0.02, -0.075]]), shade(BASE, 1.3));
  // lit crown — its lower edge BOWS with the skull instead of cutting across
  poly(ctx, M([[-0.345, -0.15], [-0.06, -0.175], [-0.035, -0.12], [-0.16, -0.10], [-0.315, -0.105]]), shade(BRONZE, 0.85));
  // the BROW PLATE: a heavy bronze slab over the eye, lit along its top
  ctx.strokeStyle = 'rgba(255,226,150,0.7)'; ctx.lineWidth = Math.max(1, s * 0.011);
  ctx.beginPath(); ctx.moveTo(-0.345 * s, -0.15 * s); ctx.lineTo(-0.06 * s, -0.175 * s); ctx.stroke();
  for (const [nx, ny, nr] of [[-0.475, -0.125, 0.030], [-0.422, -0.136, 0.023]]) { // nostril bumps on the muzzle tip
    ctx.fillStyle = shade(AMBER, 1.18);
    ctx.beginPath(); ctx.ellipse(nx * s, ny * s, nr * s, nr * s * 0.68, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#2a1804';
    ctx.beginPath(); ctx.ellipse((nx - 0.003) * s, (ny - 0.008) * s, nr * s * 0.3, nr * s * 0.22, 0, 0, 6.29); ctx.fill();
  }
  K.slitEye(-0.205, -0.052, 0.088); // the red eye, glaring out from under the brow
  ctx.strokeStyle = '#2a1804'; ctx.lineWidth = Math.max(1.2, s * 0.02);
  ctx.beginPath(); ctx.moveTo(-0.345 * s, -0.112 * s); ctx.lineTo(-0.27 * s, -0.058 * s); ctx.stroke(); // the glare slash
  ctx.lineWidth = Math.max(1, s * 0.013); ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.moveTo(-0.505 * s, 0.018 * s); ctx.lineTo(-0.06 * s, 0.05 * s); ctx.stroke(); // the mouth line
  ctx.globalAlpha = 1;
  horns(ctx, s, 0, 0, 1, BRONZE); // the near horns, full bronze
  // whisker barbels: two long strands streaming BACK from the snout —
  // one arcing high over the brow, one flowing under the jaw
  strand(ctx, s, [-0.505, -0.07, -0.36, -0.27, -0.02, -0.385, 0.27, -0.345], 0.02, 0.0025, shade(CREAM, 1.06));
  strand(ctx, s, [-0.475, 0.035, -0.33, 0.15, 0.0, 0.205, 0.32, 0.125], 0.018, 0.0025, shade(CREAM, 1.06));
  K.teeth(-0.495, 0.03, 2, 0.115, 0.042); // two long front fangs…
  K.teeth(-0.40, 0.036, 4, 0.052, 0.046); // …and the fang row behind them
  K.teeth(-0.20, 0.04, 3, 0.04, 0.042);
  ctx.save(); ctx.translate(0.10 * s, 0.05 * s); ctx.rotate(maw * 0.55); // the jaw
  poly(ctx, M([[0.02, -0.005], [-0.28, 0.008], [-0.45, 0.022], [-0.525, 0.05], [-0.50, 0.088], [-0.30, 0.105], [0.02, 0.078]]), shade(AMBER, 1.25));
  // an angular jaw with a squared chin corner, not a smooth scoop
  K.teeth(-0.52, 0.045, 1, -0.062, 0.038); // lower fang, pointing up at the chin
  K.teeth(-0.44, 0.04, 2, -0.038, 0.04); // and two smaller teeth behind it
  strand(ctx, s, [-0.50, 0.075, -0.52, 0.13, -0.48, 0.165, -0.42, 0.185], 0.015, 0.002, shade(CREAM, 1.05)); // the chin beard
  strand(ctx, s, [-0.435, 0.082, -0.44, 0.13, -0.40, 0.155, -0.345, 0.17], 0.012, 0.002, shade(CREAM, 1.05));
  ctx.restore(); ctx.restore();
}

// drawWyrm(ctx, x, y, s, t, color, maw, rear): the full serpent at the
// waterline point (x, y); one tall loop, a tapering S-neck, the head
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
  // a blend zone at EVERY surface crossing of the pose — the tail's
  // dive, the loop's steep rise, the loop's steep dive, and the neck
  // bursting out of the submerged valley — each sized to the body's
  // half-thickness right there, so the full-gauge body dissolves
  // into broken water instead of meeting it on a hard line
  blendCrossing(ctx, ctrl[0][0], 2, s * 0.11, t, 0.1); // the tail's dive
  blendCrossing(ctx, ctrl[1][0], 2, s * 0.13, t, 0.5); // the loop rears out
  blendCrossing(ctx, ctrl[7][0], 2, s * 0.18, t, 0.85); // the loop dives back
  blendCrossing(ctx, (ctrl[8][0] + ctrl[9][0]) / 2, 2, s * 0.17, t, 0.3); // the neck breaks out
  ctx.restore();
}

// Compact serpent for roster cells and icons: coil, rising neck, horned head.
export function drawWyrmGlyph(ctx, x, y, s, color, eye = '#ffd23e') {
  ctx.save(); ctx.translate(x, y);
  const K = makeKit(ctx, s, color, eye);
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, s * 0.16); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(s * 0.16, s * 0.14, s * 0.30, Math.PI * 0.85, Math.PI * 2.3); ctx.stroke(); // coil
  ctx.beginPath(); ctx.moveTo(-s * 0.02, s * 0.05); ctx.quadraticCurveTo(-s * 0.10, -s * 0.18, -s * 0.17, -s * 0.32); ctx.stroke(); // neck
  poly(ctx, [[-0.07, -0.33], [0.06, -0.26], [-0.04, -0.17]].map(p => [p[0] * s, p[1] * s]), shade(color, 0.85)); // mane tick behind the jaw
  poly(ctx, [[-0.31, -0.45], [-0.05, -0.51], [-0.10, -0.30], [-0.29, -0.29]].map(p => [p[0] * s, p[1] * s]), shade(color, 1.15)); // head
  poly(ctx, [[-0.08, -0.49], [0.07, -0.64], [0.0, -0.43]].map(p => [p[0] * s, p[1] * s]), BRONZE); // horn blade, unbranched
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(0.8, s * 0.05); // the whisker, streaming back
  ctx.beginPath(); ctx.moveTo(-0.30 * s, -0.40 * s); ctx.quadraticCurveTo(-0.16 * s, -0.50 * s, 0.05 * s, -0.44 * s); ctx.stroke();
  K.slitEye(-0.20, -0.385, 0.05);
  ctx.restore();
}
