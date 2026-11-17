// geom.js — one job: the shared drawing kit for the monster shapes. An
// angular-bodied fish builder with 3-step value shading, a slit-pupil
// glow eye, and the texture marks of the creature-poster style: teeth,
// speckle, scars, gill slits, spine ridges.
export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.min(255, Math.max(0, Math.round(v * f)));
  return `rgb(${ch((n >> 16) & 255)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

const hash = (i, k) => ((i * 2654435761 + k * 40503) % 1000) / 1000;

export function makeKit(ctx, s, color, eye) {
  const bodyGrad = (hgt) => {
    const g = ctx.createLinearGradient(0, -hgt, 0, hgt);
    g.addColorStop(0, shade(color, 1.4));
    g.addColorStop(0.55, color);
    g.addColorStop(1, shade(color, 0.5));
    return g;
  };
  // the body: an angular silhouette — ridged back, pointed snout, flat
  // belly, notched peduncle. No ovals: a creature, not a balloon.
  const body = (len, hgt) => {
    ctx.fillStyle = bodyGrad(hgt);
    ctx.beginPath();
    ctx.moveTo(-len * 0.98, -hgt * 0.12);
    ctx.lineTo(-len * 0.55, -hgt * 0.72);
    ctx.lineTo(-len * 0.1, -hgt * 0.92);
    ctx.lineTo(len * 0.35, -hgt);
    ctx.lineTo(len * 0.8, -hgt * 0.5);
    ctx.lineTo(len, -hgt * 0.02);
    ctx.lineTo(len * 0.78, hgt * 0.42);
    ctx.lineTo(len * 0.15, hgt * 0.85);
    ctx.lineTo(-len * 0.5, hgt * 0.68);
    ctx.lineTo(-len * 0.9, hgt * 0.28);
    ctx.closePath();
    ctx.fill();
    // moon rim-light along the back
    ctx.strokeStyle = 'rgba(235,245,255,0.30)';
    ctx.lineWidth = Math.max(1.2, s * 0.035);
    ctx.beginPath();
    ctx.moveTo(-len * 0.9, -hgt * 0.3);
    ctx.lineTo(-len * 0.5, -hgt * 0.8);
    ctx.lineTo(len * 0.3, -hgt * 1.02);
    ctx.lineTo(len * 0.82, -hgt * 0.55);
    ctx.stroke();
    // the tail: a jagged, notched fin, never a smooth fan
    ctx.fillStyle = shade(color, 0.78);
    ctx.beginPath();
    ctx.moveTo(-len * 0.92, -hgt * 0.1);
    ctx.lineTo(-len * 1.32, -hgt * 0.78);
    ctx.lineTo(-len * 1.14, -hgt * 0.05);
    ctx.lineTo(-len * 1.3, hgt * 0.62);
    ctx.lineTo(-len * 0.9, hgt * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = color;
  };
  // the eye: a glowing almond with a vertical slit pupil. Dark eye
  // colours (the bestiary's) get a pale slit instead of a halo.
  const slitEye = (ex, ey, r = 0.13) => {
    if (!eye) return;
    const cx = ex * s, cy = ey * s, rr = Math.max(2, r * s);
    const glow = eye !== '#0b1420';
    if (glow) {
      const hg = ctx.createRadialGradient(cx, cy, 1, cx, cy, rr * 3.2);
      hg.addColorStop(0, 'rgba(255,70,50,0.5)');
      hg.addColorStop(1, 'rgba(255,70,50,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(cx - rr * 3.2, cy - rr * 3.2, rr * 6.4, rr * 6.4);
    }
    ctx.fillStyle = eye;
    ctx.beginPath();
    ctx.moveTo(cx - rr, cy);
    ctx.quadraticCurveTo(cx, cy - rr * 0.95, cx + rr, cy);
    ctx.quadraticCurveTo(cx, cy + rr * 0.95, cx - rr, cy);
    ctx.fill();
    ctx.fillStyle = glow ? '#0d0405' : 'rgba(230,240,250,0.85)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rr * 0.22, rr * 0.72, 0, 0, 6.29);
    ctx.fill();
    ctx.fillStyle = color;
  };
  // a row of jagged teeth along a jaw line, bone-pale
  const teeth = (x, y, n, len, w, down = true) => {
    ctx.fillStyle = '#e6dfca';
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const tx = (x + i * w) * s;
      ctx.moveTo(tx, y * s);
      ctx.lineTo(tx + w * s * 0.5, y * s + (down ? len : -len) * s);
      ctx.lineTo(tx + w * s, y * s);
    }
    ctx.fill();
    ctx.fillStyle = color;
  };
  // scale speckle / barnacle flecks from a fixed hash — never shimmers
  const speckle = (n, x0, x1, y0, y1, col = 'rgba(220,208,185,0.4)', seed = 7) => {
    ctx.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const px = (x0 + hash(i, seed) * (x1 - x0)) * s;
      const py = (y0 + hash(i, seed + 31) * (y1 - y0)) * s;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.8, s * 0.028 * (0.6 + hash(i, seed + 57))), 0, 6.29);
      ctx.fill();
    }
    ctx.fillStyle = color;
  };
  // an old wound: a pale jagged slash with a dark seam
  const scar = (x, y, len, ang) => {
    ctx.save();
    ctx.translate(x * s, y * s);
    ctx.rotate(ang);
    ctx.strokeStyle = 'rgba(232,222,198,0.55)';
    ctx.lineWidth = Math.max(1, s * 0.035);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len * s * 0.4, s * 0.03);
    ctx.lineTo(len * s * 0.7, -s * 0.02);
    ctx.lineTo(len * s, s * 0.025);
    ctx.stroke();
    ctx.restore();
  };
  // gill slits: short dark slashes behind the head
  const gills = (x, y, n, h) => {
    ctx.strokeStyle = 'rgba(2,4,8,0.55)';
    ctx.lineWidth = Math.max(1.1, s * 0.045);
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo((x - i * 0.1) * s, (y - h * 0.4) * s);
      ctx.lineTo((x - i * 0.1 + 0.05) * s, (y + h * 0.5) * s);
      ctx.stroke();
    }
  };
  // a spine ridge: triangles along a line, in the current fill
  const ridge = (x0, x1, y, n, h) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const bx = (x0 + (x1 - x0) * (i / n)) * s;
      const bw = ((x1 - x0) / n) * s;
      ctx.moveTo(bx, y * s);
      ctx.lineTo(bx + bw * 0.5, (y - h) * s);
      ctx.lineTo(bx + bw, y * s);
    }
    ctx.fill();
  };
  const marks = (fn) => { ctx.save(); ctx.globalAlpha = 0.4; fn(); ctx.restore(); };
  return { bodyGrad, body, slitEye, teeth, speckle, scar, gills, ridge, marks };
}
