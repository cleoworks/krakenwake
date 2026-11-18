// staging.js — one job: freeze the staged cover at the fight's most
// violent REAL instant, and frame it. Everything seeded here is a
// state the live game itself reaches: the splash bursts are main.js's
// own particle channel (the fight-start 'splash' event) frozen
// mid-flight by the stepper's own gravity, the slack chain is the
// payout state the fight takes while the ninja dashes, and the
// camera is a push-in on the composed scene — the live game's
// framing never moves, only the screenshot's does.
import { drawWorld, lurePos, WATER_Y } from '../render.js';

// the cover's clock: the frame where the sea's ambient life peaks
// together — the flock clear of the banner in open sky, the great
// back's fluke up for a breath, a dock jumper near the top of its
// arc, the lantern near full flicker, the moon-glint path nearly
// unbroken (two of its ten rungs out), the weak point's pulse at
// its very crest and one bait fish at the leap's peak
const COVER_T = 206.55;
// the cover's camera: a push-in was built, measured and priced
// out — every point of magnification costs ~1.3 KB of screenshot
// against the 262,144 B cap, and the cap won. The lens rests at
// 1.0 and the recomposition's muscle is the haul itself: the King
// dragged in to 60 m (a real late-haul state), his head low and
// lunging down the chain at the hunter, his tail fan crowding
// the frame's right edge. drawShotWorld keeps the camera ready.
const CAM = [1.0, 300, 170];

// a small deterministic rng (mulberry32) — the staging must agree
// with itself on every capture, so no Math.random down this path
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let z = a;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// one of main.js's splash bursts, frozen mid-flight: the spawn
// (20 motes, the splash palette, speed 210, the -90 lift, life
// 0.55-0.95 of a 0.9 span) stepped by the particle gravity
// (520/s^2) to the freeze instant tau — the spray hangs exactly
// where the live splash hangs at tau, fading as it would
function frozenBurst(view, x, y, tau, seed) {
  const rand = rng(seed);
  const cols = ['#dff2ff', '#9fd0ee', '#ffffff'];
  for (let i = 0; i < 20; i++) {
    const a = rand() * 6.29;
    const v = 210 * (0.3 + rand() * 0.7);
    const life = 0.55 + rand() * 0.4 - tau;
    if (life <= 0.05) continue; // already fallen back to the sea
    const vx = Math.cos(a) * v, vy = Math.sin(a) * v - 90;
    view.particles.push({
      x: x + vx * tau, y: y + vy * tau + 260 * tau * tau,
      vx: 0, vy: 0, life, maxLife: 0.9,
      color: cols[i % 3], size: 5 * (0.6 + rand() * 0.7),
    });
  }
}

export function stageCoverFx(view, run) {
  view.t = COVER_T;
  view.cam = CAM;
  const f = run.fight;
  // the chain pays OUT as he vanishes: a breath ago it sat 2 m
  // shorter, so chain.js reads the payout — the slack neon arc
  // (sag 20, no shoulder run) the banner itself orders: LET GO
  view._chain = { f, dist: f.dist - 2, hauling: false };
  // the strike's splash, caught mid-flight at every point where
  // the sea is breaking around the King — the lure where the chain
  // bites, his own crossings (the same spine fractions wyrm.js
  // blends at), and the theatre arcs' dives to his left
  const p = lurePos(run);
  const s = 150 + Math.max(0, 1 - f.dist / 95) * 45;
  frozenBurst(view, p.x, p.y, 0.18, 11); // the chain's bite
  frozenBurst(view, p.x + 0.42 * s, WATER_Y + 20, 0.13, 23); // the neck breaks out
  frozenBurst(view, p.x + 0.54 * s, WATER_Y + 20, 0.21, 37); // the loop dives back
  frozenBurst(view, p.x + 1.64 * s, WATER_Y + 20, 0.16, 41); // the tail runs out
  frozenBurst(view, p.x - 0.52 * s, WATER_Y + 3, 0.11, 53); // his flank leaves the sea
  frozenBurst(view, p.x - 1.50 * s, WATER_Y + 3, 0.19, 67); // the tall arc's dive
}

// the staged cover's world, drawn through its camera; every other
// shot (and the live game, which never sets view.cam) draws plain
export function drawShotWorld(ctx, run, view) {
  const c = view.cam;
  if (!c) { drawWorld(ctx, run, view); return; }
  ctx.save();
  ctx.translate(c[1], c[2]);
  ctx.scale(c[0], c[0]);
  ctx.translate(-c[1], -c[2]);
  drawWorld(ctx, run, view);
  ctx.restore();
}
