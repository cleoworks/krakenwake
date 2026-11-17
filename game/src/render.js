// render.js — one job: draw the world. Night sea, moon, dock and hunter,
// the lure and whatever is on the chain, weather, particles, the red
// vignette when the chain is about to snap. HUD and screens live in ui.js.
import { MONSTERS, WEATHERS } from './data.js';
import { drawFishShape } from './vendor/shapes.js';
import { drawWyrm } from './vendor/wyrm.js';
import { drawDressing, drawWeatherFx } from './dressing.js';
import { drawSkyExtras, drawWaterLife, drawSurfaceDressing, drawDockDetail, drawFightFx } from './vendor/scenery.js';
import { drawTheatre } from './theatre.js';
import { drawNinja } from './ninja.js';
import { drawChain } from './chain.js';
import { drawHorizonLife } from './terrain.js';

export const WATER_Y = 430;
const DOCK_X = 168;
export const MOON_X = 300, MOON_Y = 205; // open sky left of the callout column — no panel, bar or wyrm covers it

// where the business end of the chain is, in pixels, for a distance in metres
export const castX = (dist) => 400 + dist * 6.4;
export function lurePos(run) {
  if (run.phase === 'fight' && run.fight) {
    return { x: castX(run.fight.dist), y: WATER_Y + 4 };
  }
  if (run.phase === 'wait' || run.phase === 'charge') {
    const dip = run.wait ? run.wait.dip * 12 : 0;
    return { x: castX(run.castDist || 60), y: WATER_Y + 8 + dip };
  }
  return { x: castX(60), y: WATER_Y + 8 };
}

// Where the fight's callout column stands. Over a fish it sits on the
// fish; the King Wyrm is too big to shout across — his column steps
// left, over open water, clear of the coils and the neck.
export function calloutX(run) {
  const p = lurePos(run);
  if (run.phase === 'fight' && run.fight && MONSTERS[run.fight.mi].shape === 'wyrm') {
    return Math.max(300, p.x - 330);
  }
  return p.x;
}

// stars from a fixed hash so every frame (and every screenshot) agrees
function starY(i) { return ((i * 2654435761) % 1000) / 1000; }
function drawSky(ctx, run, t) {
  const blood = WEATHERS[run.weatherIdx].name === 'Blood Moon';
  // the sky as eight flat bands stepping down to the horizon colour:
  // a continuous gradient costs ~17 KB of screenshot PNG, flat bands
  // read as the same dusk at a glance and cost almost nothing
  const sky = blood
    ? ['#1e1030', '#241232', '#2a1535', '#301737', '#351939', '#3b1b3c', '#411e3e', '#472040']
    : ['#081226', '#0b182e', '#0f1e35', '#12243d', '#152a45', '#19304d', '#1c3654', '#1f3c5c'];
  const bh = WATER_Y / sky.length;
  sky.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, Math.floor(i * bh), 1280, Math.ceil(bh) + 1); });
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 18; i++) {
    const x = (i * 173.3) % 1280;
    const y = 12 + starY(i) * 300;
    if (Math.hypot(x - MOON_X, y - MOON_Y) < 84) continue;
    ctx.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t * 0.7 + i));
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  // moon — a huge blood moon in the Maw's sky, a plain disc elsewhere,
  // riding the open sky left of centre where no panel covers it. No
  // halo ring: a plain bright disc reads cleaner and costs less PNG.
  const mr = blood ? 64 : 40;
  ctx.fillStyle = blood ? '#e8483f' : '#e8eef4';
  ctx.beginPath();
  ctx.arc(MOON_X, MOON_Y, mr, 0, 6.29);
  ctx.fill();
  ctx.fillStyle = blood ? 'rgba(120,20,16,0.35)' : 'rgba(160,175,190,0.35)';
  ctx.beginPath();
  ctx.arc(MOON_X - 15 * (mr / 44), MOON_Y - 12 * (mr / 44), 9 * (mr / 44), 0, 6.29); ctx.arc(MOON_X + 17 * (mr / 44), MOON_Y + 16 * (mr / 44), 6 * (mr / 44), 0, 6.29);
  ctx.fill();
  // far hills, then a nearer parallax ridge rolling the other way
  ctx.fillStyle = '#0a1522';
  ctx.beginPath(); ctx.moveTo(0, WATER_Y);
  for (let x = 0; x <= 1280; x += 80) ctx.lineTo(x, WATER_Y - 46 - 26 * Math.sin(x * 0.004 + 2));
  ctx.lineTo(1280, WATER_Y);
  ctx.fill();
  ctx.fillStyle = '#060d18';
  ctx.beginPath();
  ctx.moveTo(0, WATER_Y);
  for (let x = 0; x <= 1280; x += 64) ctx.lineTo(x, WATER_Y - 14 - 15 * Math.sin(x * 0.006 + 5 + t * 0.05));
  ctx.lineTo(1280, WATER_Y);
  ctx.fill();
}

function drawWater(ctx, run, t) {
  const blood = WEATHERS[run.weatherIdx].name === 'Blood Moon';
  const g = ctx.createLinearGradient(0, WATER_Y, 0, 720);
  g.addColorStop(0, blood ? '#3a5c80' : '#27536f');
  g.addColorStop(1, '#0a1a30');
  ctx.fillStyle = g;
  ctx.fillRect(0, WATER_Y, 1280, 720 - WATER_Y);
  // swell lines drifting
  ctx.strokeStyle = 'rgba(160,210,240,0.13)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 2; row++) {
    const y = WATER_Y + 26 + row * 64;
    ctx.beginPath();
    for (let x = 0; x <= 1280; x += 58) {
      const yy = y + Math.sin(x * 0.012 + t * (0.7 + row * 0.13) + row * 2) * 4;
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // the moon-glint column, sliding slowly on the swell — red in the Maw
  // even under a plain moon; its water remembers.
  const gx = MOON_X + Math.sin(t * 0.4) * 22;
  ctx.fillStyle = blood ? 'rgba(232,72,63,0.20)' : run.sea === 2 ? 'rgba(232,90,70,0.13)' : 'rgba(200,225,245,0.16)';
  for (let i = 0; i < 5; i++) {
    if (Math.sin(i * 3.7 + t * 0.6) > 0.55) continue; // the path breaks, like real glint
    const y = WATER_Y + 12 + i * 22;
    const w = 14 + 26 * Math.abs(Math.sin(i * 1.7 + t * 0.9));
    ctx.fillRect(gx - w / 2 + Math.sin(i * 2.3 + t) * 7, y, w, 3);
  }
  // (the fine swell layer was cut for the screenshot byte budget)
  if (WEATHERS[run.weatherIdx].name === 'Gale') { // wind streaks worrying the sky
    ctx.strokeStyle = 'rgba(200,225,245,0.18)';
    for (let i = 0; i < 7; i++) {
      const y = 60 + i * 55 + Math.sin(t * 2 + i) * 6;
      ctx.beginPath();
      ctx.moveTo(60 + ((t * 130 + i * 211) % 500), y);
      ctx.lineTo(190 + ((t * 130 + i * 211) % 500), y);
      ctx.stroke();
    }
  }
}

function drawDock(ctx, run, view, lite) {
  // with the King Wyrm on the chain the whole dock strains against him
  const strain = run.phase === 'fight' && run.fight && MONSTERS[run.fight.mi].shape === 'wyrm';
  if (strain) {
    ctx.save();
    ctx.translate(150, 414);
    ctx.rotate(-0.016 - run.fight.tension * 0.00012);
    ctx.translate(-150, -414);
  }
  ctx.fillStyle = '#241a12';
  ctx.fillRect(24, 414, 250, 12);
  ctx.fillRect(44, 426, 14, 66);
  ctx.fillRect(238, 426, 14, 66);
  ctx.fillStyle = '#31241a';
  for (let i = 0; i < 6; i++) ctx.fillRect(28 + i * 41, 411, 36, 4);
  // the hunter himself — the Wyrm Ninja, posed by the moment (ninja.js)
  drawNinja(ctx, run, view, lite);
  if (strain) ctx.restore();
}

function drawMonster(ctx, run, t) {
  if (run.phase === 'wait' && run.wait) {
    // the shadow circling under the lure, bolder once the telegraph fires
    const p = lurePos(run);
    const w = run.wait;
    const sx = p.x + Math.sin(w.t * 1.35) * 40;
    const sy = WATER_Y + 52 + Math.cos(w.t * 1.35) * 10;
    ctx.fillStyle = `rgba(4,10,18,${w.telegraph ? 0.55 : 0.34})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 44, 13, 0, 0, 6.29);
    ctx.fill();
    // the lure itself, glowing when a Lantern Squid or Doom Bell is on
    const glow = run.lure >= 2;
    if (glow) {
      const gg = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 30);
      gg.addColorStop(0, 'rgba(255,220,120,0.55)');
      gg.addColorStop(1, 'rgba(255,220,120,0)');
      ctx.fillStyle = gg;
      ctx.fillRect(p.x - 30, p.y - 30, 60, 60);
    }
    // the lure: a little harpoon head riding point-down, gold eye lit
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(0.45 + Math.sin(t * 3) * 0.06);
    ctx.strokeStyle = '#6b4a2a';
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 1); ctx.stroke();
    ctx.fillStyle = '#cfd8e2';
    ctx.beginPath();
    ctx.moveTo(0, 9); ctx.lineTo(-3.4, 0); ctx.lineTo(3.4, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.5, 2); ctx.lineTo(-4.6, -2.5); ctx.lineTo(0.8, -1.5);
    ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath(); ctx.arc(0, 2, 1.8, 0, 6.29); ctx.fill();
    if (w.telegraph) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 2, 0.9, 0, 6.29); ctx.fill();
    }
    ctx.restore();
    if (w.telegraph || w.dip > 0) {
      ctx.strokeStyle = 'rgba(200,230,250,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 2; i++) {
        const r = 10 + ((t * 26 + i * 16) % 32);
        ctx.globalAlpha = 0.6 - r / 60;
        ctx.beginPath();
        ctx.ellipse(p.x, WATER_Y + 6, r, r * 0.32, 0, 0, 6.29);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    return;
  }
  if (run.phase === 'fight' && run.fight) {
    const f = run.fight;
    const m = MONSTERS[f.mi];
    const p = lurePos(run);
    const near = Math.max(0, 1 - f.dist / 95);
    if (m.shape === 'wyrm') {
      // his jaw gapes while he thrashes — the same surge signal the
      // THRASHING! callout reads; on the slam telegraph he rears back
      const surge01 = 0.5 + 0.5 * Math.sin(f.t * 1.6 + f.surgePhase) * Math.sin(f.t * 0.53 + 1.7);
      const maw = Math.min(1, Math.max(0, (surge01 - 0.78) / 0.22) * 1.3);
      const rear = f.event && f.event.id === 'slam' && f.event.phase === 'tele'
        ? Math.min(1, Math.max(0, 1 - f.event.t / 1.0)) : 0;
      drawWyrm(ctx, p.x, WATER_Y + 22, 150 + near * 45, t, '#ff5040', maw, rear);
    } else {
      const s = 20 + near * 30 + m.bulk;
      const bob = Math.sin(t * 2.2) * 3;
      drawFishShape(ctx, m.shape, p.x, WATER_Y - 4 - near * 12 + bob, s, '#0a1420', '#ff5040');
      // foam at the surface line
      ctx.fillStyle = 'rgba(220,240,255,0.5)';
      for (let i = 0; i < 5; i++) {
        const fx = p.x - s + ((i * 37 + Math.floor(t * 9) * 13) % Math.max(10, s * 2));
        ctx.fillRect(fx, WATER_Y + 2 + (i % 3) * 3, 7, 3); // foam flecks at the surface line
      }
    }
  }
}

export function drawWorld(ctx, run, view, lite = false) {
  const t = view.t;
  drawSky(ctx, run, t);
  if (!lite) drawSkyExtras(ctx, run, t);
  drawWater(ctx, run, t);
  if (!lite) drawHorizonLife(ctx, run, t);
  drawDressing(ctx, run, t);
  drawWeatherFx(ctx, run, t);
  if (!lite) {
    drawWaterLife(ctx, run, t);
    drawSurfaceDressing(ctx, run, t);
  }
  drawMonster(ctx, run, t);
  if (!lite) drawFightFx(ctx, run, t);
  drawChain(ctx, run, view);
  drawDock(ctx, run, view, lite);
  if (!lite) drawDockDetail(ctx, run, t);
  // a lone coil of something vast drifting through the deep seas
  if (run.sea >= 1 && run.phase !== 'fight') {
    const tx = 900 + Math.sin(t * 0.21) * 260;
    ctx.strokeStyle = 'rgba(5,8,14,0.8)';
    ctx.lineWidth = 13; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx - 30, 700);
    ctx.quadraticCurveTo(tx, 596 + Math.sin(t * 0.9) * 8, tx + 34, 700);
    ctx.stroke();
    ctx.fillStyle = 'rgba(5,8,14,0.8)'; // the crest spikes on the coil
    for (const k of [-0.5, 0, 0.5]) {
      const px = tx + k * 30, py = 634 + Math.sin(t * 0.9) * 8 + Math.abs(k) * 16;
      ctx.beginPath();
      ctx.moveTo(px - 6, py + 8); ctx.lineTo(px, py - 8); ctx.lineTo(px + 6, py + 8);
      ctx.fill();
    }
  }
  if (!lite) drawTheatre(ctx, run, t);
  // particles (splash bursts, coin bursts)
  for (const p of view.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  // the chain is about to pop: pulse a red vignette at the edges
  if (run.phase === 'fight' && run.fight && run.fight.tension > 85) {
    const a = 0.13 + 0.09 * Math.sin(t * 11);
    const vg = ctx.createRadialGradient(640, 360, 300, 640, 360, 760);
    vg.addColorStop(0, 'rgba(255,30,20,0)'); vg.addColorStop(1, `rgba(255,30,20,${a})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, 1280, 720);
  }
}
