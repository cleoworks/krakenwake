// shapes.js — one job: draw the monsters. Per-species silhouettes built
// from canvas paths — gradient bodies, fin rays, shell marks, spots. This
// file holds the Widow's Shoal species; the deep-water set and the Mother
// Kraken live in shapes2.js. render.js puts them in the water; camp.js puts
// them in the bestiary grid.
import { shade, makeKit } from './geom.js';
import { drawDeepShape } from './shapes2.js';

const DEEP = new Set(['shark', 'king', 'ghost', 'choir', 'turtle', 'squid']);

export function drawFishShape(ctx, shape, x, y, s, color, eye = '#ffd94d') {
  if (DEEP.has(shape)) {
    drawDeepShape(ctx, shape, x, y, s, color, eye);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const { bodyGrad, body, eyeDot, marks } = makeKit(ctx, s, color, eye);
  switch (shape) {
    case 'eel':
      ctx.lineWidth = s * 0.34;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.quadraticCurveTo(-s * 0.3, -s * 0.5, s * 0.2, 0);
      ctx.quadraticCurveTo(s * 0.7, s * 0.4, s, -s * 0.1);
      ctx.stroke();
      marks(() => { // pale bands along the body
        ctx.strokeStyle = '#eafff5';
        ctx.lineWidth = s * 0.07;
        for (const bx of [-0.45, 0.05, 0.5]) {
          ctx.beginPath();
          ctx.moveTo(bx * s, -s * 0.16);
          ctx.lineTo(bx * s + s * 0.12, s * 0.14);
          ctx.stroke();
        }
      });
      eyeDot(0.82, -0.12);
      break;
    case 'crab':
      ctx.fillStyle = bodyGrad(s * 0.62);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.62, 0, 6.29);
      ctx.fill();
      ctx.fillStyle = color;
      marks(() => { // shell arcs
        ctx.strokeStyle = shade(color, 0.5);
        ctx.lineWidth = s * 0.06;
        for (const r of [0.42, 0.26]) {
          ctx.beginPath();
          ctx.arc(0, s * 0.08, s * r, 3.4, 5.9);
          ctx.stroke();
        }
      });
      ctx.lineWidth = s * 0.13;
      for (const d of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(d * s * 0.85, -s * 0.4, s * 0.3, 0, 6.29);
        ctx.stroke();
        for (let l = 0; l < 3; l++) {
          ctx.beginPath();
          ctx.moveTo(d * s * 0.4, s * 0.4);
          ctx.lineTo(d * s * (0.7 + l * 0.18), s * 0.85);
          ctx.stroke();
        }
      }
      eyeDot(-0.2, -0.25);
      eyeDot(0.2, -0.25);
      break;
    case 'sail':
      body(s, s * 0.5);
      ctx.fillStyle = shade(color, 1.15);
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, -s * 0.4);
      ctx.lineTo(s * 0.25, -s * 1.25);
      ctx.lineTo(s * 0.5, -s * 0.35);
      ctx.fill();
      marks(() => { // the sail membrane, translucent between the fin's rays
        ctx.fillStyle = shade(color, 1.5);
        ctx.globalAlpha *= 0.5;
        ctx.beginPath();
        ctx.moveTo(-s * 0.14, -s * 0.42);
        ctx.lineTo(s * 0.26, -s * 1.14);
        ctx.lineTo(s * 0.44, -s * 0.4);
        ctx.quadraticCurveTo(s * 0.15, -s * 0.62, -s * 0.14, -s * 0.42);
        ctx.fill();
      });
      marks(() => { // fin rays
        ctx.strokeStyle = shade(color, 0.45);
        ctx.lineWidth = s * 0.05;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(s * (0.02 + i * 0.1), -s * 0.42);
          ctx.lineTo(s * (0.22 + i * 0.08), -s * (1.05 - i * 0.18));
          ctx.stroke();
        }
      });
      eyeDot(0.62, -0.1);
      break;
    case 'whale':
      body(s * 1.1, s * 0.72);
      marks(() => { // belly grooves
        ctx.strokeStyle = shade(color, 0.55);
        ctx.lineWidth = s * 0.05;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(s * (0.35 - i * 0.16), s * 0.62, s * (0.3 + i * 0.05), 3.5, 5.6);
          ctx.stroke();
        }
      });
      eyeDot(0.7, 0.05);
      break;
    case 'monk':
      ctx.fillStyle = bodyGrad(s * 0.62);
      ctx.beginPath();
      ctx.arc(s * 0.25, 0, s * 0.62, 0, 6.29);
      ctx.fill();
      ctx.fillStyle = color;
      body(s * 0.8, s * 0.4);
      marks(() => { // a pox of dark spots
        ctx.fillStyle = shade(color, 0.5);
        for (const [px, py, pr] of [[0.05, -0.3, 0.09], [0.42, -0.18, 0.07], [0.3, 0.22, 0.08], [-0.12, 0.12, 0.06]]) {
          ctx.beginPath();
          ctx.arc(px * s, py * s, pr * s, 0, 6.29);
          ctx.fill();
        }
      });
      marks(() => { // the lantern lure: a stalk over the head, a light at its end
        ctx.strokeStyle = shade(color, 0.7);
        ctx.lineWidth = s * 0.045;
        ctx.beginPath();
        ctx.moveTo(s * 0.42, -s * 0.42);
        ctx.quadraticCurveTo(s * 0.62, -s * 0.78, s * 0.86, -s * 0.72);
        ctx.stroke();
        const lg = ctx.createRadialGradient(s * 0.88, -s * 0.7, 1, s * 0.88, -s * 0.7, s * 0.34);
        lg.addColorStop(0, 'rgba(190,240,255,0.85)');
        lg.addColorStop(1, 'rgba(190,240,255,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(s * 0.54, -s * 1.04, s * 0.68, s * 0.68);
        ctx.fillStyle = '#dff4ff';
        ctx.beginPath();
        ctx.arc(s * 0.88, -s * 0.7, s * 0.075, 0, 6.29);
        ctx.fill();
      });
      eyeDot(0.45, -0.18, 0.13);
      break;
    case 'witch':
      body(s, s * 0.45);
      ctx.lineWidth = s * 0.1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-s * 0.2 + i * s * 0.3, s * 0.35);
        ctx.quadraticCurveTo(-s * 0.1 + i * s * 0.3, s * 0.9, -s * 0.3 + i * s * 0.3, s * 1.05);
        ctx.stroke();
      }
      marks(() => { // glow-motes hanging off the tendrils
        ctx.fillStyle = '#d8ffd0';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(-s * 0.3 + i * s * 0.3, s * 1.05, s * 0.07, 0, 6.29);
          ctx.fill();
        }
      });
      eyeDot(0.62, -0.08);
      break;
    default:
      body(s, s * 0.5);
      eyeDot(0.62, -0.08);
  }
  ctx.restore();
}
