// shapes2.js — one job: the Maw monsters and the Mother Kraken herself,
// creature-poster style: angular, scarred, slit-eyed. See shapes.js.
import { shade, makeKit } from './geom.js';

export function drawDeepShape(ctx, shape, x, y, s, color, eye = '#ffd94d') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const K = makeKit(ctx, s, color, eye);
  switch (shape) {
    case 'shark': {
      K.body(s, s * 0.46);
      ctx.fillStyle = shade(color, 0.85); // the dorsal: tall, and torn
      ctx.beginPath();
      ctx.moveTo(-s * 0.08, -s * 0.4); ctx.lineTo(s * 0.14, -s * 0.98); ctx.lineTo(s * 0.24, -s * 0.6);
      ctx.lineTo(s * 0.3, -s * 0.78); ctx.lineTo(s * 0.44, -s * 0.36); ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(color, 0.78); // pectoral fin, spined
      K.ridge(0.1, 0.45, 0.4, 3, -0.34);
      K.gills(0.4, -0.02, 4, 0.42);
      K.teeth(0.62, 0.16, 6, 0.13, 0.052); // the jagged row, upper jaw
      K.teeth(0.64, 0.3, 5, 0.1, 0.052, false); // and the lower, shorter
      K.scar(0.55, -0.28, 0.34, 0.35); // the scar across the snout
      K.scar(-0.35, 0.1, 0.4, -0.2);
      K.speckle(6, -0.6, 0.2, -0.3, 0.2);
      K.slitEye(0.64, -0.1);
      break;
    }
    case 'king': {
      K.body(s, s * 0.48);
      ctx.fillStyle = '#cfc4a4'; // a crown of bone spikes, one snapped
      for (let i = 0; i < 4; i++) {
        const bx = s * (0.18 + i * 0.17);
        const bh = s * (i === 2 ? 0.34 : 0.46);
        ctx.beginPath();
        ctx.moveTo(bx, -s * 0.4); ctx.lineTo(bx + s * 0.07, -s * 0.4 - bh); ctx.lineTo(bx + s * 0.14, -s * 0.4);
        ctx.fill();
      }
      K.speckle(7, 0.15, 0.8, -0.45, -0.2, 'rgba(120,110,88,0.6)');
      ctx.fillStyle = shade(color, 0.75); // the tattered royal fin
      K.ridge(-0.15, 0.25, 0.42, 4, -0.26);
      K.teeth(0.66, 0.15, 5, 0.12, 0.055);
      K.scar(0.1, -0.15, 0.38, 0.3);
      K.slitEye(0.6, -0.1);
      break;
    }
    case 'ghost': {
      ctx.globalAlpha = 0.55; // a leviathan made of drowned light
      K.body(s * 1.08, s * 0.58);
      ctx.globalAlpha = 1;
      K.marks(() => { // the ribcage, lit from inside
        ctx.strokeStyle = 'rgba(225,245,255,0.75)';
        ctx.lineWidth = s * 0.04;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(s * (0.25 - i * 0.24), -s * 0.32); ctx.lineTo(s * (0.31 - i * 0.24), s * 0.3);
          ctx.stroke();
        }
        const gg = ctx.createRadialGradient(s * 0.05, 0, 1, s * 0.05, 0, s * 0.5);
        gg.addColorStop(0, 'rgba(220,245,255,0.7)');
        gg.addColorStop(1, 'rgba(220,245,255,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(-s * 0.45, -s * 0.5, s * 1.1, s);
      });
      K.teeth(0.7, 0.2, 5, 0.11, 0.05);
      K.slitEye(0.66, -0.08, 0.14);
      break;
    }
    case 'choir': {
      ctx.fillStyle = K.bodyGrad(s * 0.55); // a faceted orb of spines
      ctx.beginPath();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * 6.29 + 0.35;
        const px = Math.cos(a) * s * 0.58, py = Math.sin(a) * s * 0.58;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = shade(color, 0.85); // the spines, some broken
      ctx.lineCap = 'round';
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * 6.29 + 0.1;
        const len = s * (i % 4 === 3 ? 0.72 : 1.02);
        ctx.lineWidth = s * 0.055;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5); ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.strokeStyle = shade(color, 1.5); // the inner ring, three eyes on it
      ctx.lineWidth = s * 0.04;
      ctx.beginPath(); ctx.arc(0, 0, s * 0.3, 0, 6.29); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const a = -0.5 + i * 0.55;
        ctx.save();
        ctx.translate(Math.cos(a) * s * 0.3, Math.sin(a) * s * 0.3);
        ctx.rotate(a + 1.57);
        K.slitEye(0, 0, 0.1);
        ctx.restore();
      }
      break;
    }
    case 'turtle': {
      ctx.fillStyle = K.bodyGrad(s * 0.66); // a faceted shell of plates
      ctx.beginPath();
      ctx.moveTo(-s * 0.78, s * 0.32); ctx.lineTo(-s * 0.62, -s * 0.28); ctx.lineTo(-s * 0.25, -s * 0.58);
      ctx.lineTo(s * 0.25, -s * 0.6); ctx.lineTo(s * 0.62, -s * 0.3); ctx.lineTo(s * 0.78, s * 0.3);
      ctx.lineTo(s * 0.4, s * 0.52); ctx.lineTo(-s * 0.4, s * 0.52); ctx.closePath(); ctx.fill();
      K.marks(() => { // plate seams
        ctx.strokeStyle = 'rgba(2,4,8,0.6)';
        ctx.lineWidth = s * 0.045;
        for (const px of [-0.34, 0.02, 0.38]) {
          ctx.beginPath();
          ctx.moveTo(px * s, -s * 0.52); ctx.lineTo((px - 0.05) * s, s * 0.46);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(-s * 0.7, s * 0.05); ctx.lineTo(s * 0.7, s * 0.05); ctx.stroke();
      });
      ctx.fillStyle = shade(color, 0.7);
      K.ridge(-0.62, 0.62, -0.55, 6, 0.12); // rim spikes
      K.scar(-0.15, -0.3, 0.4, 0.15); // a cracked, scarred plate
      ctx.fillStyle = K.bodyGrad(s * 0.2); // the head, and its hooked beak
      ctx.beginPath();
      ctx.moveTo(s * 0.68, -s * 0.08); ctx.lineTo(s * 0.95, -s * 0.14); ctx.lineTo(s * 1.08, s * 0.02);
      ctx.lineTo(s * 0.94, s * 0.1); ctx.lineTo(s * 1.0, s * 0.22); ctx.lineTo(s * 0.7, s * 0.26);
      ctx.closePath(); ctx.fill();
      K.slitEye(0.8, -0.02, 0.09);
      break;
    }
    case 'squid': {
      ctx.fillStyle = K.bodyGrad(s * 0.55); // a ridged, pointed mantle
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.95); ctx.lineTo(s * 0.3, -s * 0.4); ctx.lineTo(s * 0.42, s * 0.05);
      ctx.lineTo(s * 0.3, s * 0.32); ctx.lineTo(-s * 0.3, s * 0.32); ctx.lineTo(-s * 0.42, s * 0.05);
      ctx.lineTo(-s * 0.3, -s * 0.4); ctx.closePath(); ctx.fill();
      K.marks(() => { // mantle ridges
        ctx.strokeStyle = 'rgba(2,4,8,0.5)';
        ctx.lineWidth = s * 0.04;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-s * (0.3 - i * 0.05), -s * (0.55 - i * 0.22)); ctx.lineTo(s * (0.3 - i * 0.05), -s * (0.55 - i * 0.22));
          ctx.stroke();
        }
      });
      ctx.fillStyle = shade(color, 0.8); // the fins, jagged
      ctx.beginPath();
      ctx.moveTo(-s * 0.34, -s * 0.5); ctx.lineTo(-s * 0.62, -s * 0.28); ctx.lineTo(-s * 0.4, -s * 0.12);
      ctx.lineTo(-s * 0.58, s * 0.02); ctx.lineTo(-s * 0.32, -s * 0.05); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.34, -s * 0.5); ctx.lineTo(s * 0.62, -s * 0.28); ctx.lineTo(s * 0.4, -s * 0.12);
      ctx.lineTo(s * 0.58, s * 0.02); ctx.lineTo(s * 0.32, -s * 0.05); ctx.fill();
      ctx.strokeStyle = shade(color, 0.85); // the arms
      ctx.lineWidth = s * 0.11; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const fx = -s * 0.3 + i * s * 0.15;
        ctx.beginPath();
        ctx.moveTo(fx, s * 0.3); ctx.lineTo(fx + s * 0.12, s * 0.62); ctx.lineTo(fx - s * 0.04, s * 0.95);
        ctx.stroke();
      }
      K.speckle(7, -0.3, 0.3, -0.7, 0.1, 'rgba(240,220,210,0.4)');
      K.scar(0.05, -0.5, 0.3, 0.9);
      K.slitEye(-0.17, -0.12, 0.13);
      K.slitEye(0.17, -0.12, 0.13);
      break;
    }
    default:
      K.body(s, s * 0.5);
      K.teeth(0.68, 0.16, 4, 0.11, 0.06);
      K.slitEye(0.62, -0.08);
  }
  ctx.restore();
}

// The Mother Kraken: a ridged, scarred dome, heavy brows over slit-pupil
// eyes, a beak low between them, and five tentacles whose suckers are
// rings with depth. s is the dome radius.
export function drawKraken(ctx, x, y, s, t, color = '#07090f') {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const fx = -s * 0.92 + i * s * 0.46;
    const lean = Math.sin(t * 1.3 + i * 1.9) * s * 0.1;
    const h = s * (1.5 + 0.35 * Math.sin(i * 2.4));
    const cxp = fx + lean - s * 0.2;
    const x2 = fx + lean + (i < 2 ? -s * 0.34 : s * 0.3);
    ctx.lineWidth = s * 0.3 * (1 - i * 0.06);
    ctx.beginPath();
    ctx.moveTo(fx, s * 0.1); ctx.quadraticCurveTo(cxp, -h * 0.6, x2, -h); ctx.stroke();
    if (i >= 1 && i <= 3) { // a ridge of light down the outer edge
      ctx.strokeStyle = 'rgba(190,205,225,0.16)';
      ctx.lineWidth = Math.max(1.2, s * 0.035);
      ctx.beginPath();
      ctx.moveTo(fx - s * 0.1, s * 0.05); ctx.quadraticCurveTo(cxp - s * 0.12, -h * 0.6, x2 - s * 0.08, -h * 0.97);
      ctx.stroke();
      ctx.strokeStyle = color;
    }
    for (const tt of [0.35, 0.65]) { // suckers: rim, face, pit
      const bx = (1 - tt) * (1 - tt) * fx + 2 * (1 - tt) * tt * cxp + tt * tt * x2;
      const by = (1 - tt) * (1 - tt) * s * 0.1 + 2 * (1 - tt) * tt * -h * 0.6 + tt * tt * -h;
      const sr = s * 0.05 * (1 - tt * 0.4);
      ctx.fillStyle = 'rgba(30,16,14,0.8)';
      ctx.beginPath(); ctx.arc(bx + s * 0.07, by, sr * 1.25, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(238,205,192,0.6)';
      ctx.beginPath(); ctx.arc(bx + s * 0.07, by, sr, 0, 6.29); ctx.fill();
    }
  }
  const dg = ctx.createLinearGradient(0, -s, 0, s * 0.4);
  dg.addColorStop(0, '#1c2536');
  dg.addColorStop(0.6, color);
  dg.addColorStop(1, '#04060a');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(0, 0, s, 3.14, 6.29);
  ctx.quadraticCurveTo(0, s * 0.42, -s, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; // mantle ridges following the dome
  ctx.lineWidth = Math.max(1.4, s * 0.03);
  for (const rr of [0.75]) {
    ctx.beginPath(); ctx.arc(0, s * 0.08, s * rr, 3.5, 5.9); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(214,200,180,0.30)'; // skin speckle, fixed hash
  for (let i = 0; i < 7; i++) {
    const a = 3.3 + ((i * 2654435761) % 1000) / 1000 * 2.7;
    const rad = s * (0.25 + ((i * 40503) % 1000) / 1000 * 0.68);
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad * 0.82;
    if (py > -s * 0.06) continue;
    ctx.beginPath(); ctx.arc(px, py, Math.max(1, s * 0.016 * (1 + (i % 3) * 0.5)), 0, 6.29); ctx.fill();
  }
  ctx.fillStyle = 'rgba(226,214,190,0.5)'; // barnacle clusters
  for (const [bx, by] of [[-0.62, -0.5], [0.55, -0.68]]) {
    for (let j = 0; j < 3; j++) {
      ctx.beginPath(); ctx.arc((bx + j * 0.055) * s, (by + (j % 2) * 0.05) * s, Math.max(1.1, s * 0.02), 0, 6.29); ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(232,222,198,0.5)'; // two old harpoon wounds
  ctx.lineWidth = Math.max(1.2, s * 0.025);
  for (const [sx, sy, sl, sa] of [[-0.45, -0.62, 0.3, 0.4], [0.3, -0.45, 0.22, -0.3]]) {
    ctx.save();
    ctx.translate(sx * s, sy * s);
    ctx.rotate(sa);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(sl * s * 0.4, s * 0.02); ctx.lineTo(sl * s * 0.7, -s * 0.015); ctx.lineTo(sl * s, s * 0.02);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#0d0507'; // the beak: a dark hooked hint between the eyes
  ctx.beginPath();
  ctx.moveTo(-s * 0.13, -s * 0.1);
  ctx.quadraticCurveTo(0, s * 0.16, s * 0.13, -s * 0.1);
  ctx.quadraticCurveTo(0, s * 0.02, -s * 0.13, -s * 0.1);
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,190,160,0.35)';
  ctx.lineWidth = Math.max(1, s * 0.02);
  ctx.beginPath();
  ctx.moveTo(-s * 0.13, -s * 0.1); ctx.quadraticCurveTo(0, s * 0.16, s * 0.13, -s * 0.1); ctx.stroke();
  for (const d of [-0.36, 0.36]) { // the eyes, under heavy brows
    const ex = d * s, ey = -s * 0.34;
    ctx.fillStyle = 'rgba(255,59,48,0.20)'; // a flat ember-glow behind the eye
    ctx.beginPath(); ctx.ellipse(ex, ey + s * 0.02, s * 0.19, s * 0.12, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#0a0d14'; // the brow: a heavy angled shelf of flesh
    ctx.beginPath();
    ctx.moveTo(ex - s * 0.17, ey - s * 0.1); ctx.lineTo(ex + s * 0.17, ey - s * 0.16);
    ctx.lineTo(ex + s * 0.15, ey - s * 0.02); ctx.lineTo(ex - s * 0.15, ey + s * 0.03);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff3b30'; // the almond
    ctx.beginPath();
    ctx.moveTo(ex - s * 0.11, ey + s * 0.03);
    ctx.quadraticCurveTo(ex, ey - s * 0.075, ex + s * 0.11, ey + s * 0.03);
    ctx.quadraticCurveTo(ex, ey + s * 0.1, ex - s * 0.11, ey + s * 0.03);
    ctx.fill();
    ctx.fillStyle = '#0d0405'; // the slit
    ctx.beginPath(); ctx.ellipse(ex, ey + s * 0.03, s * 0.022, s * 0.055, 0, 0, 6.29); ctx.fill();
  }
  ctx.restore();
}
