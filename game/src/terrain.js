// terrain.js — one job: the sea surface as terrain, and the horizon's
// life. Wave rows, a wreckage field, the buoy chain, the Maw's whirlpool,
// and — flat shapes only — the horizon life of drawHorizonLife.
import { WATER_Y } from './render.js';

const hash = (i, k) => ((i * 2654435761 + k * 40503) % 1000) / 1000;

export function drawSeaTerrain(ctx, run, t) {
  // foam caps riding three wave rows across the whole ground
  ctx.strokeStyle = 'rgba(220,242,255,0.13)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 2; row++) {
    const y = WATER_Y + 36 + row * 58;
    for (let i = 0; i < 7; i++) {
      const x = ((hash(i + row * 31, 51) * 1330 + t * (4 + row * 2)) % 1330) - 25;
      ctx.beginPath();
      ctx.arc(x, y + Math.sin(t * 1.2 + i * 1.8 + row) * 2, 9, 3.5, 5.9);
      ctx.stroke();
    }
  }
  // the wreckage field: planks from somebody else's last night
  ctx.fillStyle = '#1c130c';
  for (let i = 0; i < 4; i++) {
    const x = 380 + hash(i, 52) * 760;
    const y = WATER_Y + 4 + hash(i, 53) * 8 + Math.sin(t * 1.25 + i * 2.4) * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((hash(i, 54) - 0.5) * 0.35);
    ctx.fillRect(-16 - hash(i, 55) * 10, -2.5, 32 + hash(i, 55) * 20, 5);
    ctx.restore();
  }
  if (run.sea >= 1) {
    // a broken mast, and the buoy chain that marks the hunting ground
    ctx.strokeStyle = '#0d141f';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(316, WATER_Y + 6);
    ctx.lineTo(308, WATER_Y - 48);
    ctx.stroke();
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(292, WATER_Y - 36);
    ctx.lineTo(326, WATER_Y - 40);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(160,190,215,0.4)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const bx = 452 + i * 148;
      const by = WATER_Y + 6 + Math.sin(t * 1.4 + i * 1.3) * 2.4;
      if (i === 0) ctx.moveTo(bx, by - 8);
      else {
        const px = 452 + (i - 1) * 148;
        const py = WATER_Y + 6 + Math.sin(t * 1.4 + (i - 1) * 1.3) * 2.4;
        ctx.quadraticCurveTo((px + bx) / 2, Math.max(py, by) + 9, bx, by - 8);
      }
    }
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const bx = 452 + i * 148;
      const by = WATER_Y + 6 + Math.sin(t * 1.4 + i * 1.3) * 2.4;
      ctx.fillStyle = '#0d141f';
      ctx.fillRect(bx - 2.4, by - 14, 4.8, 14);
      ctx.fillStyle = '#ffbe5a';
      ctx.beginPath();
      ctx.arc(bx, by - 17, 2.8, 0, 6.29);
      ctx.fill();
    }
  }
  if (run.sea === 2) {
    // the Maw's whirlpool: three dashed rings turning against each other
    const cx = 990;
    const cy = WATER_Y + 132;
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(255,120,95,${0.20 - i * 0.045})`;
      ctx.lineWidth = 2.4;
      ctx.setLineDash([12, 15]);
      ctx.lineDashOffset = (i % 2 ? -1 : 1) * t * (16 + i * 7);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 66 - i * 19, (66 - i * 19) * 0.3, 0, 0, 6.29);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}

// --- the horizon, alive: flat shapes only, so the life costs almost no
// PNG bytes — breaching backs, a flock, jumping fish, a far lighthouse.
export function drawHorizonLife(ctx, run, t) {
  const dark = '#081120';
  // a flock of five, drifting slow across the high sky, wings working
  const fx = 150 + ((t * 9) % 620);
  ctx.strokeStyle = 'rgba(8,14,24,0.85)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const bx = fx + i * 27 + (i % 2) * 9;
    const by = 118 + (i % 3) * 13 + Math.sin(t * 1.3 + i * 1.7) * 3;
    const flap = Math.sin(t * 6.5 + i * 1.3) * 3.4;
    ctx.beginPath();
    ctx.moveTo(bx - 6.5, by + flap * 0.4);
    ctx.lineTo(bx, by - 2.6 - flap);
    ctx.lineTo(bx + 6.5, by + flap * 0.4);
    ctx.stroke();
  }
  // things surfacing far out: a fin that rises and settles, a great back
  const finS = 0.5 + 0.5 * Math.sin(t * 0.45);
  ctx.fillStyle = dark;
  ctx.globalAlpha = 0.82;
  ctx.beginPath();
  ctx.moveTo(578, WATER_Y + 3);
  ctx.lineTo(606, WATER_Y + 3);
  ctx.lineTo(594, WATER_Y + 1 - (5 + 10 * finS));
  ctx.fill();
  const bkS = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.3 + 2));
  ctx.beginPath();
  ctx.ellipse(742, WATER_Y + 4, 37, 17 * bkS, 0, 3.14, 6.29);
  ctx.fill();
  if (bkS > 0.78) { // the fluke, up for a breath before it sounds
    ctx.beginPath();
    ctx.moveTo(706, WATER_Y + 2);
    ctx.lineTo(694, WATER_Y - 8);
    ctx.lineTo(712, WATER_Y - 3);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // fish jumping near the dock, one after another, all night long
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.45 + k * 0.37) % 1;
    if (p >= 0.45) continue;
    const q = p / 0.45;
    const jx = 298 + k * 44 + q * 54;
    const jy = WATER_Y + 3 - Math.sin(q * 3.14) * 30;
    ctx.save();
    ctx.translate(jx, jy);
    ctx.rotate(-Math.cos(q * 3.14) * 0.85);
    ctx.fillStyle = '#0a1626';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8.5, 3.1, 0, 0, 6.29);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-7.5, 0);
    ctx.lineTo(-12.5, -3.6);
    ctx.lineTo(-12.5, 3.6);
    ctx.fill();
    ctx.restore();
    if (q < 0.1 || q > 0.9) { // the splash where it leaves and lands
      ctx.fillStyle = 'rgba(220,242,255,0.55)';
      ctx.fillRect(jx - 5, WATER_Y + 1, 3, 2);
      ctx.fillRect(jx + 3, WATER_Y + 2, 3, 2);
    }
  }
  // the far lighthouse: a silhouette on the last point of land
  const lampX = 1206, lampY = 346;
  const ba = -0.1 + Math.sin(t * 0.35) * 0.17;
  ctx.fillStyle = 'rgba(255,238,190,0.05)';
  ctx.beginPath();
  ctx.moveTo(lampX, lampY);
  ctx.lineTo(lampX + Math.cos(ba - 0.1) * 215, lampY + Math.sin(ba - 0.1) * 215);
  ctx.lineTo(lampX + Math.cos(ba + 0.1) * 215, lampY + Math.sin(ba + 0.1) * 215);
  ctx.fill();
  ctx.fillStyle = '#060c16';
  ctx.beginPath();
  ctx.moveTo(1197, 427);
  ctx.lineTo(1201, 356);
  ctx.lineTo(1211, 356);
  ctx.lineTo(1215, 427);
  ctx.fill();
  ctx.fillRect(1199, 349, 14, 7);
  ctx.beginPath();
  ctx.moveTo(1200, 342);
  ctx.lineTo(1212, 342);
  ctx.lineTo(1206, 333);
  ctx.fill();
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.arc(lampX, lampY, 2.4, 0, 6.29);
  ctx.fill();
}

