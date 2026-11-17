// draft.js — one job: the salvage draft screen. After each night (1-5) the
// sea gives up three pieces of salvage and the hunter keeps one: a boon
// that bends the rules for the rest of the season. The route strip below
// the cards shows what the season has earned so far.
import { boonById } from './data.js';
import { boonsLabel } from './salvage.js';
import { text, panel, rr, drawRouteStrip, drawBoonPips } from './ui.js';

export function draftLayout() {
  const cards = [0, 1, 2].map((i) => ({ idx: i, x: 130 + i * 350, y: 218, w: 320, h: 268 }));
  return { cards };
}

export function drawDraft(ctx, run, view) {
  ctx.fillStyle = 'rgba(2,5,10,0.62)';
  ctx.fillRect(0, 0, 1280, 720);
  panel(ctx, 90, 64, 1100, 592, 0.95);
  text(ctx, '⚓ SALVAGE DRAFT', 640, 122, 40, '#ffd94d', 'center', 800);
  text(ctx, `Night ${run.draft.afterNight} survived — the sea offers up its wreckage. Keep ONE.`, 640, 158, 21, '#eaf6ff', 'center');
  text(ctx, `Night grade: ${run.nightGrades[run.nightGrades.length - 1] || '—'}   •   Bestiary ${run.bestiary.filter((b) => b.count > 0).length}/13   •   Score ${run.score}`, 640, 188, 18, '#8fb8d4', 'center', 400);

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
    // the monogram seal
    ctx.fillStyle = 'rgba(255,185,46,0.18)';
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y + 58, 30, 0, 6.29);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,185,46,0.7)';
    ctx.stroke();
    text(ctx, b.code, c.x + c.w / 2, c.y + 68, 24, '#ffd94d', 'center', 800);
    text(ctx, b.name.toUpperCase(), c.x + c.w / 2, c.y + 122, 21, '#ffffff', 'center', 800);
    // description, wrapped by hand into two centred lines
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

  drawRouteStrip(ctx, run, 150, 540);
  const held = run.boons.length ? boonsLabel(run) : 'nothing yet';
  text(ctx, `BOONS HELD: ${held}`, 640, 596, 16, '#ffd94d', 'center', 400);
  drawBoonPips(ctx, run, 1050, 522, false);
  text(ctx, 'Click a card — or press 1, 2, 3', 640, 632, 16, '#7fa6c4', 'center', 400);
}
