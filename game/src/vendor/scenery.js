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
  for (let i = 0; i < 8; i++) {
    const x = hash(i, 11) * 1280;
    const y = 8 + hash(i, 12) * 330;
    if (Math.hypot(x - MOON_X, y - MOON_Y) < 78) continue;
    ctx.globalAlpha = 0.12 + 0.3 * Math.abs(Math.sin(t * 0.5 + i * 2.3));
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;
  // cloud silhouettes: flat dark banks sitting on the sky bands,
  // placed in the open sky the staging leaves bare — left of the
  // moon, right of the banner's column, low under the moon. Never
  // on the moon, the callout column or a panel.
  ctx.fillStyle = 'rgba(10,16,30,0.55)';
  const bank = (cx, cy, s) => {
    for (const [dx, dy, rx, ry] of [[-38, 3, 40, 8], [0, -3, 54, 11], [40, 3, 34, 7]]) {
      ctx.beginPath();
      ctx.ellipse(cx + dx * s, cy + dy * s, rx * s, ry * s, 0, 0, 6.29);
      ctx.fill();
    }
  };
  bank(118, 148, 0.9); // high left, under the goal bar, clear of the moon
  bank(872, 164, 1.05); // right of the banner column, left of the haul panel
  bank(404, 304, 0.8); // low under the moon, clear of the callouts
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
  for (let i = 0; i < 5; i++) {
    const x = ((hash(i, 21) * 1340 - t * (9 + hash(i, 22) * 14)) % 1340 + 1340) % 1340 - 30;
    const y = WATER_Y + 18 + hash(i, 23) * 240;
    ctx.moveTo(x, y);
    ctx.lineTo(x + 7 + hash(i, 24) * 9, y);
  }
  ctx.stroke();
  // the third texture layer: fine sparkle, denser and smaller than dressing's
  ctx.fillStyle = '#e8f4ff';
  for (let i = 0; i < 2; i++) {
    const x = hash(i, 25) * 1280;
    const y = WATER_Y + 10 + hash(i, 26) * 268;
    ctx.globalAlpha = 0.03 + 0.1 * Math.abs(Math.sin(t * 1.7 + i * 2.9));
    ctx.fillRect(x, y, 1.7, 1.2);
  }
  ctx.globalAlpha = 1;
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
  // one jellyfish keeping station in the Maw — flat shapes only (a
  // glow disc costs real PNG bytes), the bell and falls drawn plain
  for (const [jx, jy, s, ph] of [[420, 585, 21, 0]]) {
    const bob = Math.sin(t * 0.8 + ph) * 6;
    ctx.fillStyle = 'rgba(196,178,255,0.5)';
    ctx.beginPath();
    ctx.arc(jx, jy + bob, s, 3.14, 6.29);
    ctx.quadraticCurveTo(jx, jy + bob + s * 0.4, jx - s, jy + bob); ctx.fill();
    ctx.strokeStyle = 'rgba(196,178,255,0.4)';
    ctx.lineWidth = 2;
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(jx + k * s * 0.5, jy + bob + 2);
      ctx.quadraticCurveTo(jx + k * s * 0.5 + Math.sin(t * 1.6 + ph + k) * 5, jy + bob + s * 1.1, jx + k * s * 0.4, jy + bob + s * 1.9);
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

export function drawWaterLife(ctx, run, t) {
  drawFoamAndSparkle(ctx, run, t);
  drawDeepSwell(ctx, run, t);
  drawFrenzy(ctx, t);
  drawSchool(ctx, t);
  if (run.sea === 2) drawJellies(ctx, t);
  drawSeaweed(ctx, t);
}

// Two deeper swell bands keep the lower water breathing with the
// rhythm render.js sets up top — drawn as broken dashes, the same
// language as the foam flecks, not continuous lines — and the
// moon's path runs on down the frame below where render.js stops
// it: same glint formula, same break rule, one column of light.
function drawDeepSwell(ctx, run, t) {
  ctx.strokeStyle = 'rgba(160,210,240,0.13)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const [dy, sp, seed] of [[150, 0.83, 71], [215, 0.96, 73]]) {
    for (let i = 0; i < 9; i++) {
      const x = hash(i, seed) * 1220 + 20;
      const y = WATER_Y + dy + Math.sin(x * 0.012 + t * sp + dy) * 4;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 26 + hash(i, seed + 1) * 20, y);
    }
  }
  ctx.stroke();
  const blood = WEATHERS[run.weatherIdx].name === 'Blood Moon';
  const gx = MOON_X + Math.sin(t * 0.4) * 22;
  ctx.fillStyle = blood ? 'rgba(232,72,63,0.20)' : run.sea === 2 ? 'rgba(232,90,70,0.13)' : 'rgba(200,225,245,0.16)';
  for (let i = 5; i < 7; i++) {
    if (Math.sin(i * 3.7 + t * 0.6) > 0.55) continue; // the path breaks, like real glint
    const y = WATER_Y + 12 + i * 22;
    const w = 14 + 26 * Math.abs(Math.sin(i * 1.7 + t * 0.9));
    ctx.fillRect(gx - w / 2 + Math.sin(i * 2.3 + t) * 7, y, w, 3);
  }
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
  drawDraftBackdrop(ctx, run, t);
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
  // the stamina state, large, where the fight is
  const word = staminaWord(f.stamina);
  const wc = word === 'FRESH' ? '#ff8a7a' : word === 'SPENT' ? '#39d353' : '#ffd94d';
  ctx.font = "800 25px system-ui, 'Segoe UI', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = wc;
  ctx.fillText(word, calloutX(run), WATER_Y - 64);
  // the surge, named when it comes — on its own line of the callout
  // column, clear of the word below and of VITAL! (see calloutLines)
  const lines = calloutLines(f);
  if (lines.thrash) {
    ctx.save();
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t * 10);
    ctx.font = "800 23px system-ui, 'Segoe UI', sans-serif";
    ctx.fillStyle = '#ff8a7a';
    ctx.fillText('THRASHING!', calloutX(run), WATER_Y - 64 - lines.thrash * 38);
    ctx.restore();
  }
}
