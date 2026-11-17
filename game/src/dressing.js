// dressing.js — one job: make the water feel inhabited. Per-sea set
// dressing (broken masts and lantern buoys in the Shoal, a wreck and
// glow-motes in the Deep, bone spires in the Maw) and the weather layer
// (sparkle noise, drifting fog banks, rain). Everything is placed from
// fixed hashes, so every frame — and every screenshot — agrees.
import { WEATHERS } from './data.js';

const WATER_Y = 430; // mirrors render.js
const hash = (i, k) => ((i * 2654435761 + k * 40503) % 1000) / 1000;

export function drawWeatherFx(ctx, run, t) {
  const wname = WEATHERS[run.weatherIdx].name;
  // deterministic sparkle noise on the water
  ctx.fillStyle = '#cfe8ff';
  for (let i = 0; i < 28; i++) {
    const x = hash(i, 1) * 1280;
    const y = WATER_Y + 14 + hash(i, 2) * 250;
    ctx.globalAlpha = 0.04 + 0.13 * Math.abs(Math.sin(t * 1.3 + i * 1.7));
    ctx.fillRect(x, y, 2.4, 1.6);
  }
  ctx.globalAlpha = 1;
  if (wname === 'Fog') {
    // fog banks drifting through, not a flat wash
    ctx.fillStyle = 'rgba(190,205,220,0.075)';
    for (let i = 0; i < 4; i++) {
      const x = ((hash(i, 5) * 1280 + t * (6 + i * 3)) % 1500) - 110;
      const y = WATER_Y - 46 + i * 38;
      ctx.beginPath();
      ctx.ellipse(x, y, 200, 20, 0, 0, 6.29);
      ctx.fill();
    }
  }
  if (wname === 'Gale' || wname === 'Blood Moon') {
    // rain, slanting with the wind
    ctx.strokeStyle = 'rgba(190,220,245,0.17)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const x = ((hash(i, 3) * 1400 + t * 330) % 1400) - 60;
      const y = ((hash(i, 4) * 780 + t * 640) % 780) - 30;
      ctx.moveTo(x, y);
      ctx.lineTo(x - 7, y + 17);
    }
    ctx.stroke();
  }
}

function mast(ctx, x, h, lean) {
  ctx.strokeStyle = '#0d141f';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x, WATER_Y + 8);
  ctx.lineTo(x + lean, WATER_Y - h);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + lean - 20, WATER_Y - h + 16);
  ctx.lineTo(x + lean + 22, WATER_Y - h + 10);
  ctx.stroke();
}

function buoy(ctx, x, t, ph) {
  const y = WATER_Y + 12 + Math.sin(t * 1.4 + ph) * 3;
  ctx.fillStyle = '#0d141f';
  ctx.fillRect(x - 3, y - 16, 6, 16);
  const hg = ctx.createRadialGradient(x, y - 20, 1, x, y - 20, 22);
  hg.addColorStop(0, 'rgba(255,190,90,0.65)');
  hg.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = hg;
  ctx.fillRect(x - 22, y - 42, 44, 44);
  ctx.fillStyle = '#ffbe5a';
  ctx.beginPath();
  ctx.arc(x, y - 20, 3.4, 0, 6.29);
  ctx.fill();
}

export function drawDressing(ctx, run, t) {
  if (run.sea === 0) {
    // Widow's Shoal: wrecks of smaller hunters, lantern buoys, a gull's rock
    mast(ctx, 585, 118, -14);
    mast(ctx, 1180, 74, 10);
    buoy(ctx, 724, t, 0);
    buoy(ctx, 1012, t, 2.4);
    ctx.fillStyle = '#0a121e';
    ctx.beginPath();
    ctx.ellipse(468, WATER_Y + 6, 64, 13, 0, 0, 6.29);
    ctx.fill();
    // the gull: two white arcs and a dot of a body, watching you fail
    ctx.strokeStyle = 'rgba(230,238,244,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(460, WATER_Y - 12, 6, 3.4, 6.0);
    ctx.arc(472, WATER_Y - 12, 6, 3.4, 6.0);
    ctx.stroke();
  } else if (run.sea === 1) {
    // The Drowning Deep: a wrecked hull on the right, glow-fish motes below
    ctx.fillStyle = '#081120';
    ctx.beginPath();
    ctx.moveTo(948, WATER_Y + 4);
    ctx.quadraticCurveTo(1090, WATER_Y - 64, 1246, WATER_Y - 18);
    ctx.lineTo(1246, WATER_Y + 4);
    ctx.fill();
    ctx.strokeStyle = '#081120';
    ctx.lineWidth = 6;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(1010 + i * 62, WATER_Y - 8, 30 - i * 4, 3.3, 5.2);
      ctx.stroke();
    }
    mast(ctx, 1120, 92, 22);
    ctx.fillStyle = '#7fe8d8';
    for (let i = 0; i < 14; i++) {
      const x = 120 + hash(i, 7) * 1060;
      const y = WATER_Y + 60 + hash(i, 8) * 190 + Math.sin(t * 0.6 + i * 2.1) * 6;
      ctx.globalAlpha = 0.1 + 0.16 * Math.abs(Math.sin(t * 0.9 + i));
      ctx.fillRect(x, y, 3, 2);
    }
    ctx.globalAlpha = 1;
  } else {
    // Kraken's Maw: bone spires — the ribs of things she has eaten
    ctx.strokeStyle = 'rgba(216,208,188,0.5)';
    ctx.lineCap = 'round';
    for (const [bx, bh, lean] of [[520, 120, -30], [706, 84, 24], [1150, 140, -18]]) {
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(bx, WATER_Y + 10);
      ctx.quadraticCurveTo(bx + lean * 0.3, WATER_Y - bh * 0.6, bx + lean, WATER_Y - bh);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx + 16, WATER_Y + 10);
      ctx.quadraticCurveTo(bx + 16 + lean * 0.3, WATER_Y - bh * 0.45, bx + 14 + lean, WATER_Y - bh * 0.72);
      ctx.stroke();
    }
    // a second tentacle, further off, doing its slow patrol
    const tx = 330 + Math.sin(t * 0.16) * 120;
    ctx.strokeStyle = 'rgba(5,8,14,0.65)';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(tx, 706);
    ctx.quadraticCurveTo(tx - 20, 640, tx + 10, 592 + Math.sin(t * 0.8) * 7);
    ctx.stroke();
  }
}
