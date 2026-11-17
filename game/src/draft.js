// draft.js — one job: the salvage draft screen. After each night (1-5) the
// sea gives up three pieces of salvage and the hunter keeps one: a boon
// that bends the rules for the rest of the season.
import { boonById, SEAS, MONSTERS } from './data.js';
import { journalCount } from './state.js';
import { boonsLabel } from './salvage.js';
import { text, panel, rr, GRADE_COLORS } from './ui.js';
import { drawBoonGlyph } from './glyphs.js';

export function draftLayout() {
  const cards = [0, 1, 2].map((i) => ({ idx: i, x: 130 + i * 350, y: 218, w: 320, h: 268 }));
  return { cards };
}

// The route as a sailed path: a line through six night nodes, grades
// lettered in, the sea each night was hunted in named underneath.
function drawDraftRoute(ctx, run) {
  const y = 552;
  const x0 = 250;
  const stepX = 156;
  ctx.strokeStyle = 'rgba(150,210,245,0.3)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x0 + stepX * 5, y);
  ctx.stroke();
  if (run.nightGrades.length > 0) {
    ctx.strokeStyle = 'rgba(255,217,77,0.75)';
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + stepX * (run.nightGrades.length - 1), y);
    ctx.stroke();
  }
  text(ctx, 'SEA ROUTE', 130, y + 5, 15, '#8fb8d4', 'left', 800);
  for (let n = 0; n < 6; n++) {
    const cx = x0 + n * stepX;
    const g = run.nightGrades[n];
    ctx.beginPath();
    ctx.arc(cx, y, 16, 0, 6.29);
    if (g) {
      ctx.fillStyle = GRADE_COLORS[g];
      ctx.fill();
      text(ctx, g, cx, y + 6, 16, '#0b1420', 'center', 800);
    } else if (n === run.nightGrades.length) {
      ctx.fillStyle = 'rgba(127,212,255,0.16)';
      ctx.fill();
      ctx.strokeStyle = '#7fd4ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, `${n + 1}`, cx, y + 5, 14, '#cfe8ff', 'center');
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
      text(ctx, `${n + 1}`, cx, y + 5, 14, '#5f7d99', 'center', 400);
    }
    const seaIdx = (run.nightSeas && run.nightSeas[n] !== undefined) ? run.nightSeas[n] : run.sea;
    text(ctx, SEAS[seaIdx].name, cx, y + 34, 11, '#8fb8d4', 'center', 400);
  }
}

export function drawDraft(ctx, run, view) {
  ctx.fillStyle = 'rgba(2,5,10,0.62)';
  ctx.fillRect(0, 0, 1280, 720);
  panel(ctx, 90, 64, 1100, 592, 0.95);
  const recap = run.lastNightHauls || run.tonightHauls || [];
  const recapCoins = recap.reduce((s, hh) => s + hh.coins, 0);
  const grade = run.nightGrades[run.nightGrades.length - 1] || '—';
  text(ctx, '⚓ SALVAGE DRAFT', 640, 120, 40, '#ffd94d', 'center', 800);
  text(ctx, `Night ${run.draft.afterNight} survived — the sea offers up its wreckage. Keep ONE.  •  Night grade: ${grade}`, 640, 154, 20, '#eaf6ff', 'center');
  text(ctx, `🪙 ${run.coins} COINS   •   SCORE ${run.score}   •   BESTIARY ${journalCount(run)}/13   •   TONIGHT: ${recap.length} hauls, ${recapCoins} 🪙`, 640, 184, 17.5, '#ffe9a8', 'center', 700);

  const { cards } = draftLayout();
  run.draft.choices.forEach((id, i) => {
    const c = cards[i];
    const b = boonById(id);
    const pulse = 0.75 + 0.25 * Math.sin(view.t * 2.4 + i * 1.3);
    ctx.fillStyle = 'rgba(255,185,46,0.07)';
    rr(ctx, c.x, c.y, c.w, c.h, 14);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,217,77,${pulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    // the boon's own little scene, drawn inside the brass seal
    ctx.fillStyle = 'rgba(255,185,46,0.14)';
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y + 58, 32, 0, 6.29);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,185,46,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawBoonGlyph(ctx, id, c.x + c.w / 2, c.y + 58, 21);
    const owned = run.boons.filter((bb) => bb === id).length;
    if (owned > 0) {
      ctx.fillStyle = 'rgba(255,185,46,0.85)';
      rr(ctx, c.x + c.w - 92, c.y + 12, 80, 21, 10);
      ctx.fill();
      text(ctx, `OWNED ×${owned}`, c.x + c.w - 52, c.y + 27, 11, '#0b1420', 'center', 800);
    }
    text(ctx, b.name.toUpperCase(), c.x + c.w / 2, c.y + 122, 21, '#ffffff', 'center', 800);
    // description, wrapped by hand into centred lines
    const words = b.desc.split(' ');
    const lines = [''];
    for (const w of words) {
      if ((lines[lines.length - 1] + ' ' + w).trim().length > 34) lines.push(w);
      else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim();
    }
    lines.slice(0, 3).forEach((ln, li) => text(ctx, ln, c.x + c.w / 2, c.y + 152 + li * 22, 16, '#cfe8ff', 'center', 400));
    ctx.fillStyle = '#2e9e57';
    rr(ctx, c.x + 60, c.y + c.h - 52, c.w - 120, 38, 9);
    ctx.fill();
    text(ctx, `TAKE  [${i + 1}]`, c.x + c.w / 2, c.y + c.h - 27, 18, '#ffffff', 'center', 800);
  });

  // tonight's recap: everything the ended night paid out, by name and price
  const shown = recap.slice(0, 5).map((hh) => `${MONSTERS[hh.mi].name} ${hh.coins} 🪙`).join('  •  ');
  const extra = recap.length > 5 ? `  •  +${recap.length - 5} more` : '';
  text(ctx, recap.length ? `TONIGHT'S HAULS — ${shown}${extra}` : "TONIGHT'S HAULS — none; the sea kept its secrets", 640, 516, 14.5, '#aee6ff', 'center', 400);

  drawDraftRoute(ctx, run);
  const held = run.boons.length ? boonsLabel(run) : 'nothing yet';
  text(ctx, `BOONS HELD: ${held}`, 640, 624, 15.5, '#ffd94d', 'center', 400);
  text(ctx, 'Click a card — or press 1, 2, 3', 640, 648, 14.5, '#7fa6c4', 'center', 400);
}
