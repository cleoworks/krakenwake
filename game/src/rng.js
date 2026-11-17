// rng.js — a tiny seeded RNG (mulberry32). One stream per run keeps the
// whole hunt deterministic: same seed + same inputs = same monsters,
// same weather, same fight. The bot proof leans on that.
export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return {
    next() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(a, b) { return a + (b - a) * this.next(); },
    int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); },
    chance(p) { return this.next() < p; },
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; },
  };
}
