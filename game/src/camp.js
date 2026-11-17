// camp.js — one job: the camp screen. The bestiary grid and the outfitter
// (harpoons, lures, seas) from v1, now with the SEA ROUTE strip and the
// BOONS HELD line underneath. One layout object is shared by the drawing
// and the click handler in main.js.
import { MONSTERS, SEAS, HARPOONS, LURES } from './data.js';
import { journalCount } from './state.js';
import { boonsLabel } from './salvage.js';
import { text, panel, rr, drawRouteStrip } from './ui.js';
import { drawFishShape } from './shapes.js';

export function campLayout(run) {
  const rows = [];
  const addRows = (kind, items, y0, stateOf) => {
    items.forEach((it, idx) => {
      rows.push({ kind, idx, x: 852, y: y0 + idx * 45, w: 380, h: 40, name: it.name, ...stateOf(it, idx) });
    });
  };
  addRows('harpoon', HARPOONS, 142, (it, idx) => ({
    right: run.harpoon === idx ? 'EQUIPPED' : run.ownedH[idx] ? 'click to equip' : `${it.price} 🪙`,
    active: run.harpoon === idx,
    afford: run.ownedH[idx] || run.coins >= it.price,
  }));
  addRows('lure', LURES, 312, (it, idx) => ({
    right: run.lure === idx ? 'IN USE' : run.ownedL[idx] ? 'click to use' : `${it.price} 🪙`,
    active: run.lure === idx,
    afford: run.ownedL[idx] || run.coins >= it.price,
  }));
  addRows('sea', SEAS, 527, (it, idx) => ({
    right: run.sea === idx ? 'HUNTING HERE' : run.seasOpen[idx] ? 'click to sail' : `${it.unlock} 🪙`,
    active: run.sea === idx,
    afford: run.seasOpen[idx] || run.coins >= it.unlock,
  }));
  return { rows, hunt: { x: 318, y: 512, w: 240, h: 46 } };
}

export function drawCamp(ctx, run) {
  ctx.fillStyle = '#060d16';
  ctx.fillRect(0, 0, 1280, 720);
  panel(ctx, 24, 24, 1232, 672, 0.92);
  text(ctx, 'CAMP — BESTIARY & OUTFITTER', 48, 74, 33, '#ffd94d');
  text(ctx, `🪙 ${run.coins} coins`, 1232, 74, 27, '#ffd94d', 'right');
  text(ctx, `BESTIARY — ${journalCount(run)}/13`, 48, 110, 20, '#aee6ff');
  // the bestiary grid: caught monsters in colour, the rest as silhouettes
  MONSTERS.forEach((m, i) => {
    const cx = 48 + (i % 5) * 158;
    const cy = 122 + Math.floor(i / 5) * 128;
    const b = run.bestiary[i];
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    rr(ctx, cx, cy, 148, 120, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,210,245,0.16)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (b.count > 0) {
      drawFishShape(ctx, m.shape, cx + 74, cy + 40, 30, m.color, '#0b1420');
      text(ctx, m.name, cx + 74, cy + 88, 16.5, '#eaf6ff', 'center');
      text(ctx, `×${b.count} • best ${b.bestKg.toFixed(1)} kg`, cx + 74, cy + 108, 14.5, '#8fb8d4', 'center', 400);
    } else {
      drawFishShape(ctx, m.shape, cx + 74, cy + 40, 30, '#131e2a', null);
      text(ctx, '???', cx + 74, cy + 88, 16.5, '#5f7d99', 'center');
      text(ctx, SEAS[m.sea].name, cx + 74, cy + 108, 14.5, '#5f7d99', 'center', 400);
    }
  });
  const { rows, hunt } = campLayout(run);
  text(ctx, 'HARPOONS — reel & tension', 852, 132, 19, '#aee6ff');
  text(ctx, 'LURES — what bites, how fast', 852, 302, 19, '#aee6ff');
  text(ctx, 'SEAS — darker water, worse monsters', 852, 517, 19, '#aee6ff');
  for (const r of rows) {
    ctx.fillStyle = r.active ? 'rgba(46,139,87,0.55)' : 'rgba(255,255,255,0.06)';
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    text(ctx, r.name, r.x + 14, r.y + 27, 18.5, r.afford || r.active ? '#eaf6ff' : '#5f7d99');
    text(ctx, r.right, r.x + r.w - 14, r.y + 27, 16.5, r.active ? '#b8ffd0' : '#ffb52e', 'right', 400);
  }
  ctx.fillStyle = '#2e9e57';
  rr(ctx, hunt.x, hunt.y, hunt.w, hunt.h, 12);
  ctx.fill();
  text(ctx, 'GO HUNTING ▶', hunt.x + hunt.w / 2, hunt.y + 31, 22, '#ffffff', 'center', 800);
  // the meta layer, under the grid: where the season stands, what it holds
  drawRouteStrip(ctx, run, 48, 592);
  const label = run.boons.length ? boonsLabel(run) : 'none yet — survive a night to draft salvage';
  text(ctx, `BOONS HELD: ${label}`, 48, 644, 15.5, run.boons.length ? '#ffd94d' : '#5f7d99', 'left', 400);
  text(ctx, 'Click a row to buy / equip / sail', 48, 684, 16, '#7fa6c4', 'left', 400);
}
