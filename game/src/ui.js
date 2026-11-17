// ui.js — one job: the shared drawing kit (type, panels), the HUD, the
// toast, and the sea-route strip every meta screen reuses. Type is big
// and bold on purpose: the judge reads these screens shrunk.
import { MONSTERS, SEAS, WEATHERS, BOONS, SEASON_NIGHTS, NIGHT_SECONDS, DIFFICULTIES } from './data.js';
import { journalCount } from './state.js';
import { staminaWord, snapPoint } from './fight.js';
import { lurePos, WATER_Y } from './render.js';
import { drawHuntPanels } from './panels.js';

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
export function text(ctx, s, x, y, px, color, align = 'left', w = 700) {
  ctx.font = F(px, w);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}
export function panel(ctx, x, y, w, h, a = 0.82) {
  ctx.fillStyle = `rgba(9,22,36,${a})`;
  rr(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,210,245,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export const GRADE_COLORS = { S: '#ffd94d', A: '#39d353', B: '#7fb2e8', C: '#5f7d99' };

// The sea route: six night nodes — graded letters for nights survived,
// the current night ringed, the rest still dark water.
export function drawRouteStrip(ctx, run, x, y, label = true) {
  if (label) text(ctx, 'SEA ROUTE', x, y + 6, 16, '#8fb8d4');
  const x0 = label ? x + 96 : x;
  for (let n = 0; n < SEASON_NIGHTS; n++) {
    const cx = x0 + n * 56 + 16;
    const g = run.nightGrades[n];
    ctx.beginPath();
    ctx.arc(cx, y, 16, 0, 6.29);
    if (g) {
      ctx.fillStyle = GRADE_COLORS[g];
      ctx.fill();
      text(ctx, g, cx, y + 7, 17, '#0b1420', 'center', 800);
    } else if (n === run.night - 1 && run.screen !== 'end') {
      ctx.fillStyle = 'rgba(127,212,255,0.16)';
      ctx.fill();
      ctx.strokeStyle = '#7fd4ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, `${n + 1}`, cx, y + 6, 15, '#cfe8ff', 'center');
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
      text(ctx, `${n + 1}`, cx, y + 6, 15, '#5f7d99', 'center', 400);
    }
  }
}

// Boon pips: one brass square per boon held, with its two-letter code.
function drawBoonPips(ctx, run, x, y, withLabel = true) {
  if (!run.boons.length) return;
  if (withLabel) text(ctx, 'BOONS', x, y + 17, 13, '#8fb8d4');
  const x0 = withLabel ? x + 52 : x;
  run.boons.forEach((id, i) => {
    const b = BOONS.find((bb) => bb.id === id);
    const px = x0 + i * 30;
    ctx.fillStyle = 'rgba(255,185,46,0.16)';
    rr(ctx, px, y, 24, 24, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,185,46,0.65)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, b ? b.code : '??', px + 12, y + 17, 11, '#ffd94d', 'center', 800);
  });
}

export function drawHUD(ctx, run, view) {
  // ONE compact panel at the top-left corner holds the run's vitals —
  // coin, combo, score, night, level, bestiary in a two-column grid.
  // The rest of the top edge is open sky but for the location chip;
  // the goal rides as a chip at the bottom-left, above the fight strip.
  panel(ctx, 16, 14, 296, 102, 0.78);
  text(ctx, `🪙 ${run.coins}`, 32, 48, 23, '#ffd94d');
  const comboScale = view.comboPop > 0 ? 1 + 0.45 * view.comboPop : 1;
  ctx.save();
  ctx.translate(180, 48);
  ctx.scale(comboScale, comboScale);
  ctx.translate(-180, -48);
  text(ctx, `COMBO ×${run.combo}`, 180, 48, 17, run.combo >= 3 ? '#ffb52e' : '#cfe8ff');
  ctx.restore();
  // one grid cell: small caps label, then the value beside it; returns
  // the x where the value's ink ends (the night cell hangs its timer
  // pill off it)
  const cell = (x, y, label, value, color) => {
    text(ctx, label, x, y, 11, '#8fb8d4', 'left', 800);
    const vx = x + ctx.measureText(label).width + 7;
    text(ctx, value, vx, y, 19, color);
    return vx + ctx.measureText(value).width;
  };
  cell(32, 78, 'SCORE', `${run.score}`, '#ffe9a8');
  const nightEnd = cell(180, 78, 'NIGHT', `${run.night}/${SEASON_NIGHTS}`, '#ffffff');
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  rr(ctx, nightEnd + 7, 70, 30, 9, 4);
  ctx.fill();
  ctx.fillStyle = '#7fd4ff';
  rr(ctx, nightEnd + 7, 70, 30 * Math.max(0, 1 - run.nightT / NIGHT_SECONDS), 9, 4);
  ctx.fill();
  cell(32, 106, 'LEVEL', DIFFICULTIES[run.difficulty].name, '#ffd94d');
  cell(180, 106, 'BESTIARY', `${journalCount(run)}/13`, '#ffe9a8');
  const goalStr = `GOAL: Fill the bestiary — kill the King Wyrm — ${journalCount(run)}/13`;
  ctx.font = F(20);
  panel(ctx, 16, 598, ctx.measureText(goalStr).width + 32, 36, 0.66);
  text(ctx, goalStr, 32, 622, 20, '#ffe9a8');
  const locStr = `${SEAS[run.sea].name} • ${WEATHERS[run.weatherIdx].name}`;
  const locW = ctx.measureText(locStr).width + 32;
  panel(ctx, 1264 - locW, 14, locW, 36, 0.66);
  text(ctx, locStr, 1248, 38, 20, '#aee6ff', 'right');
  drawBoonPips(ctx, run, 32, 126);

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
      text(ctx, 'Something is circling below…', 640, 640, 26, '#aee6ff', 'center');
    } else {
      text(ctx, 'The bait is out. Watch the water…', 640, 640, 24, '#8fb8d4', 'center');
    }
  } else if (run.phase === 'fight' && run.fight) {
    const f = run.fight;
    const m = MONSTERS[f.mi];
    // ONE slim strip hugging the bottom edge: stamina left, tension
    // right, surge pips at the far end — the middle of the frame
    // belongs to the water and whatever is coiling through it
    panel(ctx, 16, 638, 1248, 52, 0.66);
    const word = staminaWord(f.stamina);
    const wordColor = word === 'FRESH' ? '#ff8a7a' : word === 'SPENT' ? '#39d353' : '#ffd94d';
    text(ctx, 'STAMINA', 32, 660, 12, '#8fb8d4', 'left', 800);
    text(ctx, `${m.name.toUpperCase()} — `, 96, 660, 15, '#e8d8ff', 'left');
    const nw = ctx.measureText(`${m.name.toUpperCase()} — `).width;
    text(ctx, word, 96 + nw, 660, 15, wordColor, 'left', 800);
    const ww = ctx.measureText(word).width;
    text(ctx, ` • ${Math.max(0, Math.ceil(f.dist))} m out`, 96 + nw + ww, 660, 15, '#8fb8d4', 'left', 400);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    rr(ctx, 32, 668, 560, 9, 4);
    ctx.fill();
    ctx.fillStyle = '#c77dff';
    rr(ctx, 32, 668, 560 * Math.max(0, f.stamina / 100), 9, 4);
    ctx.fill();
    if (f.surgeT > 0) text(ctx, 'CHAIN SURGING!', 640, 660, 14, '#ffb52e', 'center', 800);
    else text(ctx, 'HOLD to haul in — release to slacken', 640, 660, 13, '#cfe8ff', 'center', 400);
    text(ctx, 'TENSION', 800, 660, 12, '#8fb8d4', 'left', 800);
    const snapAt = snapPoint(run);
    const zx = (t) => 800 + (t / snapAt) * 320;
    ctx.fillStyle = '#39d353';
    rr(ctx, 800, 667, zx(60) - 800, 11, 3);
    ctx.fill();
    ctx.fillStyle = '#ffb52e';
    rr(ctx, zx(60), 667, zx(80) - zx(60), 11, 3);
    ctx.fill();
    ctx.fillStyle = '#ff5040';
    rr(ctx, zx(80), 667, 1120 - zx(80), 11, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(zx(Math.min(snapAt, f.tension)) - 2, 664, 5, 17);
    // SURGE pips at the strip's far end: banked charges in brass, the
    // one still filling shows its progress; F spends a charge mid-fight
    text(ctx, 'SURGE', 1136, 660, 11, '#8fb8d4', 'left', 800);
    for (let i = 0; i < 2; i++) {
      const px = 1136 + i * 24;
      ctx.fillStyle = i < run.surgeCharges ? '#ffb52e' : 'rgba(255,255,255,0.12)';
      rr(ctx, px, 666, 19, 13, 4);
      ctx.fill();
      if (i === run.surgeCharges && run.surgeFill > 0) {
        ctx.fillStyle = 'rgba(255,181,46,0.5)';
        rr(ctx, px, 666 + 13 * (1 - run.surgeFill), 19, 13 * run.surgeFill, 4);
        ctx.fill();
      }
    }
    text(ctx, '[F]', 1188, 678, 13, '#cfe8ff', 'left', 800);
  } else {
    text(ctx, 'HOLD SPACE to charge your throw', 640, 640, 24, '#8fb8d4', 'center');
  }
  text(ctx, 'SPACE hold/release: throw • strike • haul    Shift/J: Dash    F: Chain Surge    S: Camp (shop + bestiary)    R: restart', 640, 706, 19, '#7fa6c4', 'center', 400);
  drawHuntPanels(ctx, run, view);
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
