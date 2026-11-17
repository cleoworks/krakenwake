// state.js — one job: what a run is. Creation, bestiary bookkeeping, the
// persistent BEST record and the NEXT GOAL line. No rules live here.
import { MONSTERS } from './data.js';
import { makeRng } from './rng.js';

export function createRun(seed) {
  return {
    rng: makeRng(seed),
    screen: 'game', // main.js flips the browser run to 'title'; the sim plays at once
    night: 1,
    nightT: 0,
    weatherIdx: 0,
    coins: 0,
    coinsEarned: 0,
    combo: 0,
    bestCombo: 0,
    peakTension: 0,
    sea: 0,
    harpoon: 0,
    lure: 0,
    ownedH: [true, false, false],
    ownedL: [true, false, false, false],
    seasOpen: [true, false, false],
    bestiary: MONSTERS.map(() => ({ count: 0, bestKg: 0 })),
    throws: 0,
    hauled: 0,
    biggestKg: 0,
    biggestName: '',
    phase: 'idle', // idle | charge | wait | fight
    charge: 0,
    chargeDir: 1,
    castDist: 0,
    wait: null,
    fight: null,
    events: [],
    result: null, // 'victory' | 'over' once screen === 'end'
    difficulty: 0, // index into DIFFICULTIES; set from the briefing
    score: 0, // haul value x combo x difficulty, apart from coins
    boons: [], // draft boon ids, in pick order
    draft: null, // { choices: [boonId x3], afterNight } on the draft screen
    nightStats: { hauls: 0, snaps: 0, coins: 0, score: 0 }, // reset nightly
    nightGrades: [], // one letter per completed night
    feats: {}, // feat id -> true once earned
    charmReady: true, // Sailor's Charm re-arms every night
    surgeCharges: 0, // banked SURGE charges (max 2), spent with F
    surgeFill: 0, // next-charge progress: hauls 0.5, vital ticks 0.25
  };
}

// Season grade from the final score: the medal on the end screen and in BEST.
export function gradeForScore(score) {
  if (score >= 8500) return 'S';
  if (score >= 6000) return 'A';
  if (score >= 3800) return 'B';
  return 'C';
}

export const journalCount = (run) => run.bestiary.reduce((n, b) => n + (b.count > 0 ? 1 : 0), 0);

export function emptyBest() {
  return { result: '', species: 0, biggestKg: 0, biggestName: '', combo: 0, coins: 0, score: 0, grade: '' };
}

// The better of two finished runs, for the BEST line: species, then
// score, then biggest haul, then combo, then coins.
export function betterBest(prev, run) {
  const mine = {
    result: run.result === 'victory' ? 'BESTIARY COMPLETE' : `${journalCount(run)}/13 species`,
    species: journalCount(run),
    biggestKg: run.biggestKg,
    biggestName: run.biggestName,
    combo: run.bestCombo,
    coins: run.coinsEarned,
    score: run.score,
    grade: gradeForScore(run.score),
  };
  if (!prev || !prev.result) return mine;
  const a = [mine.species, mine.score, mine.biggestKg, mine.combo, mine.coins];
  const b = [prev.species || 0, prev.score || 0, prev.biggestKg || 0, prev.combo || 0, prev.coins || 0];
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) return mine;
    if (a[i] < b[i]) return prev;
  }
  return prev;
}

export function nextGoal(best) {
  if (!best || !best.result) return 'Next goal: complete the bestiary — kill the Mother Kraken';
  if (best.species >= 13) return `Next goal: haul a Mother Kraken heavier than ${best.biggestKg.toFixed(1)} kg`;
  return `Next goal: complete the bestiary (${best.species}/13 so far)`;
}
