// shapes.js — one job: draw the monsters. Per-species silhouettes built from
// canvas paths, plus the Mother Kraken herself. render.js puts them in the
// water; ui.js puts them in the bestiary grid.
export function drawFishShape(ctx, shape, x, y, s, color, eye = '#ffd94d') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const body = (len, hgt) => {
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.quadraticCurveTo(-len * 0.3, -hgt, len * 0.55, -hgt * 0.55);
    ctx.quadraticCurveTo(len, -hgt * 0.2, len, 0);
    ctx.quadraticCurveTo(len * 0.55, hgt * 0.55, -len * 0.3, hgt);
    ctx.quadraticCurveTo(-len, hgt * 0.3, -len, 0);
    ctx.fill();
    ctx.beginPath(); // tail
    ctx.moveTo(-len * 0.92, 0);
    ctx.lineTo(-len * 1.3, -hgt * 0.7);
    ctx.lineTo(-len * 1.3, hgt * 0.7);
    ctx.fill();
  };
  const eyeDot = (ex, ey, r = 0.1) => {
    if (!eye) return;
    ctx.fillStyle = eye;
    ctx.beginPath();
    ctx.arc(ex * s, ey * s, Math.max(1.6, r * s), 0, 6.29);
    ctx.fill();
    ctx.fillStyle = color;
  };
  switch (shape) {
    case 'eel':
      ctx.lineWidth = s * 0.34;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.quadraticCurveTo(-s * 0.3, -s * 0.5, s * 0.2, 0);
      ctx.quadraticCurveTo(s * 0.7, s * 0.4, s, -s * 0.1);
      ctx.stroke();
      eyeDot(0.82, -0.12);
      break;
    case 'crab':
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.62, 0, 6.29);
      ctx.fill();
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
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, -s * 0.4);
      ctx.lineTo(s * 0.25, -s * 1.25);
      ctx.lineTo(s * 0.5, -s * 0.35);
      ctx.fill();
      eyeDot(0.62, -0.1);
      break;
    case 'whale':
      body(s * 1.1, s * 0.72);
      eyeDot(0.7, 0.05);
      break;
    case 'monk':
      ctx.beginPath();
      ctx.arc(s * 0.25, 0, s * 0.62, 0, 6.29);
      ctx.fill();
      body(s * 0.8, s * 0.4);
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
      eyeDot(0.62, -0.08);
      break;
    case 'shark':
      body(s, s * 0.48);
      ctx.beginPath();
      ctx.moveTo(-s * 0.05, -s * 0.42);
      ctx.lineTo(s * 0.2, -s * 0.95);
      ctx.lineTo(s * 0.42, -s * 0.38);
      ctx.fill();
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
      eyeDot(0.62, -0.08);
      break;
    case 'ghost':
      ctx.globalAlpha = 0.6;
      body(s * 1.05, s * 0.6);
      ctx.globalAlpha = 1;
      eyeDot(0.66, -0.05, 0.13);
      break;
    case 'choir':
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.58, 0, 6.29);
      ctx.fill();
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
      ctx.beginPath();
      ctx.arc(0, s * 0.15, s * 0.72, 3.14, 6.29);
      ctx.quadraticCurveTo(0, s * 0.75, -s * 0.72, s * 0.15);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.85, s * 0.05, s * 0.2, 0, 6.29);
      ctx.fill();
      eyeDot(0.88, 0);
      break;
    case 'squid':
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.85);
      ctx.quadraticCurveTo(s * 0.55, -s * 0.1, s * 0.4, s * 0.3);
      ctx.lineTo(-s * 0.4, s * 0.3);
      ctx.quadraticCurveTo(-s * 0.55, -s * 0.1, 0, -s * 0.85);
      ctx.fill();
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
// and curling, two red eyes. s is the dome radius.
export function drawKraken(ctx, x, y, s, t, color = '#07090f') {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const fx = -s * 0.92 + i * s * 0.46;
    const lean = Math.sin(t * 1.3 + i * 1.9) * s * 0.1;
    const h = s * (1.5 + 0.35 * Math.sin(i * 2.4));
    ctx.lineWidth = s * 0.3 * (1 - i * 0.06);
    ctx.beginPath();
    ctx.moveTo(fx, s * 0.1);
    ctx.quadraticCurveTo(fx + lean - s * 0.2, -h * 0.6, fx + lean + (i < 2 ? -s * 0.34 : s * 0.3), -h);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, s, 3.14, 6.29);
  ctx.quadraticCurveTo(0, s * 0.42, -s, 0);
  ctx.fill();
  ctx.fillStyle = '#ff3b30';
  for (const d of [-0.36, 0.36]) {
    ctx.beginPath();
    ctx.arc(d * s, -s * 0.34, Math.max(3, s * 0.1), 0, 6.29);
    ctx.fill();
  }
  ctx.restore();
}
