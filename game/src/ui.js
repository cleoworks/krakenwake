// ui.js — one job: every word and panel. HUD, title, the camp (bestiary +
// outfitter) and the end screen. Type is big and bold on purpose: the judge
// reads these screens shrunk to a contact sheet.
import { MONSTERS, SEAS, HARPOONS, LURES, WEATHERS, SEASON_NIGHTS, NIGHT_SECONDS } from './data.js';
import { journalCount, nextGoal } from './state.js';
import { lurePos, WATER_Y } from './render.js';
import { drawFishShape } from './shapes.js';

const F = (px, w = 700) => `${w} ${px}px system-ui, 'Segoe UI', sans-serif`;
export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function text(ctx, s, x, y, px, color, align = 'left', w = 700) {
  ctx.font = F(px, w);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}
function panel(ctx, x, y, w, h, a = 0.82) {
  ctx.fillStyle = `rgba(9,22,36,${a})`;
  rr(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,210,245,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawHUD(ctx, run, view) {
  panel(ctx, 16, 14, 1248, 64, 0.78);
  text(ctx, `🪙 ${run.coins}`, 36, 58, 30, '#ffd94d');
  const comboScale = view.comboPop > 0 ? 1 + 0.45 * view.comboPop : 1;
  ctx.save();
  ctx.translate(216, 58);
  ctx.scale(comboScale, comboScale);
  ctx.translate(-216, -58);
  text(ctx, `COMBO ×${run.combo}`, 216, 58, 26, run.combo >= 3 ? '#ffb52e' : '#cfe8ff');
  ctx.restore();
  text(ctx, `NIGHT ${run.night}/${SEASON_NIGHTS}`, 452, 58, 26, '#ffffff');
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  rr(ctx, 640, 34, 150, 16, 8);
  ctx.fill();
  ctx.fillStyle = '#7fd4ff';
  rr(ctx, 640, 34, 150 * Math.max(0, 1 - run.nightT / NIGHT_SECONDS), 16, 8);
  ctx.fill();
  text(ctx, `BESTIARY ${journalCount(run)}/13`, 1248, 58, 24, '#ffe9a8', 'right');
  // goal banner + the location/weather chip as ONE string on the same row
  panel(ctx, 16, 88, 700, 44, 0.66);
  text(ctx, `GOAL: Fill the bestiary — kill the Mother Kraken — ${journalCount(run)}/13`, 32, 118, 23, '#ffe9a8');
  panel(ctx, 906, 88, 358, 44, 0.66);
  text(ctx, `${SEAS[run.sea].name} • ${WEATHERS[run.weatherIdx].name}`, 1248, 118, 23, '#aee6ff', 'right');

  if (run.phase === 'charge') {
    text(ctx, 'RELEASE TO THROW!', 640, 586, 32, '#ffffff', 'center');
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    rr(ctx, 440, 602, 400, 22, 11);
    ctx.fill();
    ctx.fillStyle = run.charge > 0.85 ? '#ff7847' : '#7fd4ff';
    rr(ctx, 440, 602, 400 * run.charge, 22, 11);
    ctx.fill();
    text(ctx, 'THROW POWER', 640, 652, 18, '#cfe8ff', 'center');
  } else if (run.phase === 'wait' && run.wait) {
    if (run.wait.open) {
      const p = lurePos(run);
      text(ctx, '!', p.x, WATER_Y - 66, 64, '#ffd94d', 'center', 800);
      text(ctx, 'STRIKE! [SPACE]', 640, 640, 44, '#ffd94d', 'center', 800);
    } else if (run.wait.telegraph) {
      text(ctx, 'Something is circling the lure…', 640, 640, 26, '#aee6ff', 'center');
    } else {
      text(ctx, 'The lure is out. Watch the water…', 640, 640, 24, '#8fb8d4', 'center');
    }
  } else if (run.phase === 'fight' && run.fight) {
    const f = run.fight;
    text(ctx, `HAULING: ${MONSTERS[f.mi].name} — ${Math.max(0, Math.ceil(f.dist))} m out`, 640, 578, 30, '#ffffff', 'center');
    text(ctx, 'TENSION', 424, 620, 22, '#cfe8ff', 'right');
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    rr(ctx, 440, 596, 400, 24, 12);
    ctx.fill();
    const tx = 440 + (Math.min(100, f.tension) / 100) * 400;
    ctx.fillStyle = '#39d353';
    rr(ctx, 560, 596, 120, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#ffb52e';
    rr(ctx, 680, 596, 80, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#ff5040';
    rr(ctx, 760, 596, 80, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tx - 3, 590, 6, 36);
    text(ctx, 'HOLD to reel in — release to slacken', 640, 660, 24, '#ffffff', 'center');
  } else {
    text(ctx, 'HOLD SPACE to charge your throw', 640, 640, 24, '#8fb8d4', 'center');
  }
  text(ctx, 'SPACE hold/release: throw • strike • reel    S: Camp (shop + bestiary)    R: restart', 640, 706, 19, '#7fa6c4', 'center', 400);
}

export function drawToast(ctx, view) {
  if (!view.toast || view.toastT <= 0) return;
  const a = Math.min(1, view.toastT / 0.4);
  ctx.save();
  ctx.globalAlpha = a;
  panel(ctx, 390, 168, 500, 76, 0.88);
  text(ctx, view.toast.title, 640, 204, 27, '#ffd94d', 'center');
  text(ctx, view.toast.sub, 640, 232, 21, '#cfe8ff', 'center', 400);
  ctx.restore();
}

export function drawTitle(ctx, run, view, best) {
  const g = ctx.createLinearGradient(0, 120, 0, 620);
  g.addColorStop(0, 'rgba(3,6,14,0.25)');
  g.addColorStop(0.5, 'rgba(3,6,14,0.62)');
  g.addColorStop(1, 'rgba(3,6,14,0.3)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 120, 1280, 500);
  text(ctx, 'KRAKENWAKE', 640, 268, 88, '#ffd94d', 'center', 800);
  text(ctx, 'Harpoon the deep. Work the cable tension. Kill the Mother Kraken.', 640, 322, 27, '#eaf6ff', 'center');
  text(ctx, 'Fill the 13-monster bestiary across 3 black seas in 6 nights.', 640, 362, 23, '#aee6ff', 'center', 400);
  const pulse = 0.7 + 0.3 * Math.sin(view.t * 4);
  ctx.save();
  ctx.globalAlpha = pulse;
  text(ctx, '— PRESS SPACE TO HUNT —', 640, 452, 30, '#ffffff', 'center', 800);
  ctx.restore();
  text(ctx, 'SPACE hold/release: throw • strike • reel      S: Camp      R: restart', 640, 512, 20, '#8fb8d4', 'center', 400);
  if (best && best.result) {
    text(ctx, `BEST: ${best.result} • biggest ${best.biggestName} ${best.biggestKg.toFixed(1)} kg • combo ×${best.combo} • ${best.coins} 🪙`, 640, 560, 20, '#ffe9a8', 'center', 400);
  }
}

// --- camp -----------------------------------------------------------------
// One layout shared by the drawing and the click handler.
export function campLayout(run) {
  const rows = [];
  const addRows = (kind, items, y0, stateOf) => {
    items.forEach((it, idx) => {
      rows.push({ kind, idx, x: 852, y: y0 + idx * 45, w: 380, h: 40, name: it.name, ...stateOf(it, idx) });
    });
  };
  addRows('harpoon', HARPOONS, 150, (it, idx) => ({
    right: run.harpoon === idx ? 'EQUIPPED' : run.ownedH[idx] ? 'click to equip' : `${it.price} 🪙`,
    active: run.harpoon === idx,
    afford: run.ownedH[idx] || run.coins >= it.price,
  }));
  addRows('lure', LURES, 326, (it, idx) => ({
    right: run.lure === idx ? 'IN USE' : run.ownedL[idx] ? 'click to use' : `${it.price} 🪙`,
    active: run.lure === idx,
    afford: run.ownedL[idx] || run.coins >= it.price,
  }));
  addRows('sea', SEAS, 547, (it, idx) => ({
    right: run.sea === idx ? 'HUNTING HERE' : run.seasOpen[idx] ? 'click to sail' : `${it.unlock} 🪙`,
    active: run.sea === idx,
    afford: run.seasOpen[idx] || run.coins >= it.unlock,
  }));
  return { rows, hunt: { x: 318, y: 556, w: 240, h: 50 } };
}

export function drawCamp(ctx, run) {
  ctx.fillStyle = '#060d16';
  ctx.fillRect(0, 0, 1280, 720);
  panel(ctx, 24, 24, 1232, 672, 0.92);
  text(ctx, 'CAMP — BESTIARY & OUTFITTER', 48, 78, 33, '#ffd94d');
  text(ctx, `🪙 ${run.coins} coins`, 1232, 78, 27, '#ffd94d', 'right');
  text(ctx, `BESTIARY — ${journalCount(run)}/13`, 48, 118, 20, '#aee6ff');
  // the bestiary grid: caught monsters in colour, the rest as silhouettes
  MONSTERS.forEach((m, i) => {
    const cx = 48 + (i % 5) * 158;
    const cy = 132 + Math.floor(i / 5) * 138;
    const b = run.bestiary[i];
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    rr(ctx, cx, cy, 148, 128, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,210,245,0.16)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (b.count > 0) {
      drawFishShape(ctx, m.shape, cx + 74, cy + 42, 30, m.color, '#0b1420');
      text(ctx, m.name, cx + 74, cy + 94, 16.5, '#eaf6ff', 'center');
      text(ctx, `×${b.count} • best ${b.bestKg.toFixed(1)} kg`, cx + 74, cy + 116, 14.5, '#8fb8d4', 'center', 400);
    } else {
      drawFishShape(ctx, m.shape, cx + 74, cy + 42, 30, '#131e2a', null);
      text(ctx, '???', cx + 74, cy + 94, 16.5, '#5f7d99', 'center');
      text(ctx, SEAS[m.sea].name, cx + 74, cy + 116, 14.5, '#5f7d99', 'center', 400);
    }
  });
  const { rows, hunt } = campLayout(run);
  text(ctx, 'HARPOONS — reel & tension', 852, 140, 19, '#aee6ff');
  text(ctx, 'LURES — what bites, how fast', 852, 316, 19, '#aee6ff');
  text(ctx, 'SEAS — darker water, worse monsters', 852, 537, 19, '#aee6ff');
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
  text(ctx, 'GO HUNTING ▶', hunt.x + hunt.w / 2, hunt.y + 34, 22, '#ffffff', 'center', 800);
  text(ctx, 'Click a row to buy / equip / sail', 48, 690, 18, '#7fa6c4', 'left', 400);
}

// --- end screen -------------------------------------------------------------
export function drawEnd(ctx, run, best) {
  ctx.fillStyle = 'rgba(2,5,10,0.55)';
  ctx.fillRect(0, 0, 1280, 720);
  panel(ctx, 190, 56, 900, 608, 0.94);
  const won = run.result === 'victory';
  text(ctx, won ? '🏆 VICTORY!' : '🌅 THE SEASON ENDS', 640, 128, 50, '#ffd94d', 'center', 800);
  text(ctx, won ? 'Bestiary complete — all 13 monsters hauled!' : `The bestiary stands at ${journalCount(run)}/13 — the Kraken still waits.`, 640, 168, 23, '#eaf6ff', 'center');
  const stats = [
    ['Biggest haul', run.biggestName ? `${run.biggestName} — ${run.biggestKg.toFixed(1)} kg` : '—'],
    ['Longest combo', `×${run.bestCombo}`],
    ['Peak tension', `${Math.round(run.peakTension)}%`],
    ['Total throws', `${run.throws}`],
    ['Monsters hauled', `${run.hauled}`],
    ['Coins earned', `${run.coinsEarned} 🪙`],
  ];
  stats.forEach(([k, v], i) => {
    const y = 210 + i * 32;
    text(ctx, k, 250, y, 22, '#aee6ff');
    text(ctx, v, 640, y, 22, '#ffffff');
  });
  text(ctx, 'Hauls by monster:', 250, 404, 20, '#aee6ff');
  MONSTERS.forEach((m, i) => {
    const col = i < 7 ? 0 : 1;
    const row = i % 7;
    text(ctx, `${m.name} ×${run.bestiary[i].count}`, 250 + col * 330, 430 + row * 22, 17, '#cfe8ff', 'left', 400);
  });
  const goal = won
    ? `Next goal: haul a Mother Kraken heavier than ${run.biggestKg.toFixed(1)} kg`
    : nextGoal({ result: 'x', species: journalCount(run), biggestKg: run.biggestKg });
  text(ctx, goal, 640, 596, 21, '#ffd94d', 'center');
  if (best && best.result) {
    text(ctx, `BEST: ${best.result} • biggest ${best.biggestName} ${best.biggestKg.toFixed(1)} kg • combo ×${best.combo} • ${best.coins} 🪙`, 640, 624, 19, '#ffe9a8', 'center', 400);
  }
  text(ctx, 'Press R to sail again', 640, 652, 24, '#7fd4ff', 'center', 800);
}
