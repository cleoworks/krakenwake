// shots.js — one job: the staged ?shot=NAME states the four screenshots are
// taken from. Each is a real run object, frozen mid-moment: the Kraken
// fight for the cover, the briefing with a filled BEST, the salvage draft
// after night 3, and the S-grade victory.
import { createRun } from './state.js';

function markCaught(r, list) {
  list.forEach(([i, count, kg]) => {
    r.bestiary[i].count = count;
    r.bestiary[i].bestKg = kg;
  });
}
const CAUGHT_9 = [[0, 6, 4.1], [1, 4, 6.2], [2, 5, 8.4], [3, 1, 33.0], [4, 5, 9.1], [5, 3, 6.8], [6, 2, 19.4], [7, 5, 15.2], [8, 3, 38.6]];
const CAUGHT_13 = [[0, 4, 4.4], [1, 3, 6.6], [2, 4, 8.8], [3, 5, 36.2], [4, 2, 9.4], [5, 3, 7.2], [6, 4, 21.0], [7, 5, 16.8], [8, 2, 41.3], [9, 3, 10.9], [10, 4, 30.5], [11, 6, 18.2], [12, 2, 52.4]];

export function stageShot(name, view, burst) {
  const r = createRun(1);
  r.screen = 'game';
  view.t = 1.35;
  if (name === 'cover') {
    r.night = 5; r.weatherIdx = 3; r.sea = 2; r.seasOpen = [true, true, true];
    r.coins = 1240; r.combo = 6; r.bestCombo = 6; r.throws = 34; r.hauled = 30;
    r.score = 5310; r.boons = ['cable', 'winch'];
    r.tonightHauls = [
      { mi: 8, kg: 38.6, coins: 412 }, { mi: 11, kg: 17.9, coins: 286 },
      { mi: 7, kg: 15.2, coins: 190 }, { mi: 10, kg: 28.4, coins: 244 },
      { mi: 9, kg: 10.9, coins: 171 },
    ];
    r.nightStats = { hauls: 5, snaps: 1, coins: 1303, score: 1490 };
    markCaught(r, CAUGHT_9);
    r.phase = 'fight';
    r.castDist = 62;
    r.fight = { mi: 12, kg: 58, dist: 62, tension: 63, t: 1.2, snapT: 0, surgePhase: 0, stamina: 48 };
    burst(800, 436, 16, ['#dff2ff', '#9fd0ee', '#ffffff'], 170, 5);
    return { r, mode: 'game' };
  }
  if (name === 'briefing') {
    const demoShot = createRun(7);
    demoShot.sea = 1; demoShot.weatherIdx = 1; demoShot.castDist = 58;
    demoShot.phase = 'wait';
    demoShot.wait = { t: 2, biteIn: 3, open: false, window: 0, telegraph: true, fakes: [], dip: 0.2 };
    const shotBest = { result: 'BESTIARY COMPLETE', species: 13, biggestKg: 52.4, biggestName: 'Mother Kraken', combo: 11, coins: 4210, score: 8120, grade: 'A' };
    const shotLast = { result: 'BESTIARY COMPLETE', species: 13, score: 6980, grade: 'A' };
    return { r, mode: 'briefing', difficulty: 1, bestOverride: shotBest, lastOverride: shotLast, demoShot };
  }
  if (name === 'draft') {
    r.screen = 'draft';
    r.night = 4; r.weatherIdx = 2; r.sea = 2; r.seasOpen = [true, true, true];
    r.coins = 760; r.score = 3950; r.throws = 26; r.hauled = 22;
    r.boons = ['cable', 'winch'];
    r.nightGrades = ['S', 'A', 'S'];
    r.nightSeas = [0, 0, 1];
    r.tonightHauls = [];
    r.lastNightHauls = [
      { mi: 0, kg: 4.1, coins: 41 }, { mi: 2, kg: 8.4, coins: 76 },
      { mi: 5, kg: 6.8, coins: 82 }, { mi: 1, kg: 6.2, coins: 49 },
      { mi: 6, kg: 19.4, coins: 148 }, { mi: 4, kg: 9.1, coins: 88 },
    ];
    r.draft = { choices: ['grip', 'glow', 'sails'], afterNight: 3 };
    markCaught(r, CAUGHT_9);
    return { r, mode: 'draft' };
  }
  // victory
  r.screen = 'end';
  r.result = 'victory';
  r.night = 6; r.weatherIdx = 1; r.sea = 2;
  r.coins = 860; r.coinsEarned = 4210; r.bestCombo = 11; r.peakTension = 96;
  r.throws = 63; r.hauled = 47; r.biggestKg = 52.4; r.biggestName = 'Mother Kraken';
  r.score = 9650; r.difficulty = 1;
  r.nightGrades = ['S', 'A', 'S', 'A', 'S'];
  r.feats = { first: true, untouched: true, kraken: true, full: true, combo8: true, heavy: true, rich: true };
  markCaught(r, CAUGHT_13);
  const shotBest = { result: 'BESTIARY COMPLETE', species: 13, biggestKg: 52.4, biggestName: 'Mother Kraken', combo: 11, coins: 4210, score: 9650, grade: 'S' };
  return { r, mode: 'end', bestOverride: shotBest };
}
