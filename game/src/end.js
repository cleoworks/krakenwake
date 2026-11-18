// end.js — one job: the end screen. The season's verdict with its GRADE
// medal, the sea route, every stat as a tile, all thirteen counts as
// chips, and the FEATS as a checklist.
import { MONSTERS, FEATS, DIFFICULTIES } from './data.js';
import { journalCount, nextGoal, gradeForScore } from './state.js';
import { text, panel, drawRouteStrip, GRADE_COLORS } from './ui.js';
import { panelTexture, statTile, monsterChip, featRow } from './vendor/screens.js';

export function drawEnd(ctx, run, best) {
  ctx.fillStyle = 'rgba(2,5,10,0.36)';
  ctx.fillRect(0, 0, 1280, 720);
  panel(ctx, 120, 14, 1040, 690, 0.9);
  panelTexture(ctx, 120, 14, 1040, 690);
  const won = run.result === 'victory';
  const grade = gradeForScore(run.score);
  text(ctx, won ? '🏆 VICTORY!' : '🌅 THE SEASON ENDS', 640, 70, 44, '#ffd94d', 'center', 800);
  text(ctx, won ? 'Bestiary complete — all 13 monsters hauled!' : `The bestiary stands at ${journalCount(run)}/13 — the Wyrm still waits.`, 640, 102, 21, '#eaf6ff', 'center');
  // the grade medal, top right — a coin with its glow rings
  ctx.fillStyle = 'rgba(255,217,77,0.13)';
  ctx.beginPath();
  ctx.arc(1002, 88, 59, 0, 6.29);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,217,77,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1002, 88, 55, 0, 6.29);
  ctx.stroke();
  ctx.fillStyle = GRADE_COLORS[grade];
  ctx.beginPath();
  ctx.arc(1002, 88, 50, 0, 6.29);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.stroke();
  text(ctx, grade, 1002, 105, 46, '#0b1420', 'center', 800);
  text(ctx, 'SEASON GRADE', 1002, 158, 12, '#8fb8d4', 'center', 800);

  const diff = DIFFICULTIES[run.difficulty];
  const tiles = [
    ['Score', `${run.score}`, 25], ['Coins earned', `${run.coinsEarned} 🪙`, 25],
    ['Monsters hauled', `${run.hauled}`, 25], ['Total throws', `${run.throws}`, 25],
    ['Longest combo', `×${run.bestCombo}`, 25], ['Peak tension', `${Math.round(run.peakTension)}%`, 25],
    ['Difficulty', `${diff.name} ×${diff.mult.toFixed(1)}`, 22],
    ['King Wyrm', run.feats.wyrm ? 'Hauled — Wyrm Slayer' : 'Still waiting', 16],
  ];
  tiles.forEach(([label, value, vpix], i) => {
    statTile(ctx, 150 + (i % 4) * 250, 168 + Math.floor(i / 4) * 66, 230, 58, label, value, vpix);
  });

  drawRouteStrip(ctx, run, 436, 316);

  text(ctx, 'HAULS BY MONSTER', 150, 360, 16, '#8fb8d4', 'left', 800);
  MONSTERS.forEach((m, i) => {
    monsterChip(ctx, m, run.bestiary[i].count, 150 + Math.floor(i / 5) * 332, 372 + (i % 5) * 28, 316);
  });

  panel(ctx, 150, 520, 980, 104, 0.5);
  text(ctx, 'FEATS', 170, 542, 15, '#8fb8d4', 'left', 800);
  FEATS.forEach((f, i) => {
    const col = i < 4 ? 0 : 1;
    featRow(ctx, f, !!run.feats[f.id], 170 + col * 482, 562 + (i % 4) * 18, 458);
  });

  const goal = won
    ? `Next goal: beat your score of ${run.score}`
    : nextGoal({ result: 'x', species: journalCount(run) });
  text(ctx, goal, 640, 646, 20, '#ffd94d', 'center');
  if (best && best.result) {
    text(ctx, `BEST: ${best.result} • grade ${best.grade || '—'} • score ${best.score || 0} • combo ×${best.combo} • ${best.coins} 🪙`, 640, 670, 17.5, '#ffe9a8', 'center', 400);
  }
  text(ctx, 'Press R to sail again', 640, 694, 22, '#7fd4ff', 'center', 800);
}
