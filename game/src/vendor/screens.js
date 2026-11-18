// screens.js — one job: the shared richness layer for the meta screens.
// Panel grain, stat tiles, haul chips, feat rows, draft pips and the
// next-night line — pure render helpers, so the screens themselves stay
// lean. Everything placed from fixed hashes: every frame agrees.
import { MONSTERS, SEAS } from '../data.js';
import { text, rr } from '../ui.js';
import { drawFishShape } from './shapes.js';
import { drawWyrmGlyph } from './wyrm.js';

const hash = (i, k) => ((i * 2654435761 + k * 40503) % 1000) / 1000;

// a faint wave-and-foam grain clipped inside a panel's rounded rect,
// with a warm breath along its top edge — candlelight on the rim
export function panelTexture(ctx, x, y, w, h) {
  ctx.save();
  rr(ctx, x, y, w, h, 14);
  ctx.clip();
  ctx.strokeStyle = 'rgba(160,210,240,0.055)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 26; i++) {
    const px = x + hash(i, 61) * w;
    const py = y + hash(i, 62) * h;
    ctx.moveTo(px, py);
    ctx.lineTo(px + 22 + hash(i, 63) * 26, py);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(220,242,255,0.05)';
  for (let i = 0; i < 30; i++) ctx.fillRect(x + hash(i, 64) * w, y + hash(i, 65) * h, 3, 2);
  // fine grain over the field — hash-placed dust in the light, so
  // the panel's dark is a texture, never a flat fill
  ctx.fillStyle = 'rgba(230,242,252,0.05)';
  for (let i = 0; i < 42; i++) ctx.fillRect(x + hash(i, 66) * w, y + hash(i, 67) * h, 1.6, 1.6);
  // a breath of warm light pooled at the panel's top-left, as if a
  // lamp burns just off-frame — flat ellipses, the light pass's
  // language on every screen: lit, not flat-lit
  ctx.fillStyle = 'rgba(255,190,100,0.05)';
  ctx.beginPath(); ctx.ellipse(x + w * 0.16, y + 26, w * 0.30, 44, 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = 'rgba(255,205,120,0.04)';
  ctx.beginPath(); ctx.ellipse(x + w * 0.16, y + 22, w * 0.18, 26, 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = 'rgba(255,185,46,0.045)';
  ctx.fillRect(x, y, w, 46);
  ctx.restore();
}

// the briefing's backdrop grain: star sparkle up top, wave dashes
// below — the field the panels sit on is textured, never flat dark
export function screenTexture(ctx) {
  ctx.fillStyle = '#dfeaf6';
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.05 + hash(i, 73) * 0.09;
    ctx.fillRect(hash(i, 71) * 1280, hash(i, 72) * 400, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(160,210,240,0.05)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 22; i++) {
    const px = hash(i, 74) * 1240;
    const py = 470 + hash(i, 75) * 230;
    ctx.moveTo(px, py);
    ctx.lineTo(px + 26 + hash(i, 76) * 30, py);
  }
  ctx.stroke();
}

// one boxed stat: warm dark tile, accent rim, caps label, big value
export function statTile(ctx, x, y, w, h, label, value, vpix = 25) {
  ctx.fillStyle = 'rgba(26,19,10,0.55)';
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,185,46,0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, label.toUpperCase(), x + 14, y + 19, 11, '#8fb8d4', 'left', 800);
  text(ctx, value, x + 14, y + h - 12, vpix, '#ffffff', 'left', 800);
}

// one haul as a chip: the monster's own icon, its name, its count
export function monsterChip(ctx, m, count, x, y, w) {
  const caught = count > 0;
  ctx.fillStyle = caught ? 'rgba(255,185,46,0.07)' : 'rgba(255,255,255,0.03)';
  rr(ctx, x, y, w, 24, 8);
  ctx.fill();
  ctx.strokeStyle = caught ? 'rgba(255,185,46,0.35)' : 'rgba(150,210,245,0.14)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (m.shape === 'wyrm') drawWyrmGlyph(ctx, x + 17, y + 12, 9, m.color, '#0b1420');
  else drawFishShape(ctx, m.shape, x + 17, y + 11, 9, m.color, '#0b1420');
  if (caught) {
    // the haul glitters: two small sparks struck off the count —
    // the coins in the night's pile catching the lantern light
    ctx.fillStyle = 'rgba(255,233,168,0.85)';
    const sx = x + w - 48, sy = y + 8;
    ctx.fillRect(sx - 3, sy - 0.8, 6, 1.6); ctx.fillRect(sx - 0.8, sy - 3, 1.6, 6);
    ctx.fillRect(x + w - 60, y + 15.2, 3.4, 1.2); ctx.fillRect(x + w - 59.1, y + 14.1, 1.2, 3.4);
  }
  text(ctx, m.name, x + 32, y + 17, 14, caught ? '#cfe8ff' : '#5f7d99', 'left', 400);
  text(ctx, `×${count}`, x + w - 10, y + 17, 14, caught ? '#ffd94d' : '#46617c', 'right', 800);
}

// one feat as a checklist row: a green checked box (or an empty one),
// the name in gold, the deed after it — the deed shrinks to fit its row
export function featRow(ctx, f, earned, x, y, w) {
  if (earned) {
    ctx.fillStyle = '#2e9e57';
    rr(ctx, x, y - 11, 14, 14, 4);
    ctx.fill();
    text(ctx, '✓', x + 7, y + 1, 11, '#ffffff', 'center', 800);
  } else {
    ctx.strokeStyle = 'rgba(150,210,245,0.4)';
    ctx.lineWidth = 1.2;
    rr(ctx, x, y - 11, 14, 14, 4);
    ctx.stroke();
  }
  text(ctx, f.name, x + 22, y, 15, earned ? '#ffd94d' : '#5f7d99', 'left', 700);
  const nw = ctx.measureText(f.name).width;
  let px = 12.5;
  ctx.font = `400 ${px}px system-ui, 'Segoe UI', sans-serif`;
  const avail = w - 30 - nw;
  const dw = ctx.measureText(`— ${f.desc}`).width;
  if (dw > avail) px = Math.max(10, (px * avail) / dw);
  text(ctx, `— ${f.desc}`, x + 30 + nw, y, px, earned ? '#8fb8d4' : '#46617c', 'left', 400);
}

// the draft card's pip row: three brass squares, one lit per copy
// already held — and a NEW tag while the sea's offer is unowned
export function pipRow(ctx, cx, y, owned) {
  for (let i = 0; i < 3; i++) {
    const x = cx - 20 + i * 13;
    if (i < Math.min(3, owned)) {
      ctx.fillStyle = '#ffb52e';
      rr(ctx, x, y, 9, 9, 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(255,185,46,0.5)';
      ctx.lineWidth = 1.2;
      rr(ctx, x, y, 9, 9, 2);
      ctx.stroke();
    }
  }
  if (!owned) text(ctx, 'NEW', cx + 24, y + 8, 10.5, '#39d353', 'left', 800);
}

// the night after the draft: which sea, and what still lurks in it —
// named from the run's own book, nothing invented
export function nextNightText(run) {
  const n = run.draft ? run.draft.afterNight : run.night - 1;
  const seaIdx = run.nightSeas && run.nightSeas[n] !== undefined ? run.nightSeas[n] : run.sea;
  const lurking = MONSTERS.map((m, i) => (m.sea === seaIdx && run.bestiary[i].count === 0 ? m.name : null)).filter(Boolean);
  const tail = lurking.length ? `still lurking: ${lurking.slice(0, 4).join(' • ')}` : 'the sea is emptied — sail on';
  return { label: `NEXT — NIGHT ${n + 1}`, line: `${SEAS[seaIdx].name} — ${tail}` };
}
