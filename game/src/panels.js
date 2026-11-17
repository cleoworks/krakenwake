// panels.js — one job: the two side panels that flank the hunt. Left,
// STILL LURKING: what this sea still hides. Right, TONIGHT'S HAUL: what
// the night has paid so far. Compact by design: the left panel must end
// above the hunter's head, the right one hangs under the location chip.
import { MONSTERS, SEAS, poolFor } from './data.js';
import { text, panel } from './ui.js';
import { drawFishShape } from './shapes.js';
import { drawKraken } from './shapes2.js';

function monsterIcon(ctx, m, x, y, t) {
  if (m.shape === 'kraken') drawKraken(ctx, x, y, 10, t);
  else drawFishShape(ctx, m.shape, x, y, 10, m.color, '#0b1420');
}

function drawLurking(ctx, run, view) {
  const x = 14;
  const y = 170;
  const w = 216;
  const lurking = poolFor(run.sea).filter((i) => run.bestiary[i].count === 0);
  const rows = Math.min(5, lurking.length);
  const more = lurking.length - rows;
  const rowsTop = y + 27;
  const afterRows = rowsTop + rows * 19;
  const h = lurking.length === 0 ? 52 : (more > 0 ? afterRows + 19 - y : afterRows + 6 - y);
  panel(ctx, x, y, w, h, 0.8);
  text(ctx, 'STILL LURKING', x + 10, y + 19, 11.5, '#8fb8d4', 'left', 800);
  text(ctx, SEAS[run.sea].name, x + w - 10, y + 19, 11.5, '#ffd94d', 'right', 700);
  ctx.strokeStyle = 'rgba(150,210,245,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 24);
  ctx.lineTo(x + w - 10, y + 24);
  ctx.stroke();
  if (lurking.length === 0) {
    text(ctx, 'This sea is emptied — sail on.', x + 10, y + 43, 12, '#7fd4a8', 'left', 400);
    return;
  }
  for (let r = 0; r < rows; r++) {
    const m = MONSTERS[lurking[r]];
    const base = rowsTop + 13 + r * 19;
    monsterIcon(ctx, m, x + 17, base - 4, view.t);
    text(ctx, m.name, x + 33, base, 12.5, '#eaf6ff', 'left', 400);
  }
  if (more > 0) text(ctx, `+${more} more in the dark`, x + 33, afterRows + 14, 11.5, '#5f7d99', 'left', 400);
}

function drawTonight(ctx, run) {
  const w = 224;
  const x = 1264 - w;
  const y = 140;
  const hauls = run.tonightHauls || [];
  const latest = hauls.slice(-5).reverse();
  const rowsTop = y + 27;
  const afterRows = rowsTop + Math.max(1, latest.length) * 19;
  const totalBase = afterRows + 24;
  panel(ctx, x, y, w, totalBase + 7 - y, 0.8);
  text(ctx, "TONIGHT'S HAUL", x + 10, y + 19, 11.5, '#8fb8d4', 'left', 800);
  text(ctx, `NIGHT ${run.night}`, x + w - 10, y + 19, 11.5, '#ffd94d', 'right', 700);
  ctx.strokeStyle = 'rgba(150,210,245,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 24);
  ctx.lineTo(x + w - 10, y + 24);
  ctx.stroke();
  if (latest.length === 0) {
    text(ctx, 'No hauls yet tonight', x + 10, rowsTop + 13, 12, '#5f7d99', 'left', 400);
  }
  latest.forEach((hh, r) => {
    const base = rowsTop + 13 + r * 19;
    text(ctx, MONSTERS[hh.mi].name, x + 10, base, 12.5, '#eaf6ff', 'left', 400);
    text(ctx, `${hh.kg.toFixed(1)} kg • ${hh.coins} 🪙`, x + w - 10, base, 11.5, '#ffd94d', 'right', 400);
  });
  ctx.beginPath();
  ctx.moveTo(x + 10, afterRows + 7);
  ctx.lineTo(x + w - 10, afterRows + 7);
  ctx.stroke();
  const ns = run.nightStats || { hauls: 0, coins: 0 };
  text(ctx, 'TONIGHT', x + 10, totalBase, 11.5, '#8fb8d4', 'left', 800);
  text(ctx, `${ns.hauls} hauls • ${ns.coins} 🪙`, x + w - 10, totalBase, 12.5, '#ffd94d', 'right', 700);
}

export function drawHuntPanels(ctx, run, view) {
  drawLurking(ctx, run, view);
  drawTonight(ctx, run);
}
