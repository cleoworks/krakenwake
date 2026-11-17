// shapes2.js — one job: the Maw monsters and the Mother Kraken herself,
// creature-poster style: angular, scarred, slit-eyed. See shapes.js.
import { shade, makeKit, drawLimb } from './geom.js';

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
      ctx.fillStyle = K.bodyGrad(s * 0.66); // a shell whose rim is a sawtooth of spikes
      ctx.beginPath();
      ctx.moveTo(-s * 0.94, s * 0.14); ctx.lineTo(-s * 0.78, s * 0.32); ctx.lineTo(-s * 0.68, -s * 0.14);
      ctx.lineTo(-s * 0.56, -s * 0.5); ctx.lineTo(-s * 0.42, -s * 0.34); ctx.lineTo(-s * 0.26, -s * 0.6);
      ctx.lineTo(-s * 0.08, -s * 0.42); ctx.lineTo(s * 0.1, -s * 0.62); ctx.lineTo(s * 0.26, -s * 0.44);
      ctx.lineTo(s * 0.44, -s * 0.56); ctx.lineTo(s * 0.6, -s * 0.28); ctx.lineTo(s * 0.84, -s * 0.38);
      ctx.lineTo(s * 0.76, -s * 0.04); ctx.lineTo(s * 0.78, s * 0.3);
      ctx.lineTo(s * 0.4, s * 0.52); ctx.lineTo(-s * 0.4, s * 0.52); ctx.closePath(); ctx.fill();
      K.marks(() => { // plate seams
        ctx.strokeStyle = 'rgba(2,4,8,0.6)';
        ctx.lineWidth = s * 0.045;
        for (const px of [-0.34, 0.02, 0.38]) {
          ctx.beginPath();
          ctx.moveTo(px * s, -s * 0.34); ctx.lineTo((px - 0.05) * s, s * 0.46);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(-s * 0.7, s * 0.05); ctx.lineTo(s * 0.7, s * 0.05); ctx.stroke();
      });
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
      ctx.fillStyle = K.bodyGrad(s * 0.55); // a ridged mantle with a hooked point
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 1.14); ctx.lineTo(s * 0.34, -s * 0.42); ctx.lineTo(s * 0.44, s * 0.05);
      ctx.lineTo(s * 0.3, s * 0.32); ctx.lineTo(-s * 0.3, s * 0.32); ctx.lineTo(-s * 0.44, s * 0.05);
      ctx.lineTo(-s * 0.32, -s * 0.44); ctx.lineTo(-s * 0.14, -s * 0.58); ctx.closePath(); ctx.fill();
      K.marks(() => { // mantle ridges
        ctx.strokeStyle = 'rgba(2,4,8,0.5)';
        ctx.lineWidth = s * 0.04;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-s * (0.3 - i * 0.05), -s * (0.55 - i * 0.22)); ctx.lineTo(s * (0.3 - i * 0.05), -s * (0.55 - i * 0.22));
          ctx.stroke();
        }
      });
      ctx.fillStyle = shade(color, 0.8); // the fins, deeply notched
      ctx.beginPath();
      ctx.moveTo(-s * 0.36, -s * 0.52); ctx.lineTo(-s * 0.66, -s * 0.34); ctx.lineTo(-s * 0.44, -s * 0.2);
      ctx.lineTo(-s * 0.64, -s * 0.08); ctx.lineTo(-s * 0.42, 0); ctx.lineTo(-s * 0.58, s * 0.1);
      ctx.lineTo(-s * 0.34, s * 0.02); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.36, -s * 0.52); ctx.lineTo(s * 0.66, -s * 0.34); ctx.lineTo(s * 0.44, -s * 0.2);
      ctx.lineTo(s * 0.64, -s * 0.08); ctx.lineTo(s * 0.42, 0); ctx.lineTo(s * 0.58, s * 0.1);
      ctx.lineTo(s * 0.34, s * 0.02); ctx.fill();
      ctx.strokeStyle = shade(color, 0.85); // the arms, uneven, curling
      ctx.lineWidth = s * 0.11; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const fx = -s * 0.3 + i * s * 0.15;
        const reach = s * (i === 2 ? 1.06 : i % 2 ? 0.92 : 0.78);
        const curl = (i % 2 ? -1 : 1) * s * 0.09;
        ctx.beginPath();
        ctx.moveTo(fx, s * 0.3); ctx.lineTo(fx + s * 0.12, s * 0.3 + reach * 0.55); ctx.lineTo(fx + curl, s * 0.3 + reach);
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

// The Mother Kraken — no dome any more. An asymmetric mantle with a
// pointed, ridged crown leaning toward the hunter, segmentation flowing
// down her left flank, a scowling face (brow shelves over slit-pupil
// eyes, cheek planes tapering to a beak) and five tapered limbs rising
// behind her, suckers down their inner faces. s is the mantle scale;
// maw runs 0 (beak shut) to 1 (gape open, when she thrashes).
export function drawKraken(ctx, x, y, s, t, color = '#07090f', maw = 0) {
  ctx.save();
  ctx.translate(x, y);
  const limbs = [ // spine cubics + base width + sucker side, per limb
    [-0.78, 0.30, -1.08, -0.55, -0.70, -1.28, -1.04, -1.60, 0.30, 1], [-0.42, 0.32, -0.58, -0.60, -0.26, -1.08, -0.46, -1.40, 0.27, 1],
    [-0.04, 0.32, 0.04, -0.70, -0.14, -1.30, 0.08, -1.68, 0.30, 1], [0.36, 0.32, 0.52, -0.55, 0.32, -1.02, 0.60, -1.32, 0.27, -1],
    [0.74, 0.30, 0.98, -0.50, 0.76, -1.12, 1.06, -1.44, 0.28, -1],
  ];
  for (let i = 0; i < 5; i++) {
    const L = limbs[i], sw = Math.sin(t * 1.3 + i * 1.9) * s * 0.07;
    drawLimb(ctx, [L[0] * s, L[1] * s, L[2] * s, L[3] * s, L[4] * s + sw, L[5] * s, L[6] * s + sw * 1.5, L[7] * s], L[8] * s, s * 0.055, color, L[9], 3);
  }
  const dg = ctx.createLinearGradient(0, -s * 1.2, 0, s * 0.5);
  dg.addColorStop(0, '#1e2839');
  dg.addColorStop(0.55, color);
  dg.addColorStop(1, '#04060a');
  ctx.fillStyle = dg;
  ctx.beginPath(); // the mantle: flank swells, crown, valley, rear spike
  ctx.moveTo(-s * 1.00, s * 0.30);
  ctx.quadraticCurveTo(-s * 1.10, s * 0.12, -s * 1.03, -s * 0.10);
  ctx.quadraticCurveTo(-s * 1.06, -s * 0.30, -s * 0.94, -s * 0.48);
  ctx.quadraticCurveTo(-s * 0.86, -s * 0.72, -s * 0.62, -s * 0.94);
  ctx.lineTo(-s * 0.38, -s * 1.24); // the crown tip, leaning at the hunter
  ctx.quadraticCurveTo(-s * 0.22, -s * 0.98, -s * 0.06, -s * 0.92);
  ctx.lineTo(s * 0.16, -s * 1.05); // the lesser rear spike
  ctx.quadraticCurveTo(s * 0.52, -s * 0.86, s * 0.78, -s * 0.55);
  ctx.quadraticCurveTo(s * 1.00, -s * 0.28, s * 1.00, s * 0.30);
  ctx.quadraticCurveTo(0, s * 0.55, -s * 1.00, s * 0.30); // the submerged skirt
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,205,225,0.20)'; // rim light over the crown
  ctx.lineWidth = Math.max(1.2, s * 0.028);
  ctx.beginPath();
  ctx.moveTo(-s * 1.03, -s * 0.10);
  ctx.quadraticCurveTo(-s * 0.86, -s * 0.72, -s * 0.62, -s * 0.94);
  ctx.lineTo(-s * 0.38, -s * 1.24);
  ctx.moveTo(s * 0.16, -s * 1.05);
  ctx.quadraticCurveTo(s * 0.52, -s * 0.86, s * 0.78, -s * 0.55);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; // mantle ridges, crown to flank
  ctx.lineWidth = Math.max(1.4, s * 0.03);
  for (const [a, b, c, d, e, f2] of [[-0.30, -1.02, -0.55, -0.80, -0.78, -0.42], [-0.16, -0.84, -0.38, -0.58, -0.60, -0.16], [0.24, -0.80, 0.50, -0.58, 0.68, -0.24]]) {
    ctx.beginPath(); ctx.moveTo(a * s, b * s); ctx.quadraticCurveTo(c * s, d * s, e * s, f2 * s); ctx.stroke();
  }
  for (const [a, b] of [[-0.97, -0.22], [-0.90, 0.02], [-0.82, -0.44]]) { // segment ticks
    ctx.beginPath(); ctx.moveTo(a * s, b * s); ctx.lineTo((a + 0.16) * s, (b + 0.05) * s); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(214,200,180,0.30)'; // skin speckle, placed on the mass
  for (const [px, py, pr] of [[-0.55, -0.80, 0.020], [-0.30, -0.62, 0.016], [-0.72, -0.52, 0.024], [0.05, -0.70, 0.016], [0.42, -0.60, 0.020], [-0.12, -0.40, 0.014], [0.62, -0.34, 0.016]]) {
    ctx.beginPath(); ctx.arc(px * s, py * s, Math.max(0.9, pr * s), 0, 6.29); ctx.fill();
  }
  ctx.fillStyle = 'rgba(226,214,190,0.5)'; // barnacle clusters
  for (const [bx, by] of [[-0.50, -0.90], [0.60, -0.50]]) {
    for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc((bx + j * 0.055) * s, (by + (j % 2) * 0.05) * s, Math.max(1.1, s * 0.02), 0, 6.29); ctx.fill(); }
  }
  ctx.strokeStyle = 'rgba(232,222,198,0.5)'; // two old harpoon wounds
  ctx.lineWidth = Math.max(1.2, s * 0.025);
  for (const [sx, sy, sl, sa] of [[-0.66, -0.66, 0.3, 0.5], [0.3, -0.42, 0.22, -0.3]]) {
    ctx.save(); ctx.translate(sx * s, sy * s); ctx.rotate(sa);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(sl * s * 0.4, s * 0.02); ctx.lineTo(sl * s * 0.7, -s * 0.015); ctx.lineTo(sl * s, s * 0.02);
    ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.32)'; // cheek planes tapering to the beak
  for (const d of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(d * s * 0.52, -s * 0.06); ctx.lineTo(d * s * 0.20, -s * 0.02);
    ctx.lineTo(d * s * 0.09, s * 0.20); ctx.lineTo(d * s * 0.34, s * 0.26);
    ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'; // the jaw edges
  ctx.lineWidth = Math.max(1.2, s * 0.028);
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * s * 0.55, -s * 0.10); ctx.quadraticCurveTo(d * s * 0.34, s * 0.16, d * s * 0.12, s * 0.24); ctx.stroke(); }
  for (const d of [-0.36, 0.36]) { // the eyes, under heavy brows
    const ex = d * s, ey = -s * 0.32;
    ctx.fillStyle = 'rgba(255,59,48,0.20)'; // a flat ember-glow behind the eye
    ctx.beginPath(); ctx.ellipse(ex, ey + s * 0.02, s * 0.19, s * 0.12, 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#0a0d14'; // the brow: a heavy angled shelf of flesh
    ctx.beginPath();
    ctx.moveTo(ex - s * 0.17, ey - s * 0.1); ctx.lineTo(ex + s * 0.17, ey - s * 0.16);
    ctx.lineTo(ex + s * 0.15, ey - s * 0.02); ctx.lineTo(ex - s * 0.15, ey + s * 0.03);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(190,205,225,0.22)'; // the brow's top edge catches the moon
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath(); ctx.moveTo(ex - s * 0.17, ey - s * 0.10); ctx.lineTo(ex + s * 0.17, ey - s * 0.16); ctx.stroke();
    ctx.fillStyle = '#ff3b30'; // the almond
    ctx.beginPath();
    ctx.moveTo(ex - s * 0.11, ey + s * 0.03);
    ctx.quadraticCurveTo(ex, ey - s * 0.075, ex + s * 0.11, ey + s * 0.03);
    ctx.quadraticCurveTo(ex, ey + s * 0.1, ex - s * 0.11, ey + s * 0.03);
    ctx.fill();
    ctx.fillStyle = '#0d0405'; // the slit
    ctx.beginPath(); ctx.ellipse(ex, ey + s * 0.03, s * 0.022, s * 0.055, 0, 0, 6.29); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; // the scowl crease between the brows
  ctx.lineWidth = Math.max(1.2, s * 0.03); ctx.beginPath(); ctx.moveTo(-s * 0.10, -s * 0.45); ctx.lineTo(0, -s * 0.40); ctx.lineTo(s * 0.10, -s * 0.45); ctx.stroke();
  if (maw > 0.02) { // the gape: dark, with an ember deep in it
    ctx.fillStyle = '#140309';
    ctx.beginPath(); ctx.ellipse(0, s * 0.09, s * 0.135, s * (0.02 + maw * 0.12), 0, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgba(150,30,20,0.45)';
    ctx.beginPath(); ctx.ellipse(0, s * 0.10, s * 0.07, s * (0.01 + maw * 0.055), 0, 0, 6.29); ctx.fill();
  }
  const lift = maw * s * 0.07, drop = maw * s * 0.10;
  ctx.fillStyle = '#171009'; // the upper beak: a hooked bill, lifting as she gapes
  ctx.beginPath(); ctx.moveTo(-s * 0.155, -s * 0.015 - lift);
  ctx.quadraticCurveTo(0, s * 0.115 - lift, s * 0.155, -s * 0.015 - lift); ctx.quadraticCurveTo(0, s * 0.03 - lift, -s * 0.155, -s * 0.015 - lift);
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,190,160,0.4)';
  ctx.lineWidth = Math.max(1, s * 0.018);
  ctx.beginPath(); ctx.moveTo(-s * 0.155, -s * 0.015 - lift); ctx.quadraticCurveTo(0, s * 0.115 - lift, s * 0.155, -s * 0.015 - lift); ctx.stroke();
  ctx.fillStyle = '#100b06'; // the lower beak: a smaller point, dropping away
  ctx.beginPath(); ctx.moveTo(-s * 0.105, s * 0.085 + drop);
  ctx.quadraticCurveTo(0, s * 0.20 + drop, s * 0.105, s * 0.085 + drop); ctx.quadraticCurveTo(0, s * 0.125 + drop, -s * 0.105, s * 0.085 + drop);
  ctx.fill();
  ctx.restore();
}
