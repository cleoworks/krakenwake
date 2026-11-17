// shapes.js — one job: draw the monsters, creature-poster style. Angular
// silhouettes, 3-step value shading, teeth, scars, speckle — nothing
// round, nothing cute. This file holds the Shoal and Deep species; the
// Maw set lives in shapes2.js and the King Wyrm in wyrm.js.
import { shade, makeKit } from '../geom.js';
import { drawDeepShape } from './shapes2.js';
import { drawWyrmGlyph } from './wyrm.js';

const DEEP = new Set(['shark', 'king', 'ghost', 'choir', 'turtle', 'squid']);

export function drawFishShape(ctx, shape, x, y, s, color, eye = '#ffd94d') {
  if (shape === 'wyrm') {
    drawWyrmGlyph(ctx, x, y, s, color, eye);
    return;
  }
  if (DEEP.has(shape)) {
    drawDeepShape(ctx, shape, x, y, s, color, eye);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const K = makeKit(ctx, s, color, eye);
  switch (shape) {
    case 'eel': {
      // a long angular ribbon: serrated spine ridge, a jaw full of needles
      ctx.fillStyle = K.bodyGrad(s * 0.3);
      ctx.beginPath();
      ctx.moveTo(-s * 1.15, s * 0.06);
      ctx.lineTo(-s * 0.6, -s * 0.16);
      ctx.lineTo(-s * 0.05, -s * 0.2);
      ctx.lineTo(s * 0.42, -s * 0.16);
      ctx.lineTo(s * 0.78, -s * 0.3); // the skull, raised
      ctx.lineTo(s * 1.12, -s * 0.1); // snout tip
      ctx.lineTo(s * 0.8, s * 0.02);
      ctx.lineTo(s * 0.86, s * 0.3); // the lower jaw, dropped open
      ctx.lineTo(s * 0.45, s * 0.2);
      ctx.lineTo(-s * 0.1, s * 0.24);
      ctx.lineTo(-s * 0.7, s * 0.22);
      ctx.lineTo(-s * 1.18, s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(color, 0.7);
      K.ridge(-0.62, 0.4, -0.2, 6, 0.13); // the serrated spine
      K.teeth(0.84, 0.03, 4, 0.13, 0.055); // needle teeth on the dropped jaw
      K.teeth(0.86, -0.11, 3, 0.1, 0.055);
      K.speckle(7, -0.7, 0.5, -0.12, 0.14);
      K.gills(-0.25, 0.02, 4, 0.3); // body segmentation down the ribbon
      K.scar(-0.55, -0.05, 0.3, 0.15);
      K.slitEye(0.8, -0.2, 0.1);
      break;
    }
    case 'crab': {
      // a spiked carapace, plate seams, one claw grown monstrous
      ctx.fillStyle = K.bodyGrad(s * 0.55);
      ctx.beginPath();
      ctx.moveTo(-s * 0.72, s * 0.3);
      ctx.lineTo(-s * 0.78, -s * 0.18);
      ctx.lineTo(-s * 0.4, -s * 0.52);
      ctx.lineTo(0, -s * 0.62);
      ctx.lineTo(s * 0.42, -s * 0.54);
      ctx.lineTo(s * 0.78, -s * 0.2);
      ctx.lineTo(s * 0.72, s * 0.3);
      ctx.lineTo(s * 0.3, s * 0.48);
      ctx.lineTo(-s * 0.3, s * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(color, 0.68);
      K.ridge(-0.72, 0.72, -0.56, 7, 0.14); // the spiked rim
      K.marks(() => { // plate seams
        ctx.strokeStyle = 'rgba(2,4,8,0.6)';
        ctx.lineWidth = s * 0.045;
        for (const px of [-0.34, 0.02, 0.38]) {
          ctx.beginPath();
          ctx.moveTo(px * s, -s * 0.5);
          ctx.lineTo((px - 0.06) * s, s * 0.42);
          ctx.stroke();
        }
      });
      K.speckle(6, -0.5, 0.5, -0.4, 0.1, 'rgba(226,214,190,0.5)'); // barnacles
      K.speckle(5, -0.6, 0.6, 0.15, 0.4, 'rgba(8,10,14,0.45)'); // pitted plates
      // legs: three spiked struts a side, bent hard
      ctx.strokeStyle = shade(color, 0.8);
      ctx.lineWidth = s * 0.11;
      ctx.lineCap = 'round';
      for (const d of [-1, 1]) for (let l = 0; l < 3; l++) {
        ctx.beginPath();
        ctx.moveTo(d * s * (0.3 + l * 0.16), s * 0.32);
        ctx.lineTo(d * s * (0.62 + l * 0.14), s * 0.55);
        ctx.lineTo(d * s * (0.78 + l * 0.13), s * 0.92);
        ctx.stroke();
      }
      // the oversized claw, right side: a toothed pincer, scarred knuckle
      ctx.fillStyle = K.bodyGrad(s * 0.4);
      ctx.beginPath();
      ctx.moveTo(s * 0.55, -s * 0.05);
      ctx.lineTo(s * 0.95, -s * 0.42);
      ctx.lineTo(s * 1.18, -s * 0.3);
      ctx.lineTo(s * 0.98, -s * 0.08);
      ctx.lineTo(s * 1.22, s * 0.1);
      ctx.lineTo(s * 0.9, s * 0.3);
      ctx.lineTo(s * 0.6, s * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(color, 0.8); // the lesser claw
      ctx.beginPath();
      ctx.moveTo(-s * 0.55, 0);
      ctx.lineTo(-s * 0.88, -s * 0.22);
      ctx.lineTo(-s * 0.98, -s * 0.05);
      ctx.lineTo(-s * 0.7, s * 0.14);
      ctx.closePath();
      ctx.fill();
      K.scar(0.62, -0.2, 0.3, 0.5);
      K.slitEye(-0.18, -0.3, 0.09);
      K.slitEye(0.2, -0.32, 0.09);
      break;
    }
    case 'sail': {
      K.body(s, s * 0.46);
      // the sail: a jagged fan of spines with a torn notch in its edge
      ctx.fillStyle = shade(color, 0.9);
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.36);
      ctx.lineTo(-s * 0.12, -s * 0.95);
      ctx.lineTo(s * 0.05, -s * 0.62);
      ctx.lineTo(s * 0.2, -s * 1.3);
      ctx.lineTo(s * 0.34, -s * 0.8);
      ctx.lineTo(s * 0.44, -s * 1.05); // the torn spike, shorter than its pair
      ctx.lineTo(s * 0.56, -s * 0.34);
      ctx.closePath();
      ctx.fill();
      K.marks(() => { // sail rays
        ctx.strokeStyle = 'rgba(2,4,8,0.5)';
        ctx.lineWidth = s * 0.04;
        for (const [rx, ry] of [[-0.12, -0.9], [0.2, -1.22], [0.44, -0.98]]) {
          ctx.beginPath();
          ctx.moveTo(s * 0.05, -s * 0.34);
          ctx.lineTo(rx * s, ry * s);
          ctx.stroke();
        }
      });
      ctx.fillStyle = shade(color, 0.75); // pectoral fin, spined
      K.ridge(0.05, 0.4, 0.42, 3, -0.3);
      K.gills(0.42, -0.05, 3, 0.4);
      K.speckle(6, -0.5, 0.3, -0.25, 0.2, 'rgba(235,240,250,0.35)'); // scale sheen
      K.teeth(0.68, 0.14, 4, 0.12, 0.06);
      K.scar(-0.15, -0.05, 0.42, 0.25);
      K.slitEye(0.6, -0.12);
      break;
    }
    case 'whale': {
      K.body(s * 1.12, s * 0.7);
      K.marks(() => { // ribcage grooves showing through the flank
        ctx.strokeStyle = 'rgba(2,4,8,0.5)';
        ctx.lineWidth = s * 0.05;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(s * (0.3 - i * 0.22), -s * 0.3);
          ctx.lineTo(s * (0.36 - i * 0.22), s * 0.34);
          ctx.stroke();
        }
      });
      // the jaw: a separate mandible slung under the head, seamed dark
      ctx.fillStyle = shade(color, 0.72);
      ctx.beginPath();
      ctx.moveTo(s * 1.06, s * 0.02); ctx.lineTo(s * 0.7, s * 0.36); ctx.lineTo(s * 0.28, s * 0.47);
      ctx.lineTo(s * 0.55, s * 0.1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(2,4,8,0.65)';
      ctx.lineWidth = s * 0.045;
      ctx.beginPath(); ctx.moveTo(s * 1.04, 0); ctx.lineTo(s * 0.32, s * 0.42); ctx.stroke();
      K.marks(() => { // the ribbed throat: pleats under the jaw, bowed with the belly
        ctx.strokeStyle = 'rgba(2,4,8,0.6)';
        ctx.lineWidth = s * 0.04;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo((0.78 - i * 0.13) * s, (0.32 + i * 0.05) * s);
          ctx.quadraticCurveTo((0.45 - i * 0.12) * s, (0.54 + i * 0.02) * s, (0.16 - i * 0.08) * s, (0.46 + i * 0.03) * s);
          ctx.stroke();
        }
      });
      K.speckle(10, 0.1, 0.95, -0.5, -0.1, 'rgba(228,220,196,0.55)'); // barnacle crown
      K.speckle(6, -0.7, 0.0, -0.3, 0.2, 'rgba(12,16,22,0.5)'); // rot patches aft
      K.scar(-0.3, 0.05, 0.55, -0.15); // an old harpoon wound
      K.teeth(0.68, 0.27, 5, 0.1, 0.055);
      K.slitEye(0.68, -0.08, 0.11);
      break;
    }
    case 'monk': {
      // a wide flat head, a mouth like a trap, the lure above it
      ctx.fillStyle = K.bodyGrad(s * 0.55);
      ctx.beginPath();
      ctx.moveTo(-s * 0.85, s * 0.25);
      ctx.lineTo(-s * 0.7, -s * 0.3);
      ctx.lineTo(-s * 0.2, -s * 0.52);
      ctx.lineTo(s * 0.35, -s * 0.55);
      ctx.lineTo(s * 0.85, -s * 0.25);
      ctx.lineTo(s * 0.95, s * 0.15);
      ctx.lineTo(s * 0.5, s * 0.45);
      ctx.lineTo(-s * 0.4, s * 0.45);
      ctx.closePath();
      ctx.fill();
      K.body(s * 0.72, s * 0.34); // the body trailing behind the head
      ctx.strokeStyle = 'rgba(2,4,8,0.65)'; // the mouth: a dark trap arc
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.arc(s * 0.42, s * 0.02, s * 0.34, 0.3, 2.6);
      ctx.stroke();
      K.teeth(0.2, 0.3, 5, 0.11, 0.07, false); // teeth ring the lower lip
      K.marks(() => { // the lure stalk and its cold light
        ctx.strokeStyle = shade(color, 0.7);
        ctx.lineWidth = s * 0.045;
        ctx.beginPath();
        ctx.moveTo(s * 0.3, -s * 0.45);
        ctx.quadraticCurveTo(s * 0.55, -s * 0.85, s * 0.82, -s * 0.78);
        ctx.stroke();
        const lg = ctx.createRadialGradient(s * 0.84, -s * 0.76, 1, s * 0.84, -s * 0.76, s * 0.3);
        lg.addColorStop(0, 'rgba(190,240,255,0.85)');
        lg.addColorStop(1, 'rgba(190,240,255,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(s * 0.54, -s * 1.06, s * 0.6, s * 0.6);
        ctx.fillStyle = '#dff4ff';
        ctx.beginPath();
        ctx.arc(s * 0.84, -s * 0.76, s * 0.07, 0, 6.29);
        ctx.fill();
      });
      K.speckle(8, -0.5, 0.4, -0.4, 0.2, 'rgba(10,14,20,0.5)');
      K.speckle(5, -0.6, 0.3, -0.45, -0.1, 'rgba(235,228,205,0.5)'); // wart crust
      K.scar(0.55, -0.3, 0.3, 0.4);
      K.slitEye(0.3, -0.34, 0.11);
      K.slitEye(0.62, -0.36, 0.11);
      break;
    }
    case 'witch': {
      K.body(s, s * 0.44);
      // ragged weed-tendrils trailing below, motes hanging off them
      ctx.strokeStyle = shade(color, 0.75);
      ctx.lineWidth = s * 0.09;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const bx = -s * 0.35 + i * s * 0.26;
        ctx.beginPath();
        ctx.moveTo(bx, s * 0.32);
        ctx.lineTo(bx + s * 0.1, s * 0.68);
        ctx.lineTo(bx - s * 0.04, s * 1.02);
        ctx.stroke();
      }
      K.marks(() => {
        ctx.fillStyle = '#d8ffd0';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(-s * 0.39 + i * s * 0.26, s * 1.04, s * 0.06, 0, 6.29);
          ctx.fill();
        }
      });
      ctx.fillStyle = shade(color, 0.8);
      K.ridge(-0.5, 0.3, -0.42, 5, 0.12);
      K.speckle(6, -0.6, 0.4, -0.2, 0.25, 'rgba(216,255,208,0.35)'); // glow-motes in the weed
      K.scar(-0.3, 0.1, 0.35, -0.3);
      K.teeth(0.7, 0.12, 4, 0.11, 0.055);
      K.slitEye(0.6, -0.1);
      break;
    }
    default:
      K.body(s, s * 0.5);
      K.teeth(0.68, 0.16, 4, 0.11, 0.06);
      K.slitEye(0.62, -0.08);
  }
  ctx.restore();
}
