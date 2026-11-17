// render.js — all world and monster drawing: night gradients, a moon over
// black water, a hunter whose harpoon pole bends under load. Pure canvas.
import { LOCATIONS } from './data.js';

export const WATER_Y = 428;
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

export function bobberX(run) { return 300 + run.castPower * 560; }
export function fishX(run) { return 250 + (run.cur?.dist ?? 30) * 8.6; }

// Tentacles: thick tapered strokes curling up out of the water.
function tentacle(ctx, x, y, len, curl, wdt, color) {
  ctx.strokeStyle = color; ctx.lineWidth = wdt; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + curl * 0.4, y - len * 0.6, x + curl, y - len);
  ctx.stroke(); ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x + curl, y - len, wdt * 0.32, 0, 7); ctx.fill();
}

export function drawMonsterShape(ctx, sp, x, y, s, o = {}) {
  const L = sp.len * s, H = L * 0.38;
  ctx.save();
  ctx.translate(x, y);
  if (o.flip) ctx.scale(-1, 1);
  if (o.angle) ctx.rotate(o.angle);
  const body = o.shadow ? 'rgba(4,10,18,0.55)' : sp.c1;
  const K = sp.id === 'kraken';
  if (K && !o.shadow) {
    // the Mother: thick tentacles first, rearing and curling against the sky
    for (let i = 0; i < 5; i++) {
      const tx = -L * 0.36 + i * L * 0.18;
      tentacle(ctx, tx, H * 0.15, L * (1.0 + (i % 3) * 0.3), (i - 2) * L * 0.3, L * 0.105, sp.c1);
    }
  }
  ctx.fillStyle = body; ctx.beginPath(); // body
  ctx.moveTo(-L / 2, 0);
  ctx.quadraticCurveTo(-L * 0.1, -H * 0.62, L * 0.34, -H * 0.3);
  ctx.quadraticCurveTo(L * 0.52, 0, L * 0.34, H * 0.3);
  ctx.quadraticCurveTo(-L * 0.1, H * 0.62, -L / 2, 0);
  ctx.fill();
  if (K && !o.shadow) { // a bulbous mantle dome instead of a fish tail
    ctx.beginPath(); ctx.arc(-L * 0.02, H * 0.05, L * 0.37, Math.PI, 0); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); // tail
    ctx.moveTo(-L / 2, 0); ctx.lineTo(-L * 0.72, -H * 0.5); ctx.lineTo(-L * 0.72, H * 0.5);
    ctx.closePath(); ctx.fill();
  }
  if (sp.id === 'squid' && !o.shadow) { // the Wrath drags a skirt of arms
    for (let i = 0; i < 4; i++) tentacle(ctx, -L * 0.4 + i * L * 0.12, H * 0.3, L * 0.42, (i - 1.5) * 8, L * 0.05, sp.c1);
  }
  ctx.fillStyle = o.shadow ? 'rgba(4,10,18,0.55)' : sp.c2; // glow stripe along the flank
  ctx.beginPath(); ctx.moveTo(-L * 0.3, H * 0.18);
  ctx.quadraticCurveTo(L * 0.1, H * 0.42, L * 0.4, H * 0.05);
  ctx.quadraticCurveTo(L * 0.1, H * 0.22, -L * 0.3, H * 0.18); ctx.fill();
  ctx.beginPath(); // dorsal fin / sail
  ctx.moveTo(-L * 0.05, -H * 0.42); ctx.lineTo(L * 0.12, -H * 0.72); ctx.lineTo(L * 0.24, -H * 0.34);
  ctx.closePath(); ctx.fillStyle = o.shadow ? 'rgba(4,10,18,0.55)' : sp.c2; ctx.fill();
  if (!o.shadow) {
    // glowing eyes — the part of the monster you meet first in the dark
    ctx.fillStyle = sp.c2; ctx.shadowColor = sp.c2; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(L * 0.36, -H * 0.1, Math.max(2, L * (K ? 0.075 : 0.05)), 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(L * 0.2, -H * 0.18, Math.max(1.4, L * (K ? 0.05 : 0.032)), 0, 7); ctx.fill();
    ctx.shadowBlur = 0;
    if (sp.tier === 3) { // ember-red fin fringe
      ctx.fillStyle = '#ff6a3c';
      ctx.beginPath(); ctx.moveTo(-L * 0.6, 0); ctx.lineTo(-L * 0.78, -H * 0.62); ctx.lineTo(-L * 0.7, H * 0.1); ctx.closePath(); ctx.fill();
    }
    if (sp.id === 'ghost') { // a lantern lure dangling ahead of the jaws
      ctx.fillStyle = '#d8fbff'; ctx.shadowColor = '#9fefff'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(L * 0.52, -H * 0.4, L * 0.055, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  ctx.restore();
}

function sky(ctx, run, t) {
  const loc = LOCATIONS[run.location];
  const g = ctx.createLinearGradient(0, 0, 0, WATER_Y); g.addColorStop(0, loc.sky[0]); g.addColorStop(1, loc.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, WATER_Y);
  // stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 26; i++) {
    ctx.globalAlpha = 0.3 + 0.4 * Math.abs(Math.sin(t * 0.7 + i));
    ctx.fillRect(hash(i * 3) * 1280, hash(i * 7) * 300, 2, 2);
  }
  ctx.globalAlpha = 1;
  // the moon — blood-red on a Blood Moon, bone-pale otherwise
  const blood = run.weather.id === 'bloodmoon';
  for (const [r, a] of [[66, 0.10], [52, 0.16]]) {
    ctx.fillStyle = blood ? `rgba(255,80,50,${a})` : `rgba(244,241,222,${a})`;
    ctx.beginPath(); ctx.arc(1085, 92, r, 0, 7); ctx.fill();
  }
  ctx.fillStyle = blood ? '#e8563a' : '#f4f1de';
  ctx.beginPath(); ctx.arc(1085, 92, 40, 0, 7); ctx.fill();
  // drifting mist bands
  ctx.fillStyle = run.weather.id === 'fog' ? 'rgba(170,190,210,0.20)' : 'rgba(160,180,230,0.08)';
  for (let i = 0; i < 3; i++) {
    const cx = ((hash(i * 13) * 1400 + t * (4 + i * 2)) % 1500) - 120;
    const cy = 52 + hash(i * 29) * 120;
    ctx.beginPath(); ctx.ellipse(cx, cy, 90 + i * 14, 17 + (i % 3) * 5, 0, 0, 7);
    ctx.ellipse(cx + 52, cy + 5, 60, 13, 0, 0, 7); ctx.fill();
  }
}

function hills(ctx, run) {
  const loc = LOCATIONS[run.location];
  for (const [base, amp, seed] of [[352, 46, 3], [392, 30, 11]]) {
    ctx.fillStyle = loc.hill; ctx.globalAlpha = base === 352 ? 0.55 : 0.9;
    ctx.beginPath(); ctx.moveTo(0, WATER_Y);
    for (let x = 0; x <= 1280; x += 64) ctx.lineTo(x, base - Math.sin(x * 0.004 + seed) * amp - Math.sin(x * 0.011 + seed * 2) * 7);
    ctx.lineTo(1280, WATER_Y); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // dead-mast silhouettes on the near ridge — wrecks of earlier hunters
  ctx.fillStyle = '#0a1220';
  for (let i = 0; i < 4; i++) {
    const tx = 640 + i * 168 + hash(i * 31) * 30, th = 40 + hash(i * 17) * 26, ty = 400 - hash(i * 7) * 12;
    ctx.fillRect(tx - 2, ty - th, 4, th);
    ctx.beginPath(); ctx.moveTo(tx, ty - th); ctx.lineTo(tx + 20, ty - th + 12); ctx.lineTo(tx, ty - th + 12); ctx.closePath(); ctx.fill();
  }
}

function water(ctx, run, t) {
  const loc = LOCATIONS[run.location];
  const g = ctx.createLinearGradient(0, WATER_Y, 0, 720); g.addColorStop(0, loc.water[0]); g.addColorStop(1, loc.water[1]);
  ctx.fillStyle = g; ctx.fillRect(0, WATER_Y, 1280, 720 - WATER_Y);
  // moon-glint column, sliding slowly with the swell
  const rx = 1085 + Math.sin(t * 0.4) * 14;
  ctx.fillStyle = run.weather.id === 'bloodmoon' ? 'rgba(255,120,80,0.12)' : 'rgba(255,255,240,0.10)';
  for (let i = 0; i < 5; i++) {
    const wdt = 26 + hash(i * 3) * 60 + Math.sin(t * 2 + i) * 8;
    ctx.fillRect(rx - wdt / 2 + Math.sin(t * 1.3 + i * 2) * 6, WATER_Y + 8 + i * 52, wdt, 3);
  }
  // a lone tentacle drifts through the deep seas now and then (decoration)
  if (run.location >= 1) {
    const tx = ((t * 16 + 420) % 1560) - 140;
    ctx.globalAlpha = 0.16;
    tentacle(ctx, tx, 706, 120 + Math.sin(t * 0.5) * 18, 60, 15, '#02060c');
    ctx.globalAlpha = 1;
  }

  // moving wave highlights
  ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = 2;
  for (let r = 0; r < 2; r++) {
    ctx.beginPath();
    for (let x = 0; x <= 1280; x += 16) {
      const y = WATER_Y + 14 + r * 110 + Math.sin(x * 0.02 + t * (1.4 + r * 0.3) + r * 9) * 4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

  }
  // sparkle flecks
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let i = 0; i < 10; i++) {
    const sx = hash(i * 41 + ((t * 0.6) | 0)) * 1280, sy = WATER_Y + 10 + hash(i * 53) * 260;
    if (hash(i + ((t * 0.6) | 0)) > 0.6) ctx.fillRect(sx, sy, 3, 1.6);
  }
}

function deckAndHunter(ctx, run, t) {
  // the ship's deck edge
  ctx.fillStyle = '#3d2c1c'; ctx.fillRect(0, WATER_Y - 6, 252, 14);
  ctx.fillStyle = '#2a1d11';
  for (let i = 0; i < 6; i++) ctx.fillRect(6 + i * 42, WATER_Y - 6, 3, 14);
  ctx.fillRect(26, WATER_Y + 8, 12, 52); ctx.fillRect(206, WATER_Y + 8, 12, 52);
  // hunter silhouette: boots, oilskin coat, wide hat, arms braced on the pole
  const ax = 148, ay = WATER_Y - 8;
  ctx.fillStyle = '#141e28';
  ctx.fillRect(ax - 16, ay - 58, 13, 58); ctx.fillRect(ax + 5, ay - 58, 13, 58); // legs
  ctx.beginPath(); // coat
  ctx.moveTo(ax - 24, ay - 56); ctx.quadraticCurveTo(ax, ay - 108, ax + 22, ay - 58);
  ctx.quadraticCurveTo(ax, ay - 44, ax - 24, ay - 56); ctx.fill();

  ctx.fillStyle = '#1d2c3a';
  ctx.beginPath(); ctx.arc(ax, ay - 112, 15, 0, 7); ctx.fill(); // head
  ctx.fillStyle = '#5d4a26'; // oilskin hat
  ctx.beginPath(); ctx.ellipse(ax, ay - 122, 26, 6, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(ax, ay - 126, 13, 7, 0, Math.PI, 0); ctx.fill();
  // harpoon pole: butt at the hands, tip bending down as tension climbs
  const bend = run.phase === 'fight' ? run.tension * 0.55 : run.phase === 'charge' ? -14 : 6;
  const tipX = ax + 218, tipY = ay - 128 + bend + Math.sin(t * 2) * (run.phase === 'fight' ? 2.5 : 0.6);
  ctx.lineCap = 'round';
  for (const [col, w] of [['#241a10', 5], ['#6e5636', 2.4]]) {
    ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(ax + 14, ay - 82);
    ctx.quadraticCurveTo(ax + 120, ay - 138 + bend * 0.4, tipX, tipY); ctx.stroke();
  }
  return { tipX, tipY };
}

function weatherFx(ctx, run, t) {
  if (run.weather.id === 'gale') {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const y = 70 + hash(i * 19) * 260, x = ((t * (130 + i * 22) + i * 300) % 1500) - 200;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 8, x + 130, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(200,225,255,0.3)'; ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < 18; i++) {
      const x = (hash(i * 7) * 1400 + t * 620) % 1400 - 60, y = (hash(i * 13) * 760 + t * 900) % 760;
      ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 17);
    }
    ctx.stroke();
  } else if (run.weather.id === 'fog') {
    ctx.fillStyle = 'rgba(140,160,180,0.13)'; ctx.fillRect(0, 0, 1280, 720);
  }
}

export function drawWorld(ctx, run, view) {
  const t = view.t;
  sky(ctx, run, t); hills(ctx, run); water(ctx, run, t);
  const rod = deckAndHunter(ctx, run, t);
  const bx = bobberX(run);
  // monster shadows while waiting: slow silhouettes circling the lure
  if (run.phase === 'wait' || run.phase === 'bite') {
    ctx.fillStyle = 'rgba(4,10,18,0.5)';
    for (let i = 0; i < 2; i++) {
      const a = t * (0.24 + i * 0.07) + i * 2.2;
      const sx = bx + Math.cos(a) * (66 + i * 30), sy = WATER_Y + 66 + i * 34 + Math.sin(a * 1.7) * 9;
      const L = 44 + i * 16, dir = Math.cos(a) > 0 ? 1 : -1;
      ctx.beginPath(); ctx.ellipse(sx, sy, L / 2, L * 0.19, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(sx - dir * L / 2, sy);
      ctx.lineTo(sx - dir * L * 0.72, sy - L * 0.19); ctx.lineTo(sx - dir * L * 0.72, sy + L * 0.19);
      ctx.closePath(); ctx.fill();
    }
  }
  // telegraph: as the bite nears, rings spread from the lure — the fair tell
  if (run.phase === 'wait' && run.cur?.telegraphed) {
    ctx.strokeStyle = 'rgba(190,240,255,0.6)'; ctx.lineWidth = 2;
    for (let i = 0; i < 2; i++) {
      const rr2 = 14 + ((t * 46 + i * 22) % 44);
      ctx.globalAlpha = 0.65 * (1 - rr2 / 60);
      ctx.beginPath(); ctx.ellipse(bx, WATER_Y + 3, rr2, rr2 * 0.26, 0, 0, 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // the hooked monster: thrashing at the surface, breaching on a jump
  let lineEnd = { x: bx, y: WATER_Y + 2 };
  if (run.phase === 'fight' && run.cur?.sp) {
    const fx = fishX(run), jump = run.cur.behavior === 'jump';
    const fy = jump ? WATER_Y - 44 - Math.sin(t * 9) * 10 : WATER_Y + 4;
    if (run.cur.sp.tier >= 2) { // flat glow halo (cheap, still radiant)
      ctx.fillStyle = run.cur.sp.tier === 3 ? 'rgba(255,60,40,0.25)' : 'rgba(160,220,255,0.2)';
      ctx.beginPath(); ctx.ellipse(fx, fy, run.cur.sp.len * 0.95, run.cur.sp.len * 0.4, 0, 0, 7); ctx.fill();
    }
    const s = run.cur.sp.id === 'kraken' ? 2.3 : 1.15;
    drawMonsterShape(ctx, run.cur.sp, fx, fy, s, {
      flip: true,
      angle: jump ? -0.5 : Math.sin(t * 7) * 0.14,
    });
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2.4; // splash ring
    ctx.beginPath(); ctx.ellipse(fx, WATER_Y + 5, 34 + Math.sin(t * 11) * 7, 7, 0, 0, 7); ctx.stroke();
    lineEnd = { x: fx, y: fy };
  }
  // the cable: it visibly strains — thicker and brighter as tension climbs
  if (run.phase === 'wait' || run.phase === 'bite' || run.phase === 'fight') {
    const strain = run.phase === 'fight' ? run.tension / 105 : 0;
    ctx.strokeStyle = strain > 0.8 ? 'rgba(255,176,160,0.95)' : `rgba(240,248,255,${0.6 + strain * 0.35})`;
    ctx.lineWidth = 1.6 + strain * 2.8;
    ctx.beginPath(); ctx.moveTo(rod.tipX, rod.tipY);
    ctx.quadraticCurveTo((rod.tipX + lineEnd.x) / 2, Math.min(rod.tipY, lineEnd.y) - 26, lineEnd.x, lineEnd.y);
    ctx.stroke();
  }
  if (run.phase === 'wait' || run.phase === 'bite') {
    // the lantern lure: dips on a fake bite, plunges on the real one
    const fakeDip = view.fakeAge < 0.45 ? Math.sin(view.fakeAge / 0.45 * Math.PI) * 7 : 0;
    const dip = run.phase === 'bite' ? 9 + Math.sin(t * 26) * 2.5
      : run.cur?.telegraphed ? 5 + Math.sin(t * 9) * 1.6 : Math.sin(t * 2.2) * 2.4 + fakeDip;
    ctx.fillStyle = '#ffd94d'; ctx.shadowColor = '#ffd94d'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.ellipse(bx, WATER_Y + dip, 8, 10, 0, 0, 7); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#fff3b0';
    ctx.beginPath(); ctx.ellipse(bx, WATER_Y + dip - 4, 5, 4, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(bx, WATER_Y + 3, 20 + Math.sin(t * 3) * 4, 5, 0, 0, 7); ctx.stroke();
  }
  // particles (splashes, coin bursts, sparkles)
  for (const p of view.fx) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
  weatherFx(ctx, run, t);
  // in the red zone the screen edges pulse — the cable is about to go
  if (run.phase === 'fight' && run.tension > 85) {
    const vg = ctx.createRadialGradient(640, 360, 380, 640, 360, 820);
    vg.addColorStop(0, 'rgba(200,20,10,0)');
    vg.addColorStop(1, `rgba(200,20,10,${0.16 + 0.11 * Math.sin(t * 10)})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, 1280, 720);
  }
  // a soft vignette frames the scene
  const vg = ctx.createRadialGradient(640, 360, 420, 640, 360, 880);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, 1280, 720);
}
