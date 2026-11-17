// end.js — one job: the end screen. The season's verdict with its GRADE
// medal, the sea route, every stat, all thirteen counts, and the FEATS.
import { MONSTERS, FEATS, DIFFICULTIES } from './data.js';
import { journalCount, nextGoal, gradeForScore } from './state.js';
import { text, panel, drawRouteStrip, GRADE_COLORS } from './ui.js';

export function drawEnd(ctx, run, best) {
  ctx.fillStyle = 'rgba(2,5,10,0.55)';
  ctx.fillRect(0, 0, 1280, 720);
  panel(ctx, 120, 26, 1040, 668, 0.94);
  const won = run.result === 'victory';
  const grade = gradeForScore(run.score);
  text(ctx, won ? '🏆 VICTORY!' : '🌅 THE SEASON ENDS', 640, 88, 44, '#ffd94d', 'center', 800);
  text(ctx, won ? 'Bestiary complete — all 13 monsters hauled!' : `The bestiary stands at ${journalCount(run)}/13 — the Kraken still waits.`, 640, 122, 21, '#eaf6ff', 'center');
  // the grade medal, top right
  ctx.fillStyle = GRADE_COLORS[grade];
  ctx.beginPath();
  ctx.arc(986, 112, 36, 0, 6.29);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, grade, 986, 126, 38, '#0b1420', 'center', 800);
  text(ctx, 'SEASON GRADE', 986, 166, 12, '#8fb8d4', 'center', 800);

  const stats = [
    ['Biggest haul', run.biggestName ? `${run.biggestName} — ${run.biggestKg.toFixed(1)} kg` : '—', 'Score', `${run.score}`],
    ['Longest combo', `×${run.bestCombo}`, 'Peak tension', `${Math.round(run.peakTension)}%`],
    ['Total throws', `${run.throws}`, 'Monsters hauled', `${run.hauled}`],
    ['Coins earned', `${run.coinsEarned} 🪙`, 'Difficulty', `${DIFFICULTIES[run.difficulty].name} ×${DIFFICULTIES[run.difficulty].mult.toFixed(1)}`],
  ];
  stats.forEach(([k1, v1, k2, v2], i) => {
    const y = 186 + i * 30;
    text(ctx, k1, 190, y, 20, '#aee6ff');
    text(ctx, v1, 428, y, 20, '#ffffff');
    text(ctx, k2, 706, y, 20, '#aee6ff');
    text(ctx, v2, 898, y, 20, '#ffffff');
  });

  drawRouteStrip(ctx, run, 190, 306);

  text(ctx, 'HAULS BY MONSTER', 190, 352, 16, '#8fb8d4', 'left', 800);
  MONSTERS.forEach((m, i) => {
    const col = Math.floor(i / 5);
    const row = i % 5;
    const caught = run.bestiary[i].count > 0;
    text(ctx, `${m.name} ×${run.bestiary[i].count}`, 190 + col * 330, 378 + row * 20, 15.5, caught ? '#cfe8ff' : '#5f7d99', 'left', 400);
  });

  text(ctx, 'FEATS', 190, 492, 16, '#8fb8d4', 'left', 800);
  FEATS.forEach((f, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = 190 + col * 500;
    const y = 518 + row * 23;
    const earned = !!run.feats[f.id];
    text(ctx, earned ? `★ ${f.name}` : `☆ ${f.name}`, x, y, 16.5, earned ? '#ffd94d' : '#5f7d99', 'left', 700);
    const w = ctx.measureText(earned ? `★ ${f.name}` : `☆ ${f.name}`).width;
    text(ctx, `— ${f.desc}`, x + w + 10, y, 13, earned ? '#8fb8d4' : '#46617c', 'left', 400);
  });

  const goal = won
    ? `Next goal: haul a Mother Kraken heavier than ${run.biggestKg.toFixed(1)} kg`
    : nextGoal({ result: 'x', species: journalCount(run), biggestKg: run.biggestKg });
  text(ctx, goal, 640, 626, 20, '#ffd94d', 'center');
  if (best && best.result) {
    text(ctx, `BEST: ${best.result} • grade ${best.grade || '—'} • score ${best.score || 0} • biggest ${best.biggestName} ${best.biggestKg.toFixed(1)} kg • combo ×${best.combo} • ${best.coins} 🪙`, 640, 654, 17.5, '#ffe9a8', 'center', 400);
  }
  text(ctx, 'Press R to sail again', 640, 682, 22, '#7fd4ff', 'center', 800);
}
