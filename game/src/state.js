// state.js — the persistent BEST record (localStorage) and the hunting-only
// stats a run accumulates. End screens read exactly these numbers.
const KEY = 'krakenwake-best-v1';

export function newStats() {
  return {
    casts: 0, catches: 0, coinsEarned: 0, longestCombo: 0,
    peakTension: 0, biggest: null, // { id, name, kg }
    perSpecies: {},                // id -> { count, best }
  };
}

export function loadBest() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage unavailable (Node sim, privacy mode) */ }
  return null;
}

export function saveBest(best) {
  try { globalThis.localStorage?.setItem(KEY, JSON.stringify(best)); } catch { /* ignore */ }
}

// Fold a finished run into the BEST record; returns the record now standing.
export function recordBest(run) {
  const prev = loadBest();
  const mine = {
    result: run.screen === 'victory' ? 'BESTIARY COMPLETE' : `${run.journalCount}/13 monsters`,
    species: run.journalCount,
    biggestKg: run.stats.biggest ? run.stats.biggest.kg : 0,
    biggestName: run.stats.biggest ? run.stats.biggest.name : '—',
    combo: run.stats.longestCombo,
    coins: run.stats.coinsEarned,
    day: run.day,
  };
  const better = !prev
    || (mine.result === 'BESTIARY COMPLETE' && prev.result !== 'BESTIARY COMPLETE')
    || (mine.result === prev.result && mine.biggestKg > prev.biggestKg)
    || (mine.species > prev.species);
  const best = better ? mine : prev;
  if (better) saveBest(best);
  return best;
}

// The NEXT GOAL line on end screens: always a hunting goal, never generic.
export function nextGoal(run) {
  if (run.screen === 'victory') {
    return `Next goal: haul a Mother Kraken heavier than ${run.stats.biggest.kg.toFixed(1)} kg`;
  }
  const missing = 13 - run.journalCount;
  if (run.location < 2) return `Next goal: unlock ${run.location === 0 ? 'The Drowning Deep' : "Kraken's Maw"} — ${missing} monsters still hide there`;
  return `Next goal: ${missing} monsters left — the Doom Bell in Kraken's Maw calls the rare ones`;
}
