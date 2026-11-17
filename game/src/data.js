// data.js — one job: every table the game runs on. Monsters, seas, harpoons,
// lures, weather. Nothing here decides anything; fishing.js reads it all.
export const SEASON_NIGHTS = 6;
export const NIGHT_SECONDS = 75;

export const SEAS = [
  { name: "Widow's Shoal", unlock: 0 },
  { name: 'The Drowning Deep', unlock: 200 },
  { name: "Kraken's Maw", unlock: 450 },
];

export const HARPOONS = [
  { name: 'Deck Harpoon', price: 0, reel: 11, control: 15 },
  { name: 'Iron Winch', price: 150, reel: 16, control: 23 },
  { name: 'Leviathan Rig', price: 350, reel: 22, control: 32 },
];

export const LURES = [
  { name: 'Chum Bucket', price: 0, bite: 1.0, doom: false },
  { name: 'Blood Lure', price: 60, bite: 0.82, doom: false },
  { name: 'Lantern Squid', price: 80, bite: 0.7, doom: false },
  { name: 'Doom Bell', price: 100, bite: 0.85, doom: true },
];

// bite scales the wait for a bite (lower is faster); odds boosts rare weights.
export const WEATHERS = [
  { name: 'Dead Calm', bite: 1.1, odds: 1.0 },
  { name: 'Fog', bite: 0.95, odds: 1.05 },
  { name: 'Gale', bite: 0.8, odds: 1.1 },
  { name: 'Blood Moon', bite: 0.9, odds: 1.3 },
];

// sea: index into SEAS. power: how hard it pulls in a fight. weight: how often
// it bites. vpk: coins per kg before the combo multiplier. fake: how much it
// loves a fake-bite. doom: only answers the Doom Bell.
export const MONSTERS = [
  { name: 'Gloam Eel', sea: 0, kgMin: 1.5, kgMax: 5, power: 21, weight: 30, vpk: 3.6, fake: 0.2, doom: false, shape: 'eel', color: '#57e6a9' },
  { name: 'Hullback Crab', sea: 0, kgMin: 2, kgMax: 7, power: 25, weight: 26, vpk: 3.5, fake: 0.1, doom: false, shape: 'crab', color: '#e8834f' },
  { name: 'Sailfin Horror', sea: 0, kgMin: 3, kgMax: 9, power: 29, weight: 22, vpk: 4.0, fake: 0.3, doom: false, shape: 'sail', color: '#7fb2e8' },
  { name: 'Corpse Whale', sea: 1, kgMin: 18, kgMax: 40, power: 34, weight: 20, vpk: 2.6, fake: 0.05, doom: false, shape: 'whale', color: '#9fb4c8' },
  { name: 'Pale Monkfish', sea: 1, kgMin: 4, kgMax: 10, power: 31, weight: 22, vpk: 4.6, fake: 0.25, doom: false, shape: 'monk', color: '#d8e4ee' },
  { name: 'Sargasso Witch', sea: 1, kgMin: 3, kgMax: 8, power: 33, weight: 18, vpk: 5.2, fake: 0.5, doom: false, shape: 'witch', color: '#8fe388' },
  { name: 'Ironjaw Shark', sea: 1, kgMin: 10, kgMax: 24, power: 40, weight: 16, vpk: 4.2, fake: 0.15, doom: false, shape: 'shark', color: '#aebfd4' },
  { name: 'Drowned King', sea: 2, kgMin: 8, kgMax: 18, power: 42, weight: 16, vpk: 5.0, fake: 0.3, doom: false, shape: 'king', color: '#e8c85a' },
  { name: 'Ghost Leviathan', sea: 2, kgMin: 20, kgMax: 45, power: 46, weight: 12, vpk: 5.2, fake: 0.2, doom: false, shape: 'ghost', color: '#cfe9ff' },
  { name: 'Abyssal Choir', sea: 2, kgMin: 5, kgMax: 12, power: 44, weight: 13, vpk: 6.0, fake: 0.45, doom: false, shape: 'choir', color: '#b48fe8' },
  { name: 'Doom Turtle', sea: 2, kgMin: 15, kgMax: 35, power: 48, weight: 12, vpk: 4.8, fake: 0.1, doom: false, shape: 'turtle', color: '#7fc86a' },
  { name: 'Wrath Squid', sea: 2, kgMin: 9, kgMax: 20, power: 50, weight: 11, vpk: 6.4, fake: 0.35, doom: false, shape: 'squid', color: '#e86a7a' },
  { name: 'Mother Kraken', sea: 2, kgMin: 45, kgMax: 65, power: 58, weight: 6, vpk: 10, fake: 0.2, doom: true, shape: 'kraken', color: '#ff5a4e' },
];

export const KRAKEN_INDEX = 12;
export const poolFor = (sea) => MONSTERS.map((m, i) => i).filter((i) => MONSTERS[i].sea === sea);

// Difficulty: chosen on the briefing screen. mult scales SCORE (never coins);
// power scales how hard monsters pull; regen scales stamina recovery while
// the cable is slack (Leviathan monsters catch their breath faster).
export const DIFFICULTIES = [
  { name: 'FISHERMAN', mult: 1.0, power: 1.0, regen: 1.0, blurb: 'A fair sea. Score ×1' },
  { name: 'HARPOONEER', mult: 1.3, power: 1.15, regen: 1.0, blurb: 'Monsters fight harder. Score ×1.3' },
  { name: 'LEVIATHAN', mult: 1.6, power: 1.35, regen: 1.5, blurb: 'Much harder fights, fast stamina regen. Score ×1.6' },
];

// The salvage draft pool: after each night (1-5) the hunter picks 1 of 3.
// Every boon is a real run modifier read by fishing.js; they stack all season.
export const BOONS = [
  { id: 'cable', code: 'RC', name: 'Reinforced Cable', desc: 'The safe tension band widens — the cable holds deeper into the red.' },
  { id: 'winch', code: 'BW', name: 'Brass Winch', desc: '+25% reel speed on every harpoon you own.' },
  { id: 'chum', code: 'BC', name: 'Blood Chum', desc: 'Monsters find the lure 20% faster, every night.' },
  { id: 'aperture', code: 'WA', name: 'Wide Aperture', desc: 'The strike window stays open 50% longer.' },
  { id: 'charm', code: 'SC', name: "Sailor's Charm", desc: 'Once per night, a snapped cable does not break your combo.' },
  { id: 'grip', code: 'IG', name: 'Iron Grip', desc: 'Monster stamina regens at half speed while you slacken.' },
  { id: 'glow', code: 'GB', name: 'Glow Bait', desc: 'Rare monsters answer the lure far more often.' },
  { id: 'sails', code: 'SS', name: 'Storm Sails', desc: 'Weather penalties on the bite are halved.' },
  { id: 'sinkers', code: 'HS', name: 'Heavy Sinkers', desc: 'Heavier specimens take the lure — bigger hauls, bigger scores.' },
];
export const boonById = (id) => BOONS.find((b) => b.id === id);

// Season feats: earned states are tracked on the run and shown on the end
// screen, earned in gold, locked in grey.
export const FEATS = [
  { id: 'first', name: 'First Blood', desc: 'Haul your first monster' },
  { id: 'untouched', name: 'Untouched Night', desc: 'Finish a night with no snapped cable' },
  { id: 'kraken', name: 'Kraken Slayer', desc: 'Haul the Mother Kraken' },
  { id: 'full', name: 'Full Bestiary', desc: 'Complete all 13 monsters' },
  { id: 'combo8', name: 'Combo ×8', desc: 'Reach a combo of 8' },
  { id: 'heavy', name: 'Heavy Haul', desc: 'Haul a monster of 50 kg or more' },
  { id: 'rich', name: 'Rich Night', desc: 'Earn 2,000+ coins in one night' },
  { id: 'storm', name: 'Storm Hunter', desc: 'Finish a night under Gale or Blood Moon' },
];
