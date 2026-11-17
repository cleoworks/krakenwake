// data.js — every table in KRAKENWAKE hangs off the one hunting loop:
// monsters you can harpoon, lures that change what bites, harpoons that
// change the fight, seas that change the pool, weather that changes the night.
export const DAY_LEN = 75;          // seconds of hunting per night
export const SEASON_DAYS = 6;       // fill the bestiary before night 6 ends
export const STRIKE_WINDOW = 0.6;   // seconds to strike once a monster bites

// tier: 0 common, 1 uncommon, 2 rare, 3 legendary.
// w: bite weight inside its sea pool. stam: fight stamina.
// pull: how hard it drags against the winch. win: strike-window multiplier.
// c1: body tint. c2: the glow — eyes, fins, the part you see in the dark.
export const SPECIES = [
  { id: 'eel',      name: 'Gloam Eel',       loc: 0, tier: 0, w: 30, base: 8,   wt: [0.02, 0.12], stam: 6,  pull: 1.5, win: 1.15, len: 26, c1: '#2e4a3f', c2: '#8affc1' },
  { id: 'crab',     name: 'Hullback Crab',   loc: 0, tier: 0, w: 26, base: 12,  wt: [0.1, 0.5],   stam: 9,  pull: 2.2, win: 1.05, len: 34, c1: '#4a2e35', c2: '#ff9a7a' },
  { id: 'sailfin',  name: 'Sailfin Horror',  loc: 0, tier: 0, w: 22, base: 18,  wt: [0.5, 2.4],   stam: 14, pull: 3.0, win: 1.0,  len: 48, c1: '#33354d', c2: '#b9bdd6' },
  { id: 'whale',    name: 'Corpse Whale',    loc: 0, tier: 2, w: 10, base: 70,  wt: [0.8, 3.2],   stam: 16, pull: 3.4, win: 0.95, len: 50, c1: '#3d4457', c2: '#d8fbff' },
  { id: 'monkfish', name: 'Pale Monkfish',   loc: 1, tier: 0, w: 27, base: 17,  wt: [0.1, 0.6],   stam: 9,  pull: 2.6, win: 1.0,  len: 34, c1: '#4d4a38', c2: '#ffe28a' },
  { id: 'witch',    name: 'Sargasso Witch',  loc: 1, tier: 0, w: 25, base: 28,  wt: [0.3, 1.8],   stam: 15, pull: 4.0, win: 0.95, len: 46, c1: '#274435', c2: '#8affc1' },
  { id: 'shark',    name: 'Ironjaw Shark',   loc: 1, tier: 1, w: 15, base: 44,  wt: [1.5, 6.5],   stam: 26, pull: 5.0, win: 1.0,  len: 62, c1: '#39424e', c2: '#cfd8dc' },
  { id: 'king',     name: 'Drowned King',    loc: 1, tier: 2, w: 10, base: 80,  wt: [0.6, 2.2],   stam: 20, pull: 4.4, win: 0.8,  len: 58, c1: '#3a2e4d', c2: '#ffd23e' },
  { id: 'ghost',    name: 'Ghost Leviathan', loc: 2, tier: 0, w: 27, base: 34,  wt: [0.2, 0.9],   stam: 12, pull: 3.0, win: 1.0,  len: 36, c1: '#2e4053', c2: '#bffbff' },
  { id: 'choir',    name: 'Abyssal Choir',   loc: 2, tier: 0, w: 24, base: 50,  wt: [0.4, 2.0],   stam: 18, pull: 4.2, win: 0.97, len: 44, c1: '#372b4d', c2: '#c9a7ff' },
  { id: 'turtle',   name: 'Doom Turtle',     loc: 2, tier: 1, w: 13, base: 85,  wt: [4, 14],      stam: 38, pull: 6.0, win: 1.0,  len: 84, c1: '#22382e', c2: '#8affc1' },
  { id: 'squid',    name: 'Wrath Squid',     loc: 2, tier: 2, w: 10, base: 140, wt: [1.2, 4.5],   stam: 26, pull: 5.6, win: 0.92, len: 56, c1: '#4d2436', c2: '#ff7a9c' },
  { id: 'kraken',   name: 'Mother Kraken',   loc: 2, tier: 3, w: 4.5, base: 600, wt: [25, 80],     stam: 60, pull: 8.0, win: 0.9,  len: 110, c1: '#120d1f', c2: '#ff4d3e' },
];
export const speciesById = (id) => SPECIES.find((s) => s.id === id);
export const poolFor = (loc) => SPECIES.filter((s) => s.loc === loc);

// reel: metres/second hauled in. control: divides tension build-up.
export const RODS = [
  { name: 'Deck Harpoon',  cost: 0,   reel: 1.0,  control: 1.0 },
  { name: 'Iron Winch',    cost: 120, reel: 1.35, control: 1.3 },
  { name: 'Leviathan Rig', cost: 350, reel: 1.8,  control: 1.7 },
];

// wait: bite-delay multiplier. tierMul: bite-weight multiplier per rarity tier.
export const BAITS = [
  { name: 'Chum Bucket',   cost: 0,   wait: 1.0,  tierMul: [1, 1, 1, 1] },
  { name: 'Blood Lure',    cost: 40,  wait: 0.8,  tierMul: [1.1, 1, 1, 1] },
  { name: 'Lantern Squid', cost: 50,  wait: 0.95, tierMul: [0.9, 1.6, 1.6, 1] },
  { name: 'Doom Bell',     cost: 100, wait: 0.85, tierMul: [0.9, 1.2, 2.2, 3] },
];

export const LOCATIONS = [
  { name: "Widow's Shoal",    cost: 0,   sky: ['#0d1b33', '#274268'], hill: '#16233d', water: ['#1d3a5f', '#0a1a30'] },
  { name: 'The Drowning Deep', cost: 200, sky: ['#08131f', '#1c3242'], hill: '#101e2c', water: ['#14313d', '#061520'] },
  { name: "Kraken's Maw",     cost: 450, sky: ['#0a0618', '#2b1d47'], hill: '#150f2a', water: ['#1d1440', '#070313'] },
];

// bite: wait multiplier. rare: rare+legendary weight multiplier. gust: tension noise.
export const WEATHERS = [
  { id: 'calm',      name: 'Dead Calm', bite: 1.0,  rare: 1.1, gust: 0 },
  { id: 'bloodmoon', name: 'Blood Moon', bite: 0.8, rare: 1.3, gust: 0.2 },
  { id: 'fog',       name: 'Fog',       bite: 0.9,  rare: 1.0, gust: 0.1 },
  { id: 'gale',      name: 'Gale',      bite: 1.15, rare: 1.0, gust: 1 },
];
export const weatherForDay = (rng) => WEATHERS[rng.int(0, WEATHERS.length - 1)];
