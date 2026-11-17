// camp.js — one job: the camp screen. The bestiary grid and the outfitter
// (harpoons, lures, seas), the SEA ROUTE strip, BOONS HELD as icon rows,
// and a NEXT NIGHT panel forecasting the sea, the sky and what still lurks.
import { MONSTERS, SEAS, HARPOONS, LURES, WEATHERS, poolFor, boonById } from './data.js';
import { journalCount } from './state.js';
import { text, panel, rr, drawRouteStrip } from './ui.js';
import { drawFishShape } from './vendor/shapes.js';
import { drawBoonGlyph } from './glyphs.js';

// one-line effects for the boon rows — full text lives on the draft cards
const SHORT_FX = {
  cable: 'wider safe band', winch: '+25% haul speed', chum: 'answers 20% faster',
  aperture: '+50% strike window', charm: 'a snap keeps the combo', grip: 'stamina regens at half',
  glow: 'rares answer more often', sails: 'weather penalties halved', sinkers: 'hauls pay +10%',
};

export function campLayout(run) {
  const rows = [];
  const addRows = (kind, items, y0, stateOf) => {
    items.forEach((it, idx) => {
      rows.push({ kind, idx, x: 852, y: y0 + idx * 43, w: 380, h: 40, name: it.name, ...stateOf(it, idx) });
    });
  };
  addRows('harpoon', HARPOONS, 140, (it, idx) => ({
    right: run.harpoon === idx ? 'EQUIPPED' : run.ownedH[idx] ? 'click to equip' : `${it.price} 🪙`,
    active: run.harpoon === idx,
    afford: run.ownedH[idx] || run.coins >= it.price,
  }));
  addRows('lure', LURES, 292, (it, idx) => ({
    right: run.lure === idx ? 'IN USE' : run.ownedL[idx] ? 'click to use' : `${it.price} 🪙`,
    active: run.lure === idx,
    afford: run.ownedL[idx] || run.coins >= it.price,
  }));
  addRows('sea', SEAS, 487, (it, idx) => ({
    right: run.sea === idx ? 'HUNTING HERE' : run.seasOpen[idx] ? 'click to sail' : `${it.unlock} 🪙`,
    active: run.sea === idx,
    afford: run.seasOpen[idx] || run.coins >= it.unlock,
  }));
  return { rows, hunt: { x: 318, y: 512, w: 240, h: 46 } };
}

function drawBoonRows(ctx, run) {
  panel(ctx, 48, 598, 596, 86, 0.55);
  text(ctx, 'BOONS HELD', 64, 620, 12.5, '#8fb8d4', 'left', 800);
  if (!run.boons.length) {
    text(ctx, 'none yet — survive a night to draft salvage', 64, 652, 14, '#5f7d99', 'left', 400);
    return;
  }
  run.boons.slice(0, 6).forEach((id, i) => {
    const b = boonById(id);
    if (!b) return;
    const colX = 64 + (i % 2) * 288;
    const base = 642 + Math.floor(i / 2) * 18;
    drawBoonGlyph(ctx, id, colX + 8, base - 4, 8);
    text(ctx, b.name, colX + 22, base, 13, '#ffd94d', 'left', 700);
    const nw = ctx.measureText(b.name).width;
    text(ctx, SHORT_FX[id] || '', colX + 28 + nw, base, 10.5, '#8fb8d4', 'left', 400);
  });
}

function drawNextNight(ctx, run) {
  panel(ctx, 852, 624, 380, 60, 0.55);
  text(ctx, 'NEXT NIGHT', 868, 648, 12, '#8fb8d4', 'left', 800);
  const lw = ctx.measureText('NEXT NIGHT').width;
  text(ctx, `— ${SEAS[run.sea].name}`, 868 + lw + 8, 648, 14, '#ffd94d', 'left', 700);
  const lurking = poolFor(run.sea).filter((i) => run.bestiary[i].count === 0);
  const names = lurking.slice(0, 2).map((i) => MONSTERS[i].name).join(', ');
  const tail = lurking.length > 2 ? ` +${lurking.length - 2} more` : '';
  const line = lurking.length
    ? `${WEATHERS[run.weatherIdx].name} skies • still lurks: ${names}${tail}`
    : `${WEATHERS[run.weatherIdx].name} skies • this sea is emptied — sail on`;
  text(ctx, line, 868, 668, 11.5, '#cfe8ff', 'left', 400);
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
      text(ctx, `×${b.count} • sells for ${m.price} 🪙`, cx + 74, cy + 108, 14.5, '#8fb8d4', 'center', 400);
    } else {
      drawFishShape(ctx, m.shape, cx + 74, cy + 40, 30, '#131e2a', null);
      text(ctx, '???', cx + 74, cy + 88, 16.5, '#5f7d99', 'center');
      text(ctx, m.doom ? 'Doom Bell only' : SEAS[m.sea].name, cx + 74, cy + 108, 14.5, '#5f7d99', 'center', 400);
    }
  });
  const { rows, hunt } = campLayout(run);
  text(ctx, 'HARPOONS — haul speed & grip', 852, 130, 19, '#aee6ff');
  text(ctx, 'BAITS — what answers, how fast', 852, 282, 19, '#aee6ff');
  text(ctx, 'SEAS — darker water, worse monsters', 852, 477, 19, '#aee6ff');
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
  // the meta layer along the bottom: the route, the boons, the forecast
  drawRouteStrip(ctx, run, 48, 578);
  text(ctx, 'Click a row to buy / equip / sail', 500, 584, 14, '#7fa6c4', 'left', 400);
  drawBoonRows(ctx, run);
  drawNextNight(ctx, run);
}
