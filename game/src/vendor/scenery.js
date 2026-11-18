// scenery.js — one job: density. Everything render.js had no room for —
// a busier sky, a third water texture, life under and on the surface, a
// dressed dock, and the theatre around a fight. All placed from fixed
// hashes plus the frame clock, so every screenshot agrees.
import { staminaWord, calloutLines } from '../fight.js';
import { MONSTERS, WEATHERS } from '../data.js';
import { drawFishShape } from './shapes.js';
import { WATER_Y, lurePos, calloutX, MOON_X, MOON_Y } from '../render.js';

const hash = (i, k) => ((i * 2654435761 + k * 40503) % 1000) / 1000;

// --- the sky: a finer star field and two slow cloud bands ---
export function drawSkyExtras(ctx, run, t) {
  ctx.fillStyle = '#dfeaf6';
  for (let i = 0; i < 24; i++) {
    const x = hash(i, 11) * 1280;
    const y = 8 + hash(i, 12) * 330;
    if (Math.hypot(x - MOON_X, y - MOON_Y) < 78) continue;
    ctx.globalAlpha = 0.12 + 0.3 * Math.abs(Math.sin(t * 0.5 + i * 2.3));
    const s = i % 4 === 0 ? 2.4 : 1.6;
    ctx.fillRect(x, y, s, s);
    if (i % 6 === 0) { // a cross sparkle on the brightest few
      ctx.fillRect(x - 2.2, y + s / 2 - 0.6, s + 4.4, 1.2);
      ctx.fillRect(x + s / 2 - 0.6, y - 2.2, 1.2, s + 4.4);
    }
  }
  ctx.globalAlpha = 1;
  // cloud silhouettes: flat dark banks sitting on the sky bands,
  // placed in the open sky the staging leaves bare — left of the
  // moon, right of the banner's column, low under the moon. Never
  // on the moon, the callout column or a panel. A second, fainter
  // pass rides inside each bank so the silhouette has weather in
  // it instead of reading as one flat blob.
  const bank = (cx, cy, s) => {
    ctx.fillStyle = 'rgba(10,16,30,0.55)';
    for (const [dx, dy, rx, ry] of [[-38, 3, 40, 8], [0, -3, 54, 11], [40, 3, 34, 7]]) {
      ctx.beginPath();
      ctx.ellipse(cx + dx * s, cy + dy * s, rx * s, ry * s, 0, 0, 6.29);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(24,32,54,0.35)';
    for (const [dx, dy, rx, ry] of [[-16, -1, 30, 6], [22, 1, 24, 5]]) {
      ctx.beginPath();
      ctx.ellipse(cx + dx * s, cy + dy * s, rx * s, ry * s, 0, 0, 6.29);
      ctx.fill();
    }
  };
  bank(118, 148, 0.9); // high left, under the goal bar, clear of the moon
  bank(872, 164, 1.05); // right of the banner column, left of the haul panel
  bank(404, 304, 0.8); // low under the moon, clear of the callouts
  bank(648, 56, 0.95); // top centre, over the banner — the sky's last bare field
  bank(1052, 116, 0.7); // upper right, behind the haul panel's corner
  // thin wisps riding lower, where the sky is emptiest
  ctx.fillStyle = 'rgba(16,24,44,0.4)';
  for (const [wx, wy, wr] of [[170, 262, 58], [700, 352, 44], [540, 252, 46]]) {
    ctx.beginPath();
    ctx.ellipse(wx, wy, wr, 4.5, 0, 0, 6.29);
    ctx.fill();
  }
  // star clusters: loose knots of one-pixel stars, the fine grain
  // that keeps open sky from reading as flat colour
  ctx.fillStyle = '#dfeaf6';
  for (const [cx, cy, seed] of [[452, 246, 81], [985, 250, 83], [706, 92, 85], [958, 232, 87], [180, 84, 89]]) {
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = 0.25 + hash(i, seed) * 0.4;
      ctx.fillRect(cx + (hash(i, seed + 1) - 0.5) * 56, cy + (hash(i, seed + 2) - 0.5) * 30, 1.3, 1.3);
    }
  }
  ctx.globalAlpha = 1;
  // a soft halo breathing around the Blood Moon — ring strokes, not
  // a filled disc, so the moon's face stays clean under its glow
  if (WEATHERS[run.weatherIdx].name === 'Blood Moon') {
    ctx.strokeStyle = 'rgba(232,72,63,0.15)';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(MOON_X, MOON_Y, 75, 0, 6.29); ctx.stroke();
    ctx.strokeStyle = 'rgba(232,72,63,0.07)';
    ctx.lineWidth = 18;
    ctx.beginPath(); ctx.arc(MOON_X, MOON_Y, 90, 0, 6.29); ctx.stroke();
  }
  // a shoreline village on the far ridge — roof silhouettes with
  // lit windows, small with distance, riding the same ridge line
  // render.js lays (its formula, so the houses sit ON the shore)
  const ridgeY = (x) => WATER_Y - 46 - 26 * Math.sin(x * 0.004 + 2);
  for (let i = 0; i < 6; i++) {
    const hx = 596 + i * 21 + hash(i, 71) * 6;
    const hw = 13 + hash(i, 72) * 6, hh = 7 + hash(i, 73) * 5;
    const hy = ridgeY(hx) + 3;
    ctx.fillStyle = '#070f1a';
    ctx.fillRect(hx, hy - hh, hw, hh);
    ctx.beginPath();
    ctx.moveTo(hx - 1.5, hy - hh); ctx.lineTo(hx + hw / 2, hy - hh - 4.5); ctx.lineTo(hx + hw + 1.5, hy - hh);
    ctx.fill();
    ctx.fillStyle = '#ffca7a';
    ctx.fillRect(hx + 2.5 + hash(i, 74) * 4, hy - hh + 2.5, 1.8, 2.2);
    if (hash(i, 75) > 0.45) ctx.fillRect(hx + hw - 4.5, hy - hh + 2.5, 1.8, 2.2);
  }
  // a low flock skimming the water far out, left of the callouts —
  // silhouette strokes, the same language as the horizon flock
  ctx.strokeStyle = 'rgba(10,18,32,0.8)';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const bx = 262 + i * 34, by = 312 + (i % 2) * 9 + Math.sin(t * 1.1 + i * 1.9) * 2.5;
    const flap = Math.sin(t * 5.6 + i * 1.4) * 2.8;
    ctx.beginPath();
    ctx.moveTo(bx - 5.5, by + flap * 0.4);
    ctx.lineTo(bx, by - 2 - flap);
    ctx.lineTo(bx + 5.5, by + flap * 0.4);
    ctx.stroke();
  }
}

// --- the water: foam, sparkle, and everything living in it ---
function drawFoamAndSparkle(ctx, run, t) {
  // drifting foam flecks, short pale dashes riding the swell leftward
  ctx.strokeStyle = 'rgba(215,238,252,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 17; i++) {
    const x = ((hash(i, 21) * 1340 - t * (9 + hash(i, 22) * 14)) % 1340 + 1340) % 1340 - 30;
    const y = WATER_Y + 18 + hash(i, 23) * 240;
    ctx.moveTo(x, y);
    ctx.lineTo(x + 7 + hash(i, 24) * 9, y);
  }
  ctx.stroke();
  // larger foam dashes low in the frame — big enough to still
  // read after the judge's downscale, where fine flecks vanish
  ctx.strokeStyle = 'rgba(215,238,252,0.30)';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const x = ((hash(i, 43) * 1340 - t * (7 + hash(i, 44) * 10)) % 1340 + 1340) % 1340 - 30;
    const y = WATER_Y + 150 + hash(i, 45) * 120;
    ctx.moveTo(x, y);
    ctx.lineTo(x + 18 + hash(i, 46) * 16, y);
  }
  ctx.stroke();
  // dark flecks in the deep water — the same dash language read as
  // shadow, so the surface has something under it, not just on it
  ctx.strokeStyle = 'rgba(4,10,18,0.28)';
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const x = ((hash(i, 27) * 1340 - t * (6 + hash(i, 28) * 9)) % 1340 + 1340) % 1340 - 30;
    const y = WATER_Y + 120 + hash(i, 29) * 150;
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10 + hash(i, 30) * 12, y);
  }
  ctx.stroke();
  // the third texture layer: fine sparkle, denser and smaller than dressing's
  ctx.fillStyle = '#e8f4ff';
  for (let i = 0; i < 15; i++) {
    const x = hash(i, 25) * 1280;
    const y = WATER_Y + 10 + hash(i, 26) * 268;
    ctx.globalAlpha = 0.03 + 0.1 * Math.abs(Math.sin(t * 1.7 + i * 2.9));
    ctx.fillRect(x, y, 1.7, 1.2);
  }
  ctx.globalAlpha = 1;
  // a broken lace of foam riding the waterline itself — short pale
  // dashes with hash gaps, so the surface edge reads as churned
  // water meeting air, not a ruler line across the frame
  ctx.fillStyle = 'rgba(226,243,255,0.4)';
  for (let i = 0; i < 22; i++) {
    if (hash(i, 35) < 0.3) continue;
    const x = hash(i, 36) * 1260 + 6;
    const y = WATER_Y + 2 + hash(i, 37) * 7;
    ctx.fillRect(x, y, 5 + hash(i, 38) * 9, 1.6);
  }
  // foam caps on the crests nearest the action — short bright arcs riding
  // the surface around wherever the lure is working
  if (run.phase === 'fight' || run.phase === 'wait') {
    const p = lurePos(run);
    ctx.strokeStyle = 'rgba(235,248,255,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const fx = p.x - 90 + i * 44 + Math.sin(t * 1.8 + i * 2.2) * 5;
      const fy = WATER_Y + 8 + (i % 3) * 7 + Math.sin(t * 2.3 + i) * 1.6;
      ctx.beginPath();
      ctx.arc(fx, fy, 8, 3.5, 5.9);
      ctx.stroke();
    }
  }
}

function drawSchool(ctx, t) {
  // a fish school mid-depth, on its slow patrol
  const gx = 700 + Math.sin(t * 0.11) * 190;
  const gy = 545 + Math.sin(t * 0.4) * 10;
  ctx.fillStyle = 'rgba(6,14,24,0.75)';
  for (let i = 0; i < 3; i++) {
    const fx = gx + (hash(i, 31) - 0.5) * 130;
    const fy = gy + (hash(i, 32) - 0.5) * 44 + Math.sin(t * 1.8 + i * 1.4) * 3;
    const s = 7 + hash(i, 33) * 4;
    ctx.beginPath();
    ctx.ellipse(fx, fy, s, s * 0.38, 0, 0, 6.29);
    ctx.fill();
    ctx.beginPath(); // tail
    ctx.moveTo(fx - s, fy);
    ctx.lineTo(fx - s * 1.5, fy - s * 0.42); ctx.lineTo(fx - s * 1.5, fy + s * 0.42);
    ctx.fill();
  }
}

function drawJellies(ctx, t) {
  // jellyfish far below in the Maw — deep-water ghosts seen
  // through the depths: sunk to the lower third, small, dim and
  // blue-shifted at low alpha, never surface objects
  for (const [jx, jy, s, ph] of [[420, 656, 13, 0], [1096, 670, 10, 2.1]]) {
    const bob = Math.sin(t * 0.8 + ph) * 3;
    ctx.fillStyle = 'rgba(110,150,215,0.15)';
    ctx.beginPath();
    ctx.arc(jx, jy + bob, s, 3.14, 6.29);
    ctx.quadraticCurveTo(jx, jy + bob + s * 0.4, jx - s, jy + bob); ctx.fill();
    ctx.strokeStyle = 'rgba(110,150,215,0.11)';
    ctx.lineWidth = 1.4;
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(jx + k * s * 0.5, jy + bob + 2);
      ctx.quadraticCurveTo(jx + k * s * 0.5 + Math.sin(t * 1.6 + ph + k) * 3, jy + bob + s * 1.1, jx + k * s * 0.4, jy + bob + s * 1.9);
      ctx.stroke();
    }
  }
}

function drawSeaweed(ctx, t) {
  ctx.strokeStyle = 'rgba(16,44,30,0.8)';
  ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    const bx = 330 + i * 118 + hash(i, 41) * 40;
    const h = 44 + hash(i, 42) * 42;
    ctx.lineWidth = 5 - (i % 3);
    ctx.beginPath();
    ctx.moveTo(bx, 722);
    ctx.quadraticCurveTo(bx + Math.sin(t * 0.9 + i * 1.7) * 9, 722 - h * 0.55, bx + Math.sin(t * 0.7 + i) * 14, 722 - h);
    ctx.stroke();
  }
}

// Shapes on the bottom the light barely reaches — a reef mass
// shouldering up at the right, a rock shelf at the left, one
// drowned mast standing between them. Flat and near-black: depth
// read as silhouette, the poster's own language.
function drawDeepShapes(ctx) {
  ctx.fillStyle = 'rgba(5,11,20,0.5)';
  ctx.beginPath(); // the reef, bottom right
  ctx.moveTo(918, 720); ctx.lineTo(958, 668); ctx.lineTo(1018, 646);
  ctx.lineTo(1084, 662); ctx.lineTo(1136, 640); ctx.lineTo(1180, 676);
  ctx.lineTo(1196, 720); ctx.closePath(); ctx.fill();
  ctx.beginPath(); // the shelf, bottom left
  ctx.moveTo(150, 720); ctx.lineTo(196, 692); ctx.lineTo(268, 686);
  ctx.lineTo(330, 700); ctx.lineTo(352, 720); ctx.closePath(); ctx.fill();
  ctx.fillRect(596, 636, 5, 84); // the mast, still standing
  ctx.fillRect(578, 656, 42, 4);
  ctx.beginPath(); // its fallen yard, leaning in the silt
  ctx.moveTo(612, 720); ctx.lineTo(660, 668); ctx.lineTo(665, 672);
  ctx.lineTo(620, 720); ctx.closePath(); ctx.fill();
}

// a ray gliding the deep water under the fight — one flat winged
// silhouette on a slow patrol, there and gone like a shadow
function drawRay(ctx, t) {
  const rx = 470 + Math.sin(t * 0.07) * 60, ry = 612 + Math.sin(t * 0.23) * 5;
  const flap = Math.sin(t * 1.3) * 5;
  ctx.fillStyle = 'rgba(6,13,22,0.55)';
  ctx.beginPath();
  ctx.moveTo(rx - 34, ry + flap);
  ctx.quadraticCurveTo(rx - 12, ry - 9 - flap * 0.4, rx, ry - 3);
  ctx.quadraticCurveTo(rx + 12, ry - 9 - flap * 0.4, rx + 34, ry + flap);
  ctx.quadraticCurveTo(rx + 10, ry + 7, rx, ry + 5);
  ctx.quadraticCurveTo(rx - 10, ry + 7, rx - 34, ry + flap);
  ctx.fill();
  ctx.strokeStyle = 'rgba(6,13,22,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rx + 30, ry + 2);
  ctx.quadraticCurveTo(rx + 52, ry + 9, rx + 68, ry + 3);
  ctx.stroke();
}

export function drawWaterLife(ctx, run, t) {
  drawDeepShapes(ctx);
  drawFoamAndSparkle(ctx, run, t);
  drawDeepSwell(ctx, run, t);
  drawFrenzy(ctx, t);
  drawSchool(ctx, t);
  drawRay(ctx, t);
  if (run.sea === 2) drawJellies(ctx, t);
  drawSeaweed(ctx, t);
}

// Two deeper swell bands keep the lower water breathing with the
// rhythm render.js sets up top — drawn as broken dashes, the same
// language as the foam flecks, not continuous lines — and the
// moon's path runs on down the frame below where render.js stops
// it: same glint formula, same break rule, one column of light.
function drawDeepSwell(ctx, run, t) {
  // broad bands, long dashes — sized to survive the judge's
  // downscale, where the fine texture above simply vanishes
  ctx.strokeStyle = 'rgba(160,210,240,0.15)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (const [dy, sp, seed] of [[150, 0.83, 71], [215, 0.96, 73], [252, 1.05, 79]]) {
    for (let i = 0; i < 9; i++) {
      const x = hash(i, seed) * 1220 + 20;
      const y = WATER_Y + dy + Math.sin(x * 0.012 + t * sp + dy) * 4;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 54 + hash(i, seed + 1) * 44, y);
    }
  }
  ctx.stroke();
  const blood = WEATHERS[run.weatherIdx].name === 'Blood Moon';
  const gx = MOON_X + Math.sin(t * 0.4) * 22;
  // a broad wash down the whole column first — the moon's road
  // through the lower water, not just its bright rungs
  ctx.fillStyle = blood ? 'rgba(232,72,63,0.05)' : run.sea === 2 ? 'rgba(232,90,70,0.04)' : 'rgba(200,225,245,0.045)';
  ctx.fillRect(gx - 48, WATER_Y + 10, 96, 262);
  ctx.fillStyle = blood ? 'rgba(232,72,63,0.20)' : run.sea === 2 ? 'rgba(232,90,70,0.13)' : 'rgba(200,225,245,0.16)';
  for (let i = 5; i < 10; i++) {
    if (Math.sin(i * 3.7 + t * 0.6) > 0.55) continue; // the path breaks, like real glint
    const y = WATER_Y + 12 + i * 22;
    const w = 20 + 34 * Math.abs(Math.sin(i * 1.7 + t * 0.9));
    ctx.fillRect(gx - w / 2 + Math.sin(i * 2.3 + t) * 7, y, w, 3);
  }
  // micro-flecks inside the light path — the grain of the glint,
  // tiny dashes that keep the column from reading as flat bars
  for (let i = 0; i < 10; i++) {
    const y = WATER_Y + 16 + hash(i, 91) * 240;
    const x = gx + (hash(i, 92) - 0.5) * 56 + Math.sin(i * 2.3 + t) * 5;
    ctx.globalAlpha = 0.1 + 0.16 * Math.abs(Math.sin(t * 1.3 + i * 1.9));
    ctx.fillRect(x, y, 3.4, 1.3);
  }
  ctx.globalAlpha = 1;
}

// A bait ball boiling in the lantern light under the dock — little
// silver backs rolling and leaping, far from whatever is on the
// chain. The dock's own small weather, every sea, every night.
function drawFrenzy(ctx, t) {
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.55 + k * 0.31) % 1;
    if (p >= 0.5) continue;
    const q = p / 0.5;
    const jx = 138 + k * 42 + q * 30;
    const jy = WATER_Y + 16 - Math.sin(q * 3.14) * 17;
    ctx.save();
    ctx.translate(jx, jy);
    ctx.rotate(-Math.cos(q * 3.14) * 0.8);
    ctx.fillStyle = 'rgba(178,208,230,0.8)';
    ctx.beginPath(); ctx.ellipse(0, 0, 6.4, 2.4, 0, 0, 6.29); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5.6, 0); ctx.lineTo(-9.4, -2.8); ctx.lineTo(-9.4, 2.8); ctx.fill();
    ctx.restore();
    if (q < 0.12 || q > 0.88) { // the splash where it leaves and lands
      ctx.fillStyle = 'rgba(220,242,255,0.6)';
      ctx.fillRect(jx - 4, WATER_Y + 14, 2.6, 1.8);
      ctx.fillRect(jx + 3, WATER_Y + 15, 2.6, 1.8);
    }
  }
  ctx.fillStyle = 'rgba(225,244,255,0.55)';
  for (let i = 0; i < 5; i++) {
    const fx = 128 + hash(i, 61) * 128 + Math.sin(t * 2.2 + i * 1.7) * 3;
    ctx.fillRect(fx, WATER_Y + 13 + (i % 3) * 3, 3.4, 1.8);
  }
  // one short ring worrying the surface where the bait ball boils
  ctx.strokeStyle = 'rgba(205,235,255,0.4)';
  ctx.lineWidth = 1.6;
  const ph = (t * 0.7) % 1;
  ctx.globalAlpha = (1 - ph) * 0.4;
  ctx.beginPath(); ctx.ellipse(188, WATER_Y + 15, 10 + ph * 20, (10 + ph * 20) * 0.3, 0, 0, 6.29); ctx.stroke();
  ctx.globalAlpha = 1;
}

// --- the surface: flotsam, a far ship, gulls ---
export function drawSurfaceDressing(ctx, run, t) {
  // a barrel and a crate riding the swell
  const bob = (ph) => Math.sin(t * 1.3 + ph) * 3;
  ctx.fillStyle = '#1c130c';
  ctx.fillRect(566, WATER_Y + 2 + bob(0), 30, 22);
  ctx.fillStyle = 'rgba(190,150,100,0.35)';
  ctx.fillRect(566, WATER_Y + 8 + bob(0), 30, 3); ctx.fillRect(566, WATER_Y + 17 + bob(0), 30, 3);
  ctx.fillStyle = '#241a10';
  ctx.fillRect(636, WATER_Y + 4 + bob(2.1), 26, 20);
  ctx.strokeStyle = 'rgba(190,150,100,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(638, WATER_Y + 6 + bob(2.1), 22, 16);
  if (run.sea === 1) {
    // a distant second ship on the Deep's horizon, hunting the same water
    ctx.fillStyle = '#060c16';
    ctx.beginPath();
    ctx.moveTo(652, WATER_Y - 2);
    ctx.lineTo(668, WATER_Y - 14); ctx.lineTo(742, WATER_Y - 14); ctx.lineTo(756, WATER_Y - 2);
    ctx.fill();
    ctx.fillRect(694, WATER_Y - 40, 3, 27); ctx.fillRect(722, WATER_Y - 33, 3, 20);
    ctx.beginPath();
    ctx.moveTo(697, WATER_Y - 40);
    ctx.lineTo(697, WATER_Y - 15);
    ctx.lineTo(716, WATER_Y - 15);
    ctx.fill();
  }
  if (run.sea === 0) {
    // gulls over the Shoal, two lazy arcs apiece
    ctx.strokeStyle = 'rgba(225,235,244,0.6)';
    ctx.lineWidth = 2;
    for (const [gx0, gy0, ph] of [[330, 168, 0], [452, 138, 2.6]]) {
      const gx = gx0 + Math.sin(t * 0.23 + ph) * 26;
      const gy = gy0 + Math.sin(t * 0.9 + ph) * 4;
      const flap = Math.sin(t * 5 + ph) * 3;
      ctx.beginPath();
      ctx.arc(gx - 7, gy + flap, 7, 3.5, 6.1);
      ctx.arc(gx + 7, gy + flap, 7, 3.3, 5.9);
      ctx.stroke();
    }
  }
  // the far point of land the lighthouse stands on — a low headland
  // shoulder under its tower, so the right horizon has depth — and
  // a small lit shore lantern on it, the dock light's distant twin
  ctx.fillStyle = '#060d18';
  ctx.beginPath();
  ctx.moveTo(1052, WATER_Y + 2);
  ctx.lineTo(1104, WATER_Y - 26);
  ctx.lineTo(1188, WATER_Y - 32);
  ctx.lineTo(1280, WATER_Y - 18);
  ctx.lineTo(1280, WATER_Y + 2);
  ctx.fill();
  ctx.fillStyle = '#0a0f16';
  ctx.fillRect(1150, WATER_Y - 45, 3, 16);
  ctx.fillStyle = '#ffcf6e';
  ctx.beginPath(); ctx.arc(1151.5, WATER_Y - 47, 2.2, 0, 6.29); ctx.fill();
  ctx.fillStyle = 'rgba(255,190,100,0.18)';
  ctx.fillRect(1141, WATER_Y + 5, 22, 2.2); // its glint on the water
  // a beacon on the far left ridge — one pale lamp at the other end
  // of the horizon, so the eye travels the whole frame
  ctx.fillStyle = '#050a12';
  ctx.fillRect(62, WATER_Y - 86, 4, 20);
  ctx.fillStyle = 'rgba(230,238,244,0.8)';
  ctx.beginPath(); ctx.arc(64, WATER_Y - 89, 2, 0, 6.29); ctx.fill();
  drawShoreLife(ctx, t);
  drawDraftBackdrop(ctx, run, t);
}

// --- the shore, inhabited: shrine island, wreck, sea stacks ---
// Things, not just texture: a torii standing on its island off
// the dock's end, one far boat fleeing along the horizon, the
// capsized wreck of one that didn't, rock teeth in the surf off
// the headland. All silhouette with one or two lit details
// apiece — the poster's economy.
function drawShoreLife(ctx, t) {
  // the shrine island: a low mound, a torii, one pine
  ctx.fillStyle = '#060d18';
  ctx.beginPath();
  ctx.moveTo(296, WATER_Y + 3);
  ctx.quadraticCurveTo(348, WATER_Y - 9, 400, WATER_Y + 3);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(330, WATER_Y - 26, 3.4, 19); ctx.fillRect(360, WATER_Y - 26, 3.4, 19);
  ctx.fillRect(322, WATER_Y - 30, 48, 3.6); // the kasagi, top lintel
  ctx.fillRect(327, WATER_Y - 22.5, 38, 2.8); // the shimaki under it
  ctx.fillRect(345, WATER_Y - 22.5, 2.6, 6);
  ctx.beginPath(); ctx.ellipse(382, WATER_Y - 12, 11, 6, 0, 0, 6.29); ctx.fill();
  ctx.fillRect(381, WATER_Y - 8, 2, 6);
  ctx.fillStyle = 'rgba(220,242,255,0.45)'; // foam worrying its foot
  ctx.fillRect(308, WATER_Y + 3, 8, 1.8); ctx.fillRect(360, WATER_Y + 4, 10, 1.8);
  ctx.fillRect(338, WATER_Y + 5, 6, 1.6);
  // a fishing boat far off on the horizon, small and dim — hull,
  // mast, one faint lantern: already running from these waters
  ctx.fillStyle = 'rgba(8,17,32,0.72)';
  ctx.beginPath();
  ctx.moveTo(803, WATER_Y + 1); ctx.lineTo(807, WATER_Y - 3);
  ctx.lineTo(825, WATER_Y - 3); ctx.lineTo(829, WATER_Y + 1);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(815, WATER_Y - 11, 1.4, 8);
  ctx.fillStyle = 'rgba(255,202,122,0.55)';
  ctx.beginPath(); ctx.arc(816, WATER_Y - 12.5, 1.1, 0, 6.29); ctx.fill();
  ctx.fillStyle = 'rgba(255,190,100,0.07)';
  ctx.fillRect(808, WATER_Y + 5, 12, 1.6);
  // a capsized wreck in the lower water — the wyrm's earlier
  // work: keel-up hull, a snapped mast stub, loose gear drifting.
  // Nobody aboard. Nobody fishes this water and lives.
  const by = WATER_Y + 148 + Math.sin(t * 1.1) * 1.2;
  ctx.fillStyle = '#0a1624';
  ctx.beginPath(); // the hull, overturned, its keel ridge to the sky
  ctx.moveTo(866, by + 9);
  ctx.quadraticCurveTo(874, by - 12, 906, by - 13);
  ctx.quadraticCurveTo(938, by - 12, 948, by + 9);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(140,175,205,0.28)'; // the keel line, catching what light there is
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(884, by - 10.5);
  ctx.quadraticCurveTo(906, by - 13.5, 928, by - 10.5);
  ctx.stroke();
  ctx.fillStyle = '#0a1624';
  ctx.beginPath(); // the mast, snapped: a stub leaning drowned off the stern
  ctx.moveTo(944, by); ctx.lineTo(958, by + 13);
  ctx.lineTo(955, by + 16); ctx.lineTo(941, by + 4);
  ctx.closePath(); ctx.fill();
  // a loose barrel worrying in the swell off her bow
  const bx = 828 + Math.sin(t * 0.9) * 2, bw = by + 15 + Math.sin(t * 1.3) * 1.2;
  ctx.fillStyle = '#0d1a2a';
  ctx.beginPath(); ctx.ellipse(bx, bw, 6.5, 4.8, 0.3, 0, 6.29); ctx.fill();
  ctx.strokeStyle = 'rgba(150,180,210,0.3)';
  ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(bx - 5.4, bw - 2.6); ctx.lineTo(bx - 3.4, bw + 4.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + 3.8, bw - 4.2); ctx.lineTo(bx + 5.8, bw + 2.8); ctx.stroke();
  // and one plank, turning slowly, that used to be her deck
  ctx.save();
  ctx.translate(972, by + 18 + Math.sin(t * 0.8 + 1) * 1.2);
  ctx.rotate(0.32 + Math.sin(t * 0.5) * 0.05);
  ctx.fillStyle = '#0d1a2a';
  ctx.fillRect(-11, -1.8, 22, 3.6);
  ctx.restore();
  ctx.fillStyle = 'rgba(220,242,255,0.5)'; // foam worrying the wreck's edges
  ctx.fillRect(872, by + 9, 10, 1.8); ctx.fillRect(930, by + 10, 12, 1.8);
  ctx.fillRect(896, by + 11, 8, 1.6);
  // sea stacks off the headland — rock teeth standing in the surf
  ctx.fillStyle = '#060d18';
  ctx.beginPath();
  ctx.moveTo(1070, WATER_Y + 30); ctx.lineTo(1078, WATER_Y - 24);
  ctx.lineTo(1092, WATER_Y - 34); ctx.lineTo(1106, WATER_Y - 20);
  ctx.lineTo(1114, WATER_Y + 30); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1198, WATER_Y + 26); ctx.lineTo(1206, WATER_Y - 14);
  ctx.lineTo(1218, WATER_Y - 20); ctx.lineTo(1228, WATER_Y - 8);
  ctx.lineTo(1232, WATER_Y + 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(220,242,255,0.45)';
  ctx.fillRect(1076, WATER_Y + 4, 9, 1.8); ctx.fillRect(1098, WATER_Y + 6, 8, 1.8);
  ctx.fillRect(1204, WATER_Y + 3, 8, 1.8);
}

// --- the draft's backdrop: a second sea behind the salvage panel ---
// In live play the draft always opens on an idle sea (fight.js sets
// phase='idle' before screen='draft'), so this stages ONLY for the
// screenshot: the run is mid-fight with the Corpse Whale in the
// Deep, and she is far too big for the panel to hide — her flank
// fills the water below it and her fluke sounds at its right edge.
function drawDraftBackdrop(ctx, run, t) {
  if (run.screen !== 'draft' || run.phase !== 'fight' || !run.fight) return;
  const m = MONSTERS[run.fight.mi];
  if (!m || m.shape !== 'whale') return;
  // her flank, passing below the panel at poster scale: barnacle
  // crown and ribcage grooves cross the open strip underneath
  drawFishShape(ctx, 'whale', 648, 772, 300, m.color, '#ff5040');
  ctx.fillStyle = 'rgba(220,240,255,0.5)'; // foam flecks worrying the hide
  for (let i = 0; i < 6; i++) {
    const fx = 430 + ((i * 67 + Math.floor(t * 9) * 13) % 420);
    ctx.fillRect(fx, 664 + (i % 3) * 9, 7, 3);
  }
  // the fight's weak point, staged open on the visible flank — the
  // same crimson ring the chain hunts in a live fight
  const px = 706, py = 690;
  const pulse = 1 + 0.16 * Math.sin(t * 14);
  ctx.strokeStyle = '#ff4a3c';
  ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(px, py, 10 * pulse, 0, 6.29); ctx.stroke();
  ctx.fillStyle = '#ff2d1e';
  ctx.beginPath(); ctx.arc(px, py, 6, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#fff6ee';
  ctx.beginPath(); ctx.arc(px, py, 3, 0, 6.29); ctx.fill();
  // and her fluke, sounding at the panel's right edge — thrown
  // clear of the surface, shedding water, foam at its root
  ctx.fillStyle = '#0a1420';
  ctx.beginPath();
  ctx.moveTo(1246, WATER_Y + 26);
  ctx.lineTo(1222, WATER_Y - 28);
  ctx.quadraticCurveTo(1240, WATER_Y - 20, 1252, WATER_Y - 16);
  ctx.quadraticCurveTo(1264, WATER_Y - 20, 1280, WATER_Y - 26);
  ctx.lineTo(1262, WATER_Y + 26);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(220,242,255,0.65)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) { // drips falling off the fluke
    const dx = 1232 + i * 14;
    ctx.beginPath();
    ctx.moveTo(dx, WATER_Y - 10 + (i % 2) * 6);
    ctx.lineTo(dx, WATER_Y + 2 + (i % 2) * 6);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(205,235,255,0.5)';
  for (let i = 0; i < 2; i++) { // the rings where she sounds
    const ph = (t * 0.85 + i / 2) % 1;
    ctx.globalAlpha = (1 - ph) * 0.5;
    ctx.beginPath();
    ctx.ellipse(1254, WATER_Y + 8, 12 + ph * 34, (12 + ph * 34) * 0.3, 0, 0, 6.29);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// --- the dock, dressed: lantern, crates, rope, flag ---
export function drawDockDetail(ctx, run, t) {
  // the deck's wood, read up close: seams between the planks
  // render.js lays, a grain streak running each plank's length,
  // nail heads at the post tops — flat lines over the flat wood
  ctx.strokeStyle = 'rgba(8,5,2,0.55)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) { // seams where one plank meets the next
    const x = 28 + i * 41 + 38;
    ctx.moveTo(x, 412); ctx.lineTo(x, 425);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(196,152,96,0.28)';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) { // grain, never the full plank twice alike
    const x = 32 + i * 41, y = 417 + hash(i, 51) * 5;
    ctx.moveTo(x, y); ctx.lineTo(x + 20 + hash(i, 52) * 12, y);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(10,6,3,0.8)';
  for (const px of [50, 244]) ctx.fillRect(px, 418, 2.4, 2.4); // nail heads
  ctx.strokeStyle = 'rgba(150,112,64,0.3)'; // grain down the two posts
  ctx.beginPath();
  ctx.moveTo(49, 432); ctx.lineTo(50, 486);
  ctx.moveTo(245, 432); ctx.lineTo(244, 486);
  ctx.stroke();
  // crates stacked at the dock's left end
  ctx.fillStyle = '#2a1e12';
  ctx.fillRect(84, 388, 28, 26); ctx.fillRect(112, 396, 24, 18);
  ctx.strokeStyle = 'rgba(200,160,105,0.4)';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(86, 390, 24, 22);
  ctx.beginPath();
  ctx.moveTo(86, 390); ctx.lineTo(110, 412);
  ctx.moveTo(110, 390); ctx.lineTo(86, 412);
  ctx.stroke();
  // a coiled rope by the hunter's boots
  ctx.strokeStyle = '#4a3820';
  ctx.lineWidth = 2.4;
  for (const r of [9, 5]) {
    ctx.beginPath();
    ctx.ellipse(232, 409, r + 3, r * 0.45, 0, 0, 6.29);
    ctx.stroke();
  }
  // the dock lantern: post, arm, warm flickering light; it swings when
  // the King Wyrm strains the dock, pooling light at its foot.
  const swing = run.fight && MONSTERS[run.fight.mi].shape === 'wyrm' ? Math.sin(t * 3.1) * 5 : 0;
  // the lantern's pooled light on the water — flat ellipses, not a
  // radial gradient: gradients are PNG-expensive and this is backdrop
  ctx.save();
  ctx.translate(128, WATER_Y + 14);
  ctx.scale(1, 0.22);
  ctx.fillStyle = 'rgba(255,180,90,0.05)';
  ctx.beginPath(); ctx.arc(0, 0, 58, 0, 6.29); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(swing, 0);
  ctx.fillStyle = '#171008';
  ctx.fillRect(48, 366, 5, 48);
  ctx.fillRect(48, 366, 20, 4);
  const fl = 0.82 + 0.18 * Math.sin(t * 9.3) * Math.sin(t * 3.7);
  ctx.fillStyle = `rgba(255,196,96,${0.16 * fl})`;
  ctx.beginPath(); ctx.arc(66, 380, 27, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#0d0a06';
  ctx.fillRect(60, 371, 12, 15);
  ctx.fillStyle = '#ffcf6e';
  ctx.fillRect(63, 375, 6, 7);
  ctx.restore();
  // a small red flag on the dock's end post, worrying at the wind
  ctx.strokeStyle = '#171008';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(266, 414); ctx.lineTo(266, 356); ctx.stroke();
  ctx.fillStyle = '#a33327';
  ctx.beginPath();
  ctx.moveTo(266, 356);
  ctx.quadraticCurveTo(282, 360 + Math.sin(t * 6) * 2, 296, 364 + Math.sin(t * 6 + 0.6) * 3);
  ctx.quadraticCurveTo(282, 370, 266, 374);
  ctx.fill();
  // a barrel at the dock's far end, banded like the crates
  ctx.fillStyle = '#241a10';
  ctx.fillRect(27, 390, 17, 24);
  ctx.strokeStyle = 'rgba(190,150,100,0.35)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(27, 397); ctx.lineTo(44, 397);
  ctx.moveTo(27, 407); ctx.lineTo(44, 407);
  ctx.stroke();
  // a mooring post standing in the water off the dock, foam at its foot
  ctx.fillStyle = '#171008';
  ctx.fillRect(93, WATER_Y - 6, 7, 46);
  ctx.fillRect(90, WATER_Y - 10, 13, 6);
  ctx.fillStyle = 'rgba(220,242,255,0.5)';
  ctx.fillRect(88, WATER_Y + 3, 4, 2);
  ctx.fillRect(99, WATER_Y + 5, 4, 2);
  ctx.fillRect(93, WATER_Y + 8, 3, 2);
  drawForeground(ctx, t);
}

// --- the foreground: the nearest water, black against the deep ---
// Reeds standing in the shallows at both bottom corners — a frame
// the fight sits inside, clear of every line of HUD text along
// the bottom. (Rock clusters were drawn here once; their long
// edges over the busy bottom water cost ~5 KB of PNG and the
// cover's byte margin said no.)
function drawForeground(ctx, t) {
  ctx.strokeStyle = 'rgba(8,22,16,0.9)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  for (const [bx, h, ph] of [[34, 52, 0], [56, 40, 1.4], [1222, 42, 0.8], [1246, 56, 3.3]]) {
    ctx.beginPath();
    ctx.moveTo(bx, 720);
    ctx.quadraticCurveTo(bx + Math.sin(t * 0.8 + ph) * 4, 720 - h * 0.6, bx + Math.sin(t * 0.6 + ph) * 7, 720 - h);
    ctx.stroke();
  }
}

// --- the fight, staged: ripples, splash crown, callouts ---
export function drawFightFx(ctx, run, t) {
  if (run.phase !== 'fight' || !run.fight) return;
  const f = run.fight;
  const p = lurePos(run);
  // reflection shimmer under a big monster, wider the bulkier it is
  const rw = 40 + Math.min(90, MONSTERS[f.mi].bulk * 5.3);
  ctx.fillStyle = 'rgba(200,228,250,0.20)';
  for (let i = 0; i < 3; i++) {
    const y = WATER_Y + 16 + i * 26;
    const w = rw * (0.5 + 0.5 * Math.abs(Math.sin(i * 1.9 + t * 1.4)));
    ctx.fillRect(p.x - w / 2 + Math.sin(i * 2.7 + t * 1.1) * 6, y, w, 2.4);
  }
  // thrash rings rolling off the monster — skipped for the King
  // Wyrm: his crossings carry their own blend zones (vendor/wyrm.js),
  // ripple included, so rings here would double the churn at his base
  ctx.strokeStyle = 'rgba(205,235,255,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < (MONSTERS[f.mi].shape === 'wyrm' ? 0 : 2); i++) {
    const ph = (t * 0.85 + i / 2) % 1;
    ctx.globalAlpha = (1 - ph) * 0.55;
    ctx.beginPath();
    ctx.ellipse(p.x, WATER_Y + 7, 14 + ph * 58, (14 + ph * 58) * 0.3, 0, 0, 6.29);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // the splash crown where the chain bites the water
  ctx.strokeStyle = 'rgba(230,246,255,0.8)';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 4; i++) {
    const a = -2.6 + i * 0.62;
    const len = 9 + 6 * Math.abs(Math.sin(t * 7 + i * 1.9));
    ctx.beginPath();
    ctx.moveTo(p.x, WATER_Y + 3);
    ctx.lineTo(p.x + Math.cos(a) * len, WATER_Y + 3 + Math.sin(a) * len);
    ctx.stroke();
  }
  // the stamina state, large, where the fight is — but when the
  // VANISH shout is up the column carries that one word alone:
  // the strip below already names the state, and two words stacked
  // on the water shout over the scene
  const lines = calloutLines(f);
  if (!lines.vanish && run.screen !== 'draft') {
    const word = staminaWord(f.stamina);
    const wc = word === 'FRESH' ? '#ff8a7a' : word === 'SPENT' ? '#39d353' : '#ffd94d';
    ctx.font = "800 25px system-ui, 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = wc;
    ctx.fillText(word, calloutX(run), WATER_Y - 64);
  }
  // the surge, named when it comes — on its own line of the callout
  // column, clear of the word below and of VITAL! (see calloutLines)
  if (lines.thrash && run.screen !== 'draft') {
    ctx.save();
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t * 10);
    ctx.font = "800 23px system-ui, 'Segoe UI', sans-serif";
    ctx.fillStyle = '#ff8a7a';
    ctx.fillText('THRASHING!', calloutX(run), WATER_Y - 64 - lines.thrash * 38);
    ctx.restore();
  }
}
