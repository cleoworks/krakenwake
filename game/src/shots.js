// shots.js — one job: the staged ?shot=NAME states the four screenshots
// are taken from. Each is a real run object, frozen mid-moment.
import { createRun } from './state.js';

function markCaught(r, list) {
  list.forEach(([i, count]) => {
    r.bestiary[i].count = count;
  });
}
const CAUGHT_9 = [[0, 6], [1, 4], [2, 5], [3, 1], [4, 5], [5, 3], [6, 2], [7, 5], [8, 3]];
const CAUGHT_13 = [[0, 4], [1, 3], [2, 4], [3, 5], [4, 2], [5, 3], [6, 4], [7, 5], [8, 2], [9, 3], [10, 4], [11, 6], [12, 2]];

export function stageShot(name, view, burst) {
  const r = createRun(1);
  r.screen = 'game';
  view.t = 1.35;
  if (name === 'cover') {
    // no staged pose: the fight state below puts him mid-DASH, and
    // poseOf reads the dash straight off the fight (ninja.js)
    r.night = 5; r.weatherIdx = 3; r.sea = 2; r.seasOpen = [true, true, true];
    r.coins = 1240; r.combo = 6; r.bestCombo = 6; r.throws = 34; r.hauled = 30;
    r.score = 5310; r.boons = ['cable', 'winch'];
    r.tonightHauls = [
      { mi: 8, coins: 412 }, { mi: 11, coins: 286 },
      { mi: 7, coins: 190 }, { mi: 10, coins: 244 },
      { mi: 9, coins: 171 },
    ];
    r.nightStats = { hauls: 5, snaps: 1, coins: 1303, score: 1490 };
    markCaught(r, CAUGHT_9);
    r.phase = 'fight';
    r.castDist = 73;
    r.surgeCharges = 1; r.surgeFill = 0.5;
    // frozen at THE VANISH: the wyrm's COIL SLAM is telegraphed and
    // rearing down at the spot the ninja just left — he is mid-dash
    // (afterimages on the dock), the dodge was PERFECT, so the counter
    // window is open: the crimson weak point flares on the wyrm's
    // throat. ONE shout only — VANISH! hangs in the callout column:
    // no VITAL tick (vitalFlash 0), and surgePhase puts surge01
    // under the THRASHING line, so the column stays quiet otherwise
    r.fight = {
      mi: 12, dist: 73, tension: 63, t: 6.4, snapT: 0, surgePhase: 2.0, stamina: 46,
      wpNext: 5, wpT: 0.9, wpFake: false, wpDx: 0.3, wpDy: 0.9,
      evIn: 8, evCount: 1, event: { id: 'slam', phase: 'tele', t: 0.35 },
      surgeT: 0, vitalAcc: 0, vitalFlash: 0, spikeT: 0, inkT: 0,
      dashT: 0.18, dashCd: 0.9, counterT: 1.6, vanishFlash: 0.6,
    };
    burst(950, 436, 10, ['#dff2ff', '#9fd0ee', '#ffffff'], 170, 5);
    return { r, mode: 'game' };
  }
  if (name === 'briefing') {
    // the demo window stages the hunt itself: the King Wyrm on the
    // chain in his own Maw under the Blood Moon — moon, glint, chain
    // arc and all — while the same sea glows dimly behind the scrim
    const demoShot = createRun(7);
    demoShot.sea = 2; demoShot.weatherIdx = 3; demoShot.castDist = 73;
    demoShot.phase = 'fight';
    demoShot.fight = {
      mi: 12, dist: 73, tension: 63, t: 6.4, snapT: 0, surgePhase: 2.0, stamina: 46,
      wpNext: 5, wpT: 0.9, wpFake: false, wpDx: 0.3, wpDy: 0.9,
      evIn: 8, evCount: 1, event: null,
      surgeT: 0, vitalAcc: 0, vitalFlash: 0, spikeT: 0, inkT: 0,
      dashT: 0, dashCd: 0, counterT: 0, vanishFlash: 0,
    };
    // the BEST on the briefing is the very season the victory screen
    // shows — same score, grade, combo and coins
    const shotBest = { result: 'BESTIARY COMPLETE', species: 13, combo: 11, coins: 4210, score: 9650, grade: 'S' };
    const shotLast = { result: 'BESTIARY COMPLETE', species: 13, score: 9650, grade: 'S' };
    return { r, mode: 'briefing', difficulty: 1, bestOverride: shotBest, lastOverride: shotLast, demoShot };
  }
  if (name === 'draft') {
    r.screen = 'draft';
    r.night = 4; r.weatherIdx = 2; r.sea = 1; r.seasOpen = [true, true, true];
    r.coins = 760; r.score = 3950; r.throws = 26; r.hauled = 22;
    r.boons = ['cable', 'winch'];
    r.nightGrades = ['S', 'A', 'S'];
    r.nightSeas = [0, 0, 1, 2, 2, 2];
    // behind the panel the night is still on: a Gale over the
    // Drowning Deep, the Corpse Whale mid-fight on the chain, her
    // weak point open — the backdrop (vendor/scenery.js) stages her
    // flank and fluke in the water the panel cannot cover
    r.phase = 'fight';
    r.fight = {
      mi: 3, dist: 55, tension: 42, t: 5.2, snapT: 0, surgePhase: 0, stamina: 58,
      wpNext: 5, wpT: 0.9, wpFake: false, wpDx: 0.2, wpDy: 0.1,
      evIn: 8, evCount: 0, event: null,
      surgeT: 0, vitalAcc: 0, vitalFlash: 0, spikeT: 0, inkT: 0,
      dashT: 0, dashCd: 0, counterT: 0, vanishFlash: 0,
    };
    r.tonightHauls = [];
    r.lastNightHauls = [
      { mi: 0, coins: 41 }, { mi: 2, coins: 76 },
      { mi: 5, coins: 82 }, { mi: 1, coins: 49 },
      { mi: 6, coins: 148 }, { mi: 4, coins: 88 },
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
  r.throws = 63; r.hauled = 47;
  r.score = 9650; r.difficulty = 1;
  r.nightGrades = ['S', 'A', 'S', 'A', 'S'];
  r.feats = { first: true, untouched: true, wyrm: true, full: true, combo8: true, heavy: true, rich: true };
  markCaught(r, CAUGHT_13);
  const shotBest = { result: 'BESTIARY COMPLETE', species: 13, combo: 11, coins: 4210, score: 9650, grade: 'S' };
  return { r, mode: 'end', bestOverride: shotBest };
}
