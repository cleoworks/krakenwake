// briefing.js — one job: the briefing screen that replaces the plain title.
// It sells the whole game before the first throw: goal, win and lose, how
// to hunt, every threat by name, difficulty, the BEST panel, and a small
// live window where the autopilot hunts on its own.
import { MONSTERS, SEAS, DIFFICULTIES } from './data.js';
import { text, panel, rr } from './ui.js';
import { drawWorld } from './render.js';
import { drawFishShape } from './vendor/shapes.js';
import { drawWyrmGlyph } from './vendor/wyrm.js';

export function briefingLayout() {
  const diffs = DIFFICULTIES.map((d, i) => ({ idx: i, x: 40 + i * 410, y: 474, w: 380, h: 56 }));
  return { diffs, sail: { x: 624, y: 560, w: 272, h: 64 } };
}

function pill(ctx, x, label, line, color) {
  panel(ctx, x, 148, 400, 46, 0.8);
  text(ctx, label, x + 18, 178, 18, color, 'left', 800);
  const w = ctx.measureText(label).width;
  text(ctx, line, x + 26 + w, 178, 16.5, '#eaf6ff', 'left', 400);
}

function stepCard(ctx, x, n, title, lines, icon) {
  panel(ctx, x, 236, 285, 120, 0.8);
  ctx.fillStyle = '#ffb52e';
  ctx.beginPath();
  ctx.arc(x + 30, 266, 15, 0, 6.29);
  ctx.fill();
  text(ctx, `${n}`, x + 30, 273, 19, '#0b1420', 'center', 800);
  text(ctx, title, x + 56, 274, 22, '#ffd94d', 'left', 800);
  lines.forEach((ln, i) => text(ctx, ln, x + 20, 304 + i * 20, 15, '#cfe8ff', 'left', 400));
  icon(ctx, x);
}

function drawDemoWindow(ctx, demo, view) {
  const { x, y, w, h } = { x: 912, y: 548, w: 328, h: 140 };
  ctx.save();
  rr(ctx, x, y, w, h, 10);
  ctx.clip();
  ctx.translate(x, y - 16);
  ctx.scale(w / 1280, w / 1280);
  drawWorld(ctx, demo, view, true); // lite: at this size the fine scenery is mush
  ctx.restore();
  ctx.strokeStyle = 'rgba(150,210,245,0.5)';
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.fillStyle = 'rgba(3,6,14,0.72)';
  rr(ctx, x + 8, y + 8, 132, 22, 6);
  ctx.fill();
  text(ctx, 'LIVE — THE HUNT', x + 16, y + 24, 12.5, '#ffd94d', 'left', 800);
}

export function drawBriefing(ctx, sel, best, last, demo, view) {
  // scrim over the living sea so every word lands
  const g = ctx.createLinearGradient(0, 0, 0, 720);
  g.addColorStop(0, 'rgba(3,6,14,0.66)');
  g.addColorStop(1, 'rgba(3,6,14,0.82)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 720);

  text(ctx, 'WYRMWAKE', 640, 94, 76, '#ffd94d', 'center', 800);
  text(ctx, 'Harpoon the deep. Fill the bestiary. Kill the King Wyrm.', 640, 130, 24, '#eaf6ff', 'center');

  pill(ctx, 24, '🎯 GOAL', 'Fill the 13-monster bestiary', '#7fd4ff');
  pill(ctx, 440, '🏆 WIN', 'Bestiary complete within 6 nights', '#39d353');
  pill(ctx, 856, '☠ LOSE', 'Night 6 ends, bestiary unfinished', '#ff8a7a');

  text(ctx, 'HOW TO HUNT', 40, 226, 18, '#8fb8d4', 'left', 800);
  stepCard(ctx, 40, 1, 'THROW', ['Hold SPACE to charge,', 'release to hurl the', 'harpoon by hand.'], (c, x) => {
    c.fillStyle = 'rgba(255,255,255,0.18)';
    rr(c, x + 180, 254, 88, 12, 6);
    c.fill();
    c.fillStyle = '#7fd4ff';
    rr(c, x + 180, 254, 56, 12, 6);
    c.fill();
  });
  stepCard(ctx, 345, 2, 'STRIKE', ['When a weak point glows,', 'hold SPACE on it — hits', 'drain its STAMINA fast.'], (c, x) => {
    text(c, '!', x + 238, 282, 44, '#ffd94d', 'center', 800);
  });
  stepCard(ctx, 650, 3, 'DASH', ['Telegraphs: LET GO to', 'slacken, or DASH (Shift/J)', 'through — perfect: COUNTER!'], (c, x) => {
    c.fillStyle = '#9fe8ff';
    rr(c, x + 196, 250, 56, 7, 3);
    c.fill();
    rr(c, x + 186, 263, 44, 7, 3);
    c.fill();
    rr(c, x + 176, 276, 32, 7, 3);
    c.fill();
  });
  stepCard(ctx, 955, 4, 'HAUL', ['Empty its STAMINA, then', 'HOLD to haul it in. Red', 'TENSION snaps the chain.'], (c, x) => {
    c.fillStyle = '#39d353';
    rr(c, x + 172, 254, 38, 12, 3);
    c.fill();
    c.fillStyle = '#ffb52e';
    rr(c, x + 212, 254, 24, 12, 3);
    c.fill();
    c.fillStyle = '#ff5040';
    rr(c, x + 238, 254, 30, 12, 3);
    c.fill();
  });

  // the roster: every threat, named and pictured, grouped by its sea
  panel(ctx, 40, 362, 1200, 76, 0.8);
  text(ctx, "THE SEAS' THREATS", 60, 386, 15, '#8fb8d4', 'left', 800);
  SEAS.forEach((sea, si) => {
    const y = 386 + si * 19;
    text(ctx, `${sea.name}: `, 240, y, 14.5, '#ffd94d', 'left', 700);
    let x = 240 + ctx.measureText(`${sea.name}: `).width + 2;
    const list = MONSTERS.filter((m) => m.sea === si);
    list.forEach((m, mi) => {
      if (m.shape === 'wyrm') drawWyrmGlyph(ctx, x + 10, y - 3, 9, m.color, '#0b1420');
      else drawFishShape(ctx, m.shape, x + 10, y - 4, 9, m.color, '#0b1420');
      x += 24;
      const nm = m.name.toUpperCase();
      text(ctx, nm, x, y, 14.5, si === 2 ? '#ff8a7a' : '#cfe8ff', 'left', 400);
      x += ctx.measureText(nm).width;
      if (mi < list.length - 1) {
        text(ctx, ' • ', x, y, 14.5, '#5f7d99', 'left', 400);
        x += ctx.measureText(' • ').width;
      }
    });
  });

  text(ctx, 'DIFFICULTY', 40, 464, 18, '#8fb8d4', 'left', 800);
  text(ctx, '🔔 The King Wyrm answers only to the Doom Bell lure — buy it at camp, ring it in Wyrm\'s Maw.', 190, 464, 14, '#ffd94d', 'left', 400);
  const { diffs, sail } = briefingLayout();
  for (const d of diffs) {
    const def = DIFFICULTIES[d.idx];
    const active = sel === d.idx;
    ctx.fillStyle = active ? 'rgba(255,185,46,0.2)' : 'rgba(255,255,255,0.05)';
    rr(ctx, d.x, d.y, d.w, d.h, 10);
    ctx.fill();
    ctx.strokeStyle = active ? '#ffd94d' : 'rgba(150,210,245,0.3)';
    ctx.lineWidth = active ? 3 : 1.5;
    ctx.stroke();
    text(ctx, `${def.name}  ×${def.mult.toFixed(1)}`, d.x + 18, d.y + 26, 20, active ? '#ffd94d' : '#eaf6ff', 'left', 800);
    text(ctx, def.blurb, d.x + 18, d.y + 46, 13.5, '#8fb8d4', 'left', 400);
    text(ctx, `[${d.idx + 1}]`, d.x + d.w - 16, d.y + 26, 15, '#5f7d99', 'right', 400);
  }

  // BEST panel + the last hunt, bottom left
  panel(ctx, 40, 548, 560, 140, 0.8);
  text(ctx, 'BEST HUNT', 60, 578, 17, '#8fb8d4', 'left', 800);
  if (best && best.result) {
    text(ctx, `${best.result} — GRADE ${best.grade || '—'} • SCORE ${best.score || 0}`, 60, 606, 18.5, '#ffe9a8');
    text(ctx, `best combo ×${best.combo} • ${best.coins} 🪙 earned`, 60, 632, 16.5, '#cfe8ff', 'left', 400);
  } else {
    text(ctx, 'No hunts yet — the bestiary is unwritten.', 60, 606, 17, '#cfe8ff', 'left', 400);
  }
  if (last && last.result) {
    text(ctx, `LAST HUNT: ${last.result} • ${last.species}/13 • score ${last.score} • grade ${last.grade}`, 60, 664, 15.5, '#8fb8d4', 'left', 400);
  } else {
    text(ctx, 'LAST HUNT: —', 60, 664, 15.5, '#5f7d99', 'left', 400);
  }

  // the SAIL button
  const pulse = 0.82 + 0.18 * Math.sin(view.t * 3.2);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#2e9e57';
  rr(ctx, sail.x, sail.y, sail.w, sail.h, 12);
  ctx.fill();
  ctx.restore();
  text(ctx, 'SAIL ▶', sail.x + sail.w / 2, sail.y + 42, 31, '#ffffff', 'center', 800);
  text(ctx, 'ENTER / SPACE / click', sail.x + sail.w / 2, sail.y + 88, 14, '#8fb8d4', 'center', 400);

  drawDemoWindow(ctx, demo, view);
}
