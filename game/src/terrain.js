// terrain.js — one job: the sea surface as terrain, and the frame's
// vignette. Foam-capped wave rows across the whole ground, a wreckage
// field of planks, a broken mast and the buoy chain that marks the
// hunting ground in the deep seas, and the Maw's whirlpool turning
// against itself, lit faintly red from below. theatre.js calls this
// first; the vignette is applied there last.
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

