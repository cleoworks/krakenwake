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
  // a point across the body's width at sample si: f=0 is the belly
  // (L) edge, f=1 the crest (R) edge — the shading bands, the scale
  // field and the belly plates are all laid out in these fractions
  const crossAt = (si, f) => [L[si][0] + (R[si][0] - L[si][0]) * f, L[si][1] + (R[si][1] - L[si][1]) * f];
  const band = (f0, f1) => {
    const F = (g, si) => (typeof g === 'function' ? g(si) : g);
    const pts = [];
    for (let si = 0; si < S.length; si++) pts.push(crossAt(si, F(f0, si)));
    for (let si = S.length - 1; si >= 0; si--) pts.push(crossAt(si, F(f1, si)));
    return pts;
  };
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
  // TWO-TONE SHADING across the width, stepped like poster paint:
  // a soft CREAM belly down the front, the base gold through the
  // middle, a brighter gold up the crest — the body reads with
  // VOLUME, a round hide catching light, not a flat ribbon of one
  // gold. The belly's outer edge FLOWS: full reach down the front,
  // pulling in where the front rolls over the loop's crown — there
  // the back is up, and wears scale instead of belly.
  const bellyOut = S.map((p, si) => {
    const f = frameAt(si);
    return f.dx < -0.85 && Math.abs(f.dy) < 0.5 ? 0.03 : 0.44;
  });
  for (let k = 0; k < 3; k++) for (let si = 1; si < S.length - 1; si++)
    bellyOut[si] = (bellyOut[si - 1] + bellyOut[si] * 2 + bellyOut[si + 1]) / 4;
  const bellyF = (si) => bellyOut[si];
  poly(ctx, band(0, bellyF), shade(CREAM, 0.92));
  poly(ctx, band(bellyF, 0.74), BASE);
  poly(ctx, band(0.74, 1), shade(BASE, 1.22));
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
  // THE SCALE FIELD: rows of overlapping scallops across the
  // body's crest half, shingled toward the tail, staggered row to
  // row — the concept's scale texture where the light rides; the
  // front half wears the soft belly rows instead. Pale arcs on the
  // lit gold, dark seams where the crest rolls into shadow. Only
  // where the body rides above the surface.
  ctx.lineWidth = Math.max(1, s * 0.008);
  let racc = 0, row = 0;
  for (let si = 6; si < S.length - 4; si++) {
    racc += Math.hypot(S[si][0] - S[si - 1][0], S[si][1] - S[si - 1][1]);
    if (racc < s * 0.26) continue;
    racc = 0; row++;
    if (S[si][1] > -s * 0.04) continue;
    const f = frameAt(si), th = S[si][2];
    for (const fr0 of [0.54, 0.76]) { // the crest half only: the front
      // half wears the belly plates, and arcs under them are wasted ink.
      // SOLID tones, no alpha — poster-crisp arcs, and far cheaper in
      // the PNG than translucent blends over three band tones
      const fr = fr0 + (row % 2) * 0.09;
      if (fr > 0.97) continue;
      const a = crossAt(si, fr - 0.115), b = crossAt(si, fr + 0.115);
      ctx.strokeStyle = fr < 0.65 ? shade(BASE, 0.60) : shade(BASE, 1.48);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      ctx.quadraticCurveTo((a[0] + b[0]) / 2 - f.dx * th * 0.42, (a[1] + b[1]) / 2 - f.dy * th * 0.42, b[0], b[1]);
      ctx.stroke();
    }
  }
  // BELLY SCALE ROWS: the front wears soft OVERLAPPING SCALE ROWS,
  // not armor — scallop arcs laid over the cream belly, bowed
  // toward the tail, staggered row to row, in a deeper cream so
  // each row's lip reads as one scale overlapping the next. Only
  // where the belly runs full — it pulls in over the crown, and
  // there the crest's own scales take over.
  ctx.strokeStyle = shade(CREAM, 0.60);
  ctx.lineWidth = Math.max(1.2, s * 0.016);
  ctx.lineCap = 'round';
  let bacc = 0, brow = 0;
  for (let si = 6; si < S.length - 4; si++) {
    bacc += Math.hypot(S[si][0] - S[si - 1][0], S[si][1] - S[si - 1][1]);
    if (bacc < s * 0.30) continue;
    bacc = 0; brow++;
    if (S[si][1] > -s * 0.05 || bellyOut[si] < 0.2) continue;
    const f = frameAt(si), th = S[si][2];
    for (const fr0 of [0.13, 0.30]) {
      const fr = fr0 + (brow % 2) * 0.07;
      const a = crossAt(si, fr - 0.10), b = crossAt(si, fr + 0.10);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      ctx.quadraticCurveTo((a[0] + b[0]) / 2 - f.dx * th * 0.40, (a[1] + b[1]) / 2 - f.dy * th * 0.40, b[0], b[1]);
      ctx.stroke();
    }
  }
  // DORSAL SPINES: tall bronze BLADES along the crest — on the coils
  // at every control point now, and on the neck a dense mane of long
  // blades leaning back along the curve, a shorter blade between
  // each pair. A spine whose base sits at the surface or whose tip
  // would end under it is never drawn: underwater fins were the
  // blunt triangles.
  const spineGeom = (si, len, lean, hw) => {
    const f = frameAt(si), th = S[si][2];
    const bx = S[si][0] + f.dy * th * 0.78, by = S[si][1] - f.dx * th * 0.78;
    const tip = [bx + f.dy * len + f.dx * len * lean, by - f.dx * len + f.dy * len * lean];
    if (by > -0.04 * s || tip[1] > 0.02 * s) return null;
    return { f, bx, by, tip, hw };
  };
  const drawSpine = (g, tone, inner = true) => {
    const { f, bx, by, tip, hw } = g; // a wide base, sunk deep — grown, not pasted
    // a CURVED blade, not a rigid triangle: each side bows outward
    // through a mid point before narrowing to the tip, the leading
    // edge pushed a touch further forward — a fin's sweep
    const blade = (k, wMul) => {
      const mx = bx + (tip[0] - bx) * 0.55, my = by + (tip[1] - by) * 0.55;
      const w = hw * wMul, ow = hw * wMul * 0.60;
      return [[bx - f.dx * w, by - f.dy * w],
        [mx - f.dx * ow + f.dy * w * 0.14, my - f.dy * ow - f.dx * w * 0.14],
        [bx + (tip[0] - bx) * k, by + (tip[1] - by) * k],
        [mx + f.dx * ow + f.dy * w * 0.14, my + f.dy * ow - f.dx * w * 0.14],
        [bx + f.dx * w, by + f.dy * w]];
    };
    poly(ctx, blade(1, 1), shade(BRONZE, 0.72));
    if (inner) poly(ctx, blade(0.62, 0.55), tone);
  };
  for (let ci = 1; ci < NECK; ci++) {
    if (ci % 2 === 0) continue; // coil blades at every other point —
    // the silhouette keeps its teeth, the rows keep their air; and a
    // single tone apiece — the nested second tone is the neck's luxury
    const g = spineGeom(ci * SUB, 0.21 * s, 0.04, s * 0.075);
    if (g) drawSpine(g, BRONZE, false);
  }
  const neckSpines = [];
  for (let ci = NECK; ci < ctrl.length - 1; ci++) {
    const a = spineGeom(ci * SUB, 0.46 * s, -0.55, s * 0.08);
    if (a) neckSpines.push(a);
  }
  // (the neck frill is carried by the mane and the blade row
  // themselves — the translucent membranes once webbed between the
  // last blades were cut: heavy in PNG bytes, and the fin read
  // survives on the blades alone)
  neckSpines.forEach((g, i) => drawSpine(g, i % 2 ? shade(BRONZE, 0.85) : BRONZE));
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
    const w = (w0 + (w1 - w0) * Math.pow(t, 1.35)) / 2; // a CURVED taper:
    // full through the root's reach, thinning fast only near the tip
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
  strand(ctx, s, P([0.06, -0.13, 0.18, -0.30, 0.40, -0.44, 0.70, -0.56]), 0.092 * k, 0.004, fill); // the great horn
  strand(ctx, s, P([0.17, -0.095, 0.30, -0.20, 0.46, -0.28, 0.66, -0.40]), 0.056 * k, 0.004, fill); // the second blade
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
  // the finned mane, layered membranes flaring behind the jaw — a
  // FULLER mane, and an ORGANIC one: every spike is two quadratic
  // sweeps bowing outward to its point, flowing back from the head
  // and jaw like a fin in water — no rigid triangles, no straight
  // rim. Outer deep, inner lit, bronze rays from the cheek anchor.
  const mane = (spikes, start, c1, p1, c2, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(start[0] * s, start[1] * s);
    for (const [a, t, b, v] of spikes) {
      ctx.quadraticCurveTo(a[0] * s, a[1] * s, t[0] * s, t[1] * s);
      ctx.quadraticCurveTo(b[0] * s, b[1] * s, v[0] * s, v[1] * s);
    }
    ctx.quadraticCurveTo(c1[0] * s, c1[1] * s, p1[0] * s, p1[1] * s);
    ctx.quadraticCurveTo(c2[0] * s, c2[1] * s, start[0] * s, start[1] * s);
    ctx.closePath(); ctx.fill();
  };
  mane([[[0.09, -0.27], [0.17, -0.35], [0.235, -0.315], [0.26, -0.21]],
    [[0.265, -0.335], [0.35, -0.39], [0.415, -0.335], [0.43, -0.21]],
    [[0.445, -0.315], [0.53, -0.31], [0.575, -0.225], [0.56, -0.11]],
    [[0.575, -0.045], [0.65, 0.03], [0.615, 0.095], [0.55, 0.11]],
    [[0.565, 0.205], [0.61, 0.27], [0.55, 0.315], [0.48, 0.29]],
    [[0.475, 0.385], [0.49, 0.43], [0.435, 0.405], [0.36, 0.34]],
    [[0.345, 0.435], [0.31, 0.45], [0.265, 0.385], [0.20, 0.28]]],
    [0.10, -0.13], [0.13, 0.16], [0.11, 0.02], [0.095, -0.06], shade(AMBER, 0.92));
  mane([[[0.115, -0.20], [0.20, -0.25], [0.25, -0.225], [0.27, -0.14]],
    [[0.275, -0.235], [0.35, -0.27], [0.395, -0.23], [0.40, -0.13]],
    [[0.41, -0.20], [0.47, -0.19], [0.495, -0.13], [0.48, -0.05]],
    [[0.49, 0.015], [0.54, 0.07], [0.505, 0.115], [0.45, 0.13]],
    [[0.455, 0.185], [0.48, 0.235], [0.435, 0.255], [0.38, 0.225]],
    [[0.375, 0.29], [0.375, 0.325], [0.33, 0.29], [0.27, 0.225]]],
    [0.115, -0.075], [0.14, 0.10], [0.12, 0.01], [0.11, -0.03], BASE);
  ctx.strokeStyle = 'rgba(125,82,32,0.85)'; ctx.lineWidth = Math.max(1, s * 0.013);
  for (const [rx, ry] of [[0.34, -0.37], [0.52, -0.29], [0.63, 0.03], [0.59, 0.26], [0.47, 0.41], [0.30, 0.43]]) {
    ctx.beginPath(); ctx.moveTo(0.15 * s, 0.01 * s); ctx.lineTo(rx * s, ry * s); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,226,150,0.75)';
  ctx.beginPath(); ctx.moveTo(0.17 * s, -0.35 * s);
  ctx.quadraticCurveTo(0.26 * s, -0.21 * s, 0.35 * s, -0.39 * s);
  ctx.quadraticCurveTo(0.43 * s, -0.21 * s, 0.53 * s, -0.31 * s);
  ctx.quadraticCurveTo(0.56 * s, -0.11 * s, 0.65 * s, 0.03 * s);
  ctx.quadraticCurveTo(0.55 * s, 0.11 * s, 0.61 * s, 0.27 * s);
  ctx.quadraticCurveTo(0.48 * s, 0.29 * s, 0.49 * s, 0.43 * s); ctx.stroke();
  horns(ctx, s, -0.035, 0.01, 0.88, shade(BRONZE, 0.62)); // the far horns, darker, root hidden by the skull
  poly(ctx, M([[0.22, -0.048], [0.10, -0.115], [-0.02, -0.142], [-0.16, -0.158], [-0.30, -0.156], [-0.44, -0.140], [-0.56, -0.120], [-0.645, -0.098], [-0.685, -0.072], [-0.69, -0.038], [-0.672, -0.006], [-0.60, 0.016], [-0.48, 0.034], [-0.32, 0.048], [-0.14, 0.056], [0.04, 0.058], [0.22, 0.036]]), AMBER);
  // the skull, deep amber — a LONG dragon snout drawn in CURVES:
  // many points along gentle arcs, the top line flowing far
  // forward and easing down to the tip, the underside curving
  // back under it — no straight plate edges anywhere on the head.
  // The rear runs long so the skull overlaps the neck top and the
  // join blends
  poly(ctx, M([[0.22, -0.048], [0.10, -0.115], [-0.02, -0.142], [-0.16, -0.158], [-0.30, -0.156], [-0.44, -0.140], [-0.56, -0.120], [-0.645, -0.098], [-0.66, -0.070], [-0.55, -0.057], [-0.38, -0.061], [-0.20, -0.064], [-0.02, -0.066], [0.10, -0.057]]), shade(BASE, 1.3));
  // lit crown — a smooth crescent following the skull's curve
  poly(ctx, M([[-0.50, -0.116], [-0.38, -0.138], [-0.22, -0.150], [-0.08, -0.148], [-0.055, -0.112], [-0.20, -0.102], [-0.36, -0.098], [-0.47, -0.092]]), shade(BRONZE, 0.85));
  // NO armor plates on this head — the skull wears SCALE ARCS and
  // soft shading like the rest of the animal: two staggered rows
  // of scallops over the crown and cheek, and a curved brow shadow
  // sweeping over the eye. Arcs and curves only; the plated, seamed
  // facets read as a robot's shell, and this is a living dragon.
  ctx.strokeStyle = shade(BASE, 0.60); ctx.lineWidth = Math.max(1, s * 0.010);
  for (const [ax, ay, ar] of [[-0.46, -0.100, 0.046], [-0.355, -0.112, 0.049], [-0.25, -0.115, 0.049], [-0.145, -0.108, 0.045],
    [-0.43, -0.058, 0.040], [-0.155, -0.048, 0.042], [-0.055, -0.036, 0.038]]) {
    ctx.beginPath(); ctx.arc(ax * s, ay * s, ar * s, Math.PI * 0.18, Math.PI * 0.82); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(42,24,4,0.55)'; ctx.lineWidth = Math.max(1.2, s * 0.016);
  ctx.beginPath(); ctx.arc(-0.28 * s, -0.058 * s, 0.082 * s, Math.PI * 1.12, Math.PI * 1.60); ctx.stroke(); // the brow's curved shadow
  for (const [nx, ny, nr] of [[-0.645, -0.098, 0.028], [-0.598, -0.110, 0.021]]) { // nostril bumps on the long snout's tip
    ctx.fillStyle = shade(AMBER, 1.18);
    ctx.beginPath(); ctx.ellipse(nx * s, ny * s, nr * s, nr * s * 0.68, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#2a1804';
    ctx.beginPath(); ctx.ellipse((nx - 0.003) * s, (ny - 0.008) * s, nr * s * 0.3, nr * s * 0.22, 0, 0, 6.29); ctx.fill();
  }
  // (no nostril smoke: with the snout lengthened, the head reaches
  // under the centred slam banner — a rising wisp would cross it)
  K.slitEye(-0.28, -0.048, 0.10); // the red eye, slit-pupilled, set back under the brow plate's overhang
  ctx.strokeStyle = '#2a1804'; ctx.lineWidth = Math.max(1.2, s * 0.02);
  ctx.beginPath(); ctx.moveTo(-0.42 * s, -0.098 * s); ctx.quadraticCurveTo(-0.36 * s, -0.082 * s, -0.335 * s, -0.05 * s); ctx.stroke(); // the glare, curved
  ctx.lineWidth = Math.max(1, s * 0.013); ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.moveTo(-0.665 * s, 0.002 * s); ctx.quadraticCurveTo(-0.36 * s, 0.030 * s, -0.05 * s, 0.048 * s); ctx.stroke(); // the mouth line, a gentle curve
  ctx.globalAlpha = 1;
  horns(ctx, s, 0, 0, 1, BRONZE); // the near horns, full bronze
  // whisker barbels: two LONG strands from the snout — one arcing
  // high over the brow, one DROOPING from the snout and flowing
  // back under the jaw, both reaching well past the cheek like the
  // concept's whiskers
  strand(ctx, s, [-0.665, -0.05, -0.42, -0.30, 0.02, -0.44, 0.46, -0.35], 0.024, 0.0025, shade(CREAM, 1.06));
  strand(ctx, s, [-0.64, 0.018, -0.44, 0.115, -0.02, 0.205, 0.50, 0.125], 0.022, 0.0025, shade(CREAM, 1.06));
  K.teeth(-0.66, 0.014, 2, 0.15, 0.042); // two long front fangs…
  K.teeth(-0.565, 0.02, 4, 0.070, 0.046); // …and the fang row behind them
  K.teeth(-0.36, 0.026, 3, 0.054, 0.042);
  ctx.save(); ctx.translate(0.10 * s, 0.05 * s); ctx.rotate(maw * 0.55); // the jaw
  // a distinct LOWER JAW, long as the snout it answers: an angular
  // blade with a squared chin corner, riding a touch behind the
  // upper jaw's tip so the overhang reads — and it hangs slightly
  // open on its hinge, its own fang row pointing up to meet the
  // upper row
  poly(ctx, M([[0.02, -0.005], [-0.25, 0.0], [-0.48, 0.005], [-0.65, 0.010], [-0.71, 0.026], [-0.73, 0.045], [-0.70, 0.066], [-0.62, 0.080], [-0.45, 0.092], [-0.25, 0.090], [-0.08, 0.076], [0.02, 0.058]]), shade(AMBER, 1.25));
  K.teeth(-0.70, 0.03, 1, -0.085, 0.038); // lower fang, pointing up at the chin
  K.teeth(-0.60, 0.028, 2, -0.050, 0.04); // and the lower row behind it
  K.teeth(-0.46, 0.026, 2, -0.042, 0.04);
  strand(ctx, s, [-0.70, 0.055, -0.715, 0.115, -0.665, 0.175, -0.585, 0.225], 0.016, 0.002, shade(CREAM, 1.05)); // the chin beard,
  strand(ctx, s, [-0.625, 0.062, -0.63, 0.12, -0.585, 0.175, -0.51, 0.215], 0.013, 0.002, shade(CREAM, 1.05)); // three strands
  strand(ctx, s, [-0.555, 0.066, -0.55, 0.115, -0.505, 0.16, -0.435, 0.20], 0.011, 0.002, shade(CREAM, 1.05)); // under the new chin
  ctx.restore(); ctx.restore();
}

// drawWyrm(ctx, x, y, s, t, color, maw, rear): the full serpent at the
// waterline point (x, y); one tall loop, a tapering S-neck, the head
// drawn a quarter larger again than the neck that carries it. color is
// the eye colour (the roster red).
export function drawWyrm(ctx, x, y, s, t, color = '#ff5a4e', maw = 0, rear = 0) {
  ctx.save(); ctx.translate(x, y);
  const ctrl = ribbon(ctx, s, rear);
  // the TAIL FLUKE breaks the surface where the body runs out — the
  // concept's great fan tail: five lobes fanned up off a base that
  // dives INTO the ribbon's end, webbing scalloped between the rays,
  // a smaller fan laid inside for depth, bronze rays over the gold.
  const fx = ctrl[0][0];
  const fanTips = [[-0.34, -0.26], [-0.18, -0.37], [0.0, -0.42], [0.18, -0.36], [0.34, -0.24]];
  const fan = (k, fill) => {
    const bx = fx, by = s * 0.03;
    const tip = ([tx, ty]) => [bx + tx * s * k, by + ty * s * k];
    const pts = [[bx - s * 0.10 * k, by]];
    fanTips.forEach((t, i) => {
      if (i) { const p = fanTips[i - 1], m = tip([(p[0] + t[0]) / 2, (p[1] + t[1]) / 2 + 0.13]); pts.push(m); }
      pts.push(tip(t));
    });
    pts.push([bx + s * 0.10 * k, by]);
    poly(ctx, pts, fill);
    return tip;
  };
  const tipAt = fan(1, shade(BASE, 1.12));
  fan(0.68, BASE);
  ctx.strokeStyle = 'rgba(138,90,30,0.5)'; ctx.lineWidth = Math.max(1, s * 0.011);
  for (const t of fanTips) {
    const [tx, ty] = tipAt(t);
    ctx.beginPath(); ctx.moveTo(fx, s * 0.03); ctx.lineTo(tx, ty); ctx.stroke();
  }
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
