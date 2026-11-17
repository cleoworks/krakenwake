// shapes2.js — one job: the deep-sea monsters of the Wyrm's Maw,
// creature-poster style: angular, scarred, slit-eyed. See shapes.js.
// (The King Wyrm himself lives in wyrm.js.)
import { shade, makeKit, drawLimb } from '../geom.js';

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
      K.gills(-0.05, 0.05, 3, 0.3); // armored flank plates behind the gills
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
      K.gills(0.05, 0.12, 3, 0.34); // segmented shell plates
      K.speckle(5, 0.3, 0.7, 0.1, 0.3, 'rgba(230,222,196,0.7)'); // barnacles
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
      K.speckle(6, -0.5, 0.1, -0.35, 0.0, 'rgba(226,220,192,0.75)'); // barnacle crust
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
      K.speckle(6, -0.25, 0.25, -0.4, -0.05, 'rgba(20,10,16,0.45)'); // pitted mantle scales
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
