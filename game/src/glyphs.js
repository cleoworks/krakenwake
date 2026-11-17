// glyphs.js — one job: the boon icons. Small canvas glyphs in the game's
// brass-on-dark hand, one per salvage boon, drawn in a unit box around
// (cx, cy) with half-size s. No monograms.
const INK = '#ffd94d';
const DIM = 'rgba(255,217,77,0.55)';

export function drawBoonGlyph(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = Math.max(1.4, s * 0.11);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  switch (id) {
    case 'cable': // a coiled line: three turns of rope settling into a loop
      for (const r of [0.78, 0.52, 0.27]) {
        ctx.beginPath();
        ctx.arc(0, 0, s * r, 0.4, 5.6);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(s * 0.62, -s * 0.5);
      ctx.quadraticCurveTo(s * 1.05, -s * 0.75, s * 0.92, -s * 1.02);
      ctx.stroke();
      break;
    case 'winch': // a winch drum with its crank handle
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.58, 0, 6.29);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.16, 0, 6.29);
      ctx.fill();
      for (const a of [0.5, 2.6, 4.7]) {
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * s * 0.2, Math.sin(a) * s * 0.2);
        ctx.lineTo(Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(s * 0.58, -s * 0.3);
      ctx.lineTo(s * 0.95, -s * 0.3);
      ctx.lineTo(s * 0.95, -s * 0.62);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.95, -s * 0.68, s * 0.09, 0, 6.29);
      ctx.fill();
      break;
    case 'chum': // a blood drop falling to a ripple
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.95);
      ctx.quadraticCurveTo(s * 0.52, -s * 0.05, s * 0.4, s * 0.28);
      ctx.quadraticCurveTo(s * 0.28, s * 0.55, 0, s * 0.55);
      ctx.quadraticCurveTo(-s * 0.28, s * 0.55, -s * 0.4, s * 0.28);
      ctx.quadraticCurveTo(-s * 0.52, -s * 0.05, 0, -s * 0.95);
      ctx.fill();
      ctx.strokeStyle = DIM;
      ctx.beginPath();
      ctx.ellipse(0, s * 0.85, s * 0.62, s * 0.16, 0, 0.15, 3.0);
      ctx.stroke();
      break;
    case 'aperture': // an eye widening: a ring with radiating ticks
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.42, 0, 6.29);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.15, 0, 6.29);
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.29;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * s * 0.58, Math.sin(a) * s * 0.58);
        ctx.lineTo(Math.cos(a) * s * 0.82, Math.sin(a) * s * 0.82);
        ctx.stroke();
      }
      break;
    case 'charm': // a lucky star hung in a ring
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.85, 0, 6.29);
      ctx.strokeStyle = DIM;
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = -1.57 + (i / 8) * 6.29;
        const r = i % 2 === 0 ? s * 0.58 : s * 0.22;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = INK;
      ctx.fill();
      break;
    case 'grip': // three iron talons closing
      for (const d of [-0.55, 0, 0.55]) {
        ctx.beginPath();
        ctx.moveTo(d * s, -s * 0.8);
        ctx.quadraticCurveTo(d * s * 1.25, -s * 0.1, d * s * 0.45, s * 0.72);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, -s * 0.82);
      ctx.lineTo(s * 0.8, -s * 0.82);
      ctx.stroke();
      break;
    case 'glow': // a bait orb, lit from inside, shedding rays
      {
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, s * 0.62);
        g.addColorStop(0, 'rgba(255,240,180,0.95)');
        g.addColorStop(0.55, 'rgba(255,190,80,0.55)');
        g.addColorStop(1, 'rgba(255,190,80,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-s * 0.62, -s * 0.62, s * 1.24, s * 1.24);
        ctx.fillStyle = '#fff2b0';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.2, 0, 6.29);
        ctx.fill();
        ctx.strokeStyle = INK;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * 6.29 + 0.3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * s * 0.68, Math.sin(a) * s * 0.68);
          ctx.lineTo(Math.cos(a) * s * 0.92, Math.sin(a) * s * 0.92);
          ctx.stroke();
        }
      }
      break;
    case 'sails': // a storm sail bent by the wind
      ctx.beginPath();
      ctx.moveTo(-s * 0.15, -s * 0.9);
      ctx.lineTo(-s * 0.15, s * 0.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.15, -s * 0.82);
      ctx.quadraticCurveTo(s * 0.75, -s * 0.3, -s * 0.15, s * 0.35);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,217,77,0.3)';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.strokeStyle = DIM;
      for (const wy of [-0.55, -0.1, 0.35]) {
        ctx.beginPath();
        ctx.moveTo(-s * 0.95, s * wy);
        ctx.quadraticCurveTo(-s * 0.6, s * (wy - 0.12), -s * 0.32, s * wy);
        ctx.stroke();
      }
      break;
    case 'sinkers': // a heavy sinker on its chain
      ctx.beginPath();
      ctx.arc(0, -s * 0.78, s * 0.17, 0, 6.29);
      ctx.stroke();
      for (const dy of [-0.5, -0.28]) {
        ctx.beginPath();
        ctx.arc(0, s * dy, s * 0.05, 0, 6.29);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.08);
      ctx.lineTo(s * 0.3, -s * 0.08);
      ctx.lineTo(s * 0.48, s * 0.72);
      ctx.quadraticCurveTo(0, s * 0.95, -s * 0.48, s * 0.72);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,217,77,0.3)';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.stroke();
      break;
    default: // a plain brass ring for anything unnamed
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.6, 0, 6.29);
      ctx.stroke();
  }
  ctx.restore();
}
