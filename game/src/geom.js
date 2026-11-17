// geom.js — one job: the shared drawing kit for the monster shapes. A
// gradient-bodied fish builder, the eye (with its red glow halo), and the
// marks wrapper, so shapes.js and shapes2.js draw in the same hand.

// scale an #rrggbb colour toward black (f<1) or white (f>1)
export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.min(255, Math.max(0, Math.round(v * f)));
  return `rgb(${ch((n >> 16) & 255)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

export function makeKit(ctx, s, color, eye) {
  const bodyGrad = (hgt) => {
    const g = ctx.createLinearGradient(0, -hgt, 0, hgt);
    g.addColorStop(0, shade(color, 1.35));
    g.addColorStop(0.55, color);
    g.addColorStop(1, shade(color, 0.55));
    return g;
  };
  const body = (len, hgt) => {
    ctx.fillStyle = bodyGrad(hgt);
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.quadraticCurveTo(-len * 0.3, -hgt, len * 0.55, -hgt * 0.55);
    ctx.quadraticCurveTo(len, -hgt * 0.2, len, 0);
    ctx.quadraticCurveTo(len * 0.55, hgt * 0.55, -len * 0.3, hgt);
    ctx.quadraticCurveTo(-len, hgt * 0.3, -len, 0);
    ctx.fill();
    // moon rim-light: a pale line along the top edge, where the sky catches it
    ctx.strokeStyle = 'rgba(235,245,255,0.28)';
    ctx.lineWidth = Math.max(1.2, s * 0.035);
    ctx.beginPath();
    ctx.moveTo(-len * 0.82, -hgt * 0.28);
    ctx.quadraticCurveTo(-len * 0.3, -hgt * 1.04, len * 0.55, -hgt * 0.58);
    ctx.quadraticCurveTo(len * 0.86, -hgt * 0.34, len * 0.97, -hgt * 0.1);
    ctx.stroke();
    ctx.fillStyle = shade(color, 0.8);
    ctx.beginPath(); // tail
    ctx.moveTo(-len * 0.92, 0);
    ctx.lineTo(-len * 1.3, -hgt * 0.7);
    ctx.lineTo(-len * 1.3, hgt * 0.7);
    ctx.fill();
    ctx.fillStyle = color;
  };
  const eyeDot = (ex, ey, r = 0.1) => {
    if (!eye) return;
    { // every eye carries a halo of its own colour; the hunter's red burns widest
      const wide = eye === '#ff5040';
      const hg = ctx.createRadialGradient(ex * s, ey * s, 1, ex * s, ey * s, s * (wide ? 0.42 : 0.3));
      hg.addColorStop(0, wide ? 'rgba(255,80,64,0.5)' : 'rgba(255,217,77,0.32)');
      hg.addColorStop(1, 'rgba(255,80,64,0)');
      ctx.fillStyle = hg;
      const rr2 = s * (wide ? 0.42 : 0.3);
      ctx.fillRect(ex * s - rr2, ey * s - rr2, rr2 * 2, rr2 * 2);
    }
    ctx.fillStyle = eye;
    ctx.beginPath();
    ctx.arc(ex * s, ey * s, Math.max(1.6, r * s), 0, 6.29);
    ctx.fill();
    ctx.fillStyle = color;
  };
  const marks = (fn) => { ctx.save(); ctx.globalAlpha = 0.35; fn(); ctx.restore(); };
  return { bodyGrad, body, eyeDot, marks };
}
