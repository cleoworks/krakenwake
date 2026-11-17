// scenery.js — one job: density. Everything render.js had no room for —
// a busier sky, a third water texture, life under and on the surface, a
// dressed dock, and the theatre around a fight. All placed from fixed
// hashes plus the frame clock, so every screenshot agrees.
import { staminaWord, calloutLines } from '../fight.js';
import { MONSTERS } from '../data.js';
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
}

// --- the water: foam, sparkle, and everything living in it ---
function drawFoamAndSparkle(ctx, run, t) {
  // drifting foam flecks, short pale dashes riding the swell leftward
  ctx.strokeStyle = 'rgba(215,238,252,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
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
  drawSchool(ctx, t);
  if (run.sea === 2) drawJellies(ctx, t);
  drawSeaweed(ctx, t);
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
  // thrash rings rolling off the monster
  ctx.strokeStyle = 'rgba(205,235,255,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 2; i++) {
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
