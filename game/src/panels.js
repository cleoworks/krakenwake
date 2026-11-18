// panels.js — one job: the hunt's side sections. STILL LURKING rides
// inside the HUD's one left panel (ui.js sizes the box with lurkH);
// TONIGHT'S HAUL hangs under the location chip at the same width.
import { MONSTERS, SEAS, poolFor } from './data.js';
import { text, panel } from './ui.js';
import { drawFishShape } from './vendor/shapes.js';
import { drawWyrmGlyph } from './vendor/wyrm.js';

function monsterIcon(ctx, m, x, y, t) {
  if (m.shape === 'wyrm') drawWyrmGlyph(ctx, x, y, 10, m.color, '#0b1420');
  else drawFishShape(ctx, m.shape, x, y, 10, m.color, '#0b1420');
  void t;
}

// the STILL LURKING section's height, divider included — ui.js adds
// it to the vitals box so the left column reads as one panel
export function lurkH(run) {
  const n = poolFor(run.sea).filter((i) => run.bestiary[i].count === 0).length;
  if (!n) return 45;
  const rows = Math.min(5, n);
  return 26 + rows * 19 + (n > rows ? 19 : 6);
}

function drawLurking(ctx, run, view) {
  const x = 16, w = 296;
  const D = run.boons.length ? 144 : 124; // the divider: vitals base + 8 (ui.js)
  const lurking = poolFor(run.sea).filter((i) => run.bestiary[i].count === 0);
  ctx.strokeStyle = 'rgba(150,210,245,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 16, D);
  ctx.lineTo(x + w - 16, D);
  ctx.stroke();
  text(ctx, 'STILL LURKING', x + 16, D + 18, 11.5, '#8fb8d4', 'left', 800);
  text(ctx, SEAS[run.sea].name, x + w - 16, D + 18, 11.5, '#ffd94d', 'right', 700);
  if (lurking.length === 0) {
    text(ctx, 'This sea is emptied — sail on.', x + 16, D + 39, 12, '#7fd4a8', 'left', 400);
    return;
  }
  const rows = Math.min(5, lurking.length);
  for (let r = 0; r < rows; r++) {
    const m = MONSTERS[lurking[r]];
    const base = D + 39 + r * 19;
    monsterIcon(ctx, m, x + 17, base - 4, view.t);
    text(ctx, m.name, x + 33, base, 12.5, '#eaf6ff', 'left', 400);
  }
  if (lurking.length > rows) text(ctx, `+${lurking.length - rows} more in the dark`, x + 33, D + 39 + rows * 19, 11.5, '#5f7d99', 'left', 400);
}

function drawTonight(ctx, run, view) {
  const w = view.haulW || 224; // one width with the location chip (ui.js)
  const x = 1264 - w;
  const y = 58; // tucked up under the location chip (its base is y50):
  // an 8px gap instead of floating far below it — pixel-checked
  // gold-free at this height, the rear arch passes well below
  const hauls = run.tonightHauls || [];
  const latest = hauls.slice(-5).reverse();
  const rowsTop = y + 27;
  const afterRows = rowsTop + Math.max(1, latest.length) * 19;
  const totalBase = afterRows + 24;
  panel(ctx, x, y, w, totalBase + 7 - y, 0.8);
  text(ctx, "TONIGHT'S HAUL", x + 16, y + 19, 11.5, '#8fb8d4', 'left', 800);
  text(ctx, `NIGHT ${run.night}`, x + w - 16, y + 19, 11.5, '#ffd94d', 'right', 700);
  ctx.strokeStyle = 'rgba(150,210,245,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 16, y + 24);
  ctx.lineTo(x + w - 16, y + 24);
  ctx.stroke();
  if (latest.length === 0) {
    text(ctx, 'No hauls yet tonight', x + 16, rowsTop + 13, 12, '#5f7d99', 'left', 400);
  }
  latest.forEach((hh, r) => {
    const base = rowsTop + 13 + r * 19;
    text(ctx, MONSTERS[hh.mi].name, x + 16, base, 12.5, '#eaf6ff', 'left', 400);
    text(ctx, `${hh.coins} 🪙`, x + w - 16, base, 11.5, '#ffd94d', 'right', 400);
  });
  ctx.beginPath();
  ctx.moveTo(x + 16, afterRows + 7);
  ctx.lineTo(x + w - 16, afterRows + 7);
  ctx.stroke();
  const ns = run.nightStats || { hauls: 0, coins: 0 };
  text(ctx, 'TONIGHT', x + 16, totalBase, 11.5, '#8fb8d4', 'left', 800);
  text(ctx, `${ns.hauls} hauls • ${ns.coins} 🪙`, x + w - 16, totalBase, 12.5, '#ffd94d', 'right', 700);
}

export function drawHuntPanels(ctx, run, view) {
  drawLurking(ctx, run, view);
  drawTonight(ctx, run, view);
}
