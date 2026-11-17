// shapes2.js — one job: the deep-water monsters (the Drowning Deep's worst
// and everything in the Maw) plus the Mother Kraken herself. shapes.js
// holds the shoal species and delegates the rest here.
import { shade, makeKit } from './geom.js';

export function drawDeepShape(ctx, shape, x, y, s, color, eye = '#ffd94d') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const { bodyGrad, body, eyeDot, marks } = makeKit(ctx, s, color, eye);
  switch (shape) {
    case 'shark':
      body(s, s * 0.48);
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, -s * 0.42);
      ctx.lineTo(s * 0.2, -s * 0.95);
      ctx.lineTo(s * 0.42, -s * 0.38);
      ctx.fill();
      marks(() => { // gill slits
        ctx.strokeStyle = shade(color, 0.5);
        ctx.lineWidth = s * 0.05;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(s * (0.34 - i * 0.09), -s * 0.2);
          ctx.lineTo(s * (0.38 - i * 0.09), s * 0.16);
          ctx.stroke();
        }
      });
      eyeDot(0.66, -0.06);
      break;
    case 'king':
      body(s, s * 0.5);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(s * (0.25 + i * 0.18), -s * 0.42);
        ctx.lineTo(s * (0.34 + i * 0.18), -s * 0.85);
        ctx.lineTo(s * (0.43 + i * 0.18), -s * 0.42);
        ctx.fill();
      }
      marks(() => { // crown jewels
        ctx.fillStyle = '#ff5a4e';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(s * (0.34 + i * 0.18), -s * 0.55, s * 0.05, 0, 6.29);
          ctx.fill();
        }
      });
      eyeDot(0.62, -0.08);
      break;
    case 'ghost':
      ctx.globalAlpha = 0.6;
      body(s * 1.05, s * 0.6);
      ctx.globalAlpha = 1;
      marks(() => { // a cold light inside the body
        const gg = ctx.createRadialGradient(s * 0.1, 0, 1, s * 0.1, 0, s * 0.55);
        gg.addColorStop(0, 'rgba(220,245,255,0.8)');
        gg.addColorStop(1, 'rgba(220,245,255,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(-s * 0.5, -s * 0.55, s * 1.2, s * 1.1);
      });
      eyeDot(0.66, -0.05, 0.13);
      break;
    case 'choir':
      ctx.fillStyle = bodyGrad(s * 0.58);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.58, 0, 6.29);
      ctx.fill();
      ctx.fillStyle = color;
      marks(() => { // the inner ring of the choir
        ctx.strokeStyle = shade(color, 1.5);
        ctx.lineWidth = s * 0.05;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.34, 0, 6.29);
        ctx.stroke();
      });
      ctx.lineWidth = s * 0.09;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.29;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * s * 0.62, Math.sin(a) * s * 0.62);
        ctx.lineTo(Math.cos(a) * s * 0.95, Math.sin(a) * s * 0.95);
        ctx.stroke();
      }
      eyeDot(0.15, -0.1);
      break;
    case 'turtle':
      ctx.fillStyle = bodyGrad(s * 0.72);
      ctx.beginPath();
      ctx.arc(0, s * 0.15, s * 0.72, 3.14, 6.29);
      ctx.quadraticCurveTo(0, s * 0.75, -s * 0.72, s * 0.15);
      ctx.fill();
      ctx.fillStyle = color;
      marks(() => { // shell plates
        ctx.strokeStyle = shade(color, 0.5);
        ctx.lineWidth = s * 0.05;
        for (const px of [-0.36, 0, 0.36]) {
          ctx.beginPath();
          ctx.arc(px * s, s * 0.12, s * 0.3, 3.4, 6.0);
          ctx.stroke();
        }
      });
      ctx.beginPath();
      ctx.arc(s * 0.85, s * 0.05, s * 0.2, 0, 6.29);
      ctx.fill();
      eyeDot(0.88, 0);
      break;
    case 'squid':
      ctx.fillStyle = bodyGrad(s * 0.6);
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.85);
      ctx.quadraticCurveTo(s * 0.55, -s * 0.1, s * 0.4, s * 0.3);
      ctx.lineTo(-s * 0.4, s * 0.3);
      ctx.quadraticCurveTo(-s * 0.55, -s * 0.1, 0, -s * 0.85);
      ctx.fill();
      ctx.fillStyle = color;
      marks(() => { // mantle spots
        ctx.fillStyle = shade(color, 1.45);
        for (const [px, py] of [[-0.15, -0.4], [0.14, -0.25], [0, -0.05]]) {
          ctx.beginPath();
          ctx.arc(px * s, py * s, s * 0.06, 0, 6.29);
          ctx.fill();
        }
      });
      ctx.lineWidth = s * 0.13;
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const fx = -s * 0.32 + i * s * 0.16;
        ctx.beginPath();
        ctx.moveTo(fx, s * 0.3);
        ctx.quadraticCurveTo(fx + s * 0.14, s * 0.7, fx - s * 0.05, s * 1.0);
        ctx.stroke();
      }
      eyeDot(-0.16, -0.15, 0.12);
      eyeDot(0.16, -0.15, 0.12);
      break;
    default:
      body(s, s * 0.5);
      eyeDot(0.62, -0.08);
  }
  ctx.restore();
}

// the Mother Kraken: a black dome on the water, five thick tentacles rearing
// and curling — pale suckers down their inner faces — two red eyes that glow.
// s is the dome radius.
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
    ctx.moveTo(fx, s * 0.1);
    ctx.quadraticCurveTo(cxp, -h * 0.6, x2, -h);
    ctx.stroke();
    // suckers: shaded cups sampled along the curve's inner face — a dark
    // rim, a pale face, and a shadowed pit at the centre of each
    for (const tt of [0.3, 0.52, 0.74]) {
      const bx = (1 - tt) * (1 - tt) * fx + 2 * (1 - tt) * tt * cxp + tt * tt * x2;
      const by = (1 - tt) * (1 - tt) * s * 0.1 + 2 * (1 - tt) * tt * -h * 0.6 + tt * tt * -h;
      const sr = s * 0.05 * (1 - tt * 0.4);
      ctx.fillStyle = 'rgba(30,16,14,0.8)';
      ctx.beginPath();
      ctx.arc(bx + s * 0.07, by, sr * 1.25, 0, 6.29);
      ctx.fill();
      ctx.fillStyle = 'rgba(238,205,192,0.6)';
      ctx.beginPath();
      ctx.arc(bx + s * 0.07, by, sr, 0, 6.29);
      ctx.fill();
      ctx.fillStyle = 'rgba(70,35,30,0.75)';
      ctx.beginPath();
      ctx.arc(bx + s * 0.07, by, sr * 0.45, 0, 6.29);
      ctx.fill();
    }
  }
  const dg = ctx.createLinearGradient(0, -s, 0, s * 0.4);
  dg.addColorStop(0, '#1a2233');
  dg.addColorStop(0.6, color);
  dg.addColorStop(1, '#04060a');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(0, 0, s, 3.14, 6.29);
  ctx.quadraticCurveTo(0, s * 0.42, -s, 0);
  ctx.fill();
  // skin speckle: barnacle-pale freckles scattered over the dome, denser
  // toward the crown — placed from a fixed hash so she never shimmers
  ctx.fillStyle = 'rgba(214,200,180,0.30)';
  for (let i = 0; i < 14; i++) {
    const a = 3.3 + ((i * 2654435761) % 1000) / 1000 * 2.7;
    const rad = s * (0.25 + ((i * 40503) % 1000) / 1000 * 0.68);
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad * 0.82;
    if (py > -s * 0.06) continue;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1, s * 0.016 * (1 + (i % 3) * 0.5)), 0, 6.29);
    ctx.fill();
  }
  // the beak: a dark hooked hint low between the eyes, mostly submerged
  ctx.fillStyle = '#0d0507';
  ctx.beginPath();
  ctx.moveTo(-s * 0.13, -s * 0.1);
  ctx.quadraticCurveTo(0, s * 0.16, s * 0.13, -s * 0.1);
  ctx.quadraticCurveTo(0, s * 0.02, -s * 0.13, -s * 0.1);
  ctx.fill();
  ctx.strokeStyle = 'rgba(232,190,160,0.35)';
  ctx.lineWidth = Math.max(1, s * 0.02);
  ctx.beginPath();
  ctx.moveTo(-s * 0.13, -s * 0.1);
  ctx.quadraticCurveTo(0, s * 0.16, s * 0.13, -s * 0.1);
  ctx.stroke();
  for (const d of [-0.36, 0.36]) {
    const hg = ctx.createRadialGradient(d * s, -s * 0.34, 1, d * s, -s * 0.34, s * 0.4);
    hg.addColorStop(0, 'rgba(255,59,48,0.55)');
    hg.addColorStop(1, 'rgba(255,59,48,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(d * s - s * 0.4, -s * 0.74, s * 0.8, s * 0.8);
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(d * s, -s * 0.34, Math.max(3, s * 0.1), 0, 6.29);
    ctx.fill();
  }
  ctx.restore();
}
