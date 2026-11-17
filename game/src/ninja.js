// ninja.js — one job: draw the hunter as a character. The Kraken Ninja:
// black garb shaded by grey cloth folds, hood and mask with only the eye
// slit open — red eyes in it — a white sash, black headband tails. He
// ACTS: every phase has its pose, and his body reads the fight — tails
// whip and the eyes' ember brightens as tension climbs. Render only.
import { WEATHERS } from './data.js';
import { crankKnob } from './tackle.js';

const NX = 168; // the dock spot he has always stood on (render.js DOCK_X)
const SHADOW = '#0a0a0d', BASE = '#17171c', CLOTH = '#232329', FOLD = '#3a3a44';
const WRAP = '#55555f', SASH = '#e3e3e8', SASH_D = '#a9a9b4';
const SKIN = '#c98a5e', STEEL = '#cfd8e2', SHAFT = '#4a3826';
const RIM = 'rgba(205,225,248,0.45)';

function seg(ctx, x1, y1, x2, y2, w, color) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
function dot(ctx, x, y, r, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill();
}

// Which pose the moment calls for: a staged view.pose (screenshots)
// wins; then the telegraph flinch; then the fight's cable-motion read.
function poseOf(run, view) {
  if (view.pose) return view.pose;
  const f = run.fight;
  if (run.phase === 'fight' && f) {
    if (f.event && f.event.phase === 'tele') return 'guard';
    const st = view._nj;
    if (st && st.f === f) {
      if (f.dist < st.dist - 0.002) st.pose = 'reel';
      else if (f.dist > st.dist + 0.002) st.pose = 'slack';
      st.dist = f.dist;
      return st.pose;
    }
    view._nj = { f, dist: f.dist, pose: 'reel' };
    return 'reel';
  }
  if (run.phase === 'charge') return 'charge';
  if (run.phase === 'wait') return run.wait && run.wait.t < 0.5 ? 'throw' : 'bitewait';
  if (run.phase === 'idle' && view.comboPop > 0.35) return 'celebrate';
  return 'idle';
}

// The headband tails: two black ribbons off the knot, read by silhouette
// and a rim of moonlight on their top edge. Calm cable — they drift;
// tension (and gale, and surge) whips them round toward the water.
function drawTails(ctx, hx, hy, t, fl, drag) {
  for (const [ph, lenMul] of [[0, 1], [2.1, 0.82]]) {
    const L = (26 + fl * 26) * lenMul;
    const ang = 3.02 + (0.42 - 3.02) * drag;
    const dx = Math.cos(ang), dy = Math.sin(ang);
    const px = -dy, py = dx;
    const w1 = Math.sin(t * (4 + fl * 8) + ph) * (2 + fl * 4.4);
    const w2 = Math.sin(t * (4 + fl * 8) + ph - 0.9) * (3.2 + fl * 6.4);
    const x0 = hx - 13, y0 = hy - 6;
    const x1 = x0 + dx * L * 0.52 + px * w1, y1 = y0 + dy * L * 0.52 + py * w1;
    const x2 = x0 + dx * L + px * w2, y2 = y0 + dy * L + py * w2 + L * 0.1;
    ctx.fillStyle = '#101016';
    ctx.beginPath();
    ctx.moveTo(x0 + px * 3.2, y0 + py * 3.2); ctx.lineTo(x1 + px * 2.2, y1 + py * 2.2);
    ctx.lineTo(x2 + px, y2 + py); ctx.lineTo(x2 - px, y2 - py);
    ctx.lineTo(x1 - px * 2.2, y1 - py * 2.2); ctx.lineTo(x0 - px * 3.2, y0 - py * 3.2);
    ctx.fill();
    if (lenMul === 1) { // moonlight on the front ribbon's top edge
      ctx.strokeStyle = RIM; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x0 + px * 3.2, y0 + py * 3.2); ctx.lineTo(x1 + px * 2.2, y1 + py * 2.2); ctx.lineTo(x2 + px, y2 + py); ctx.stroke();
    }
  }
}

// Hood and mask: an angular hood, a skin band at the eye slit, and the
// red eyes in it — an ember that brightens with the fight's heat.
function drawHead(ctx, hx, hy, glow, narrow, lite) {
  ctx.fillStyle = BASE; // the hood, peaked, with a point trailing astern
  ctx.beginPath();
  ctx.moveTo(hx - 12, hy + 10); ctx.lineTo(hx - 14, hy - 5); ctx.lineTo(hx - 4, hy - 13);
  ctx.lineTo(hx + 6, hy - 12); ctx.lineTo(hx + 11, hy - 4); ctx.lineTo(hx + 12, hy + 3);
  ctx.lineTo(hx + 6, hy + 11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SHADOW; // fold shade down the hood's back
  ctx.beginPath();
  ctx.moveTo(hx - 12, hy + 10); ctx.lineTo(hx - 14, hy - 5); ctx.lineTo(hx - 4, hy - 13);
  ctx.lineTo(hx - 1, hy + 2); ctx.lineTo(hx - 5, hy + 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SKIN; // the eye slit: the only skin the mask shows
  ctx.beginPath();
  ctx.moveTo(hx + 1, hy - 4); ctx.lineTo(hx + 11.5, hy - 3); ctx.lineTo(hx + 11.5, hy + 2.5);
  ctx.lineTo(hx + 2, hy + 3.5); ctx.closePath(); ctx.fill();
  seg(ctx, hx - 13, hy - 7.5, hx + 11, hy - 9, 6, '#0c0c10'); // the headband
  dot(ctx, hx - 13, hy - 7.5, 3.6, '#0c0c10'); // its knot
  seg(ctx, hx + 1, hy + 5.5, hx + 11, hy + 4.5, 1.8, SHADOW); // the mask's seam
  ctx.globalAlpha = 0.22 + glow * 0.5; // the eyes: red slits, glowing
  ctx.fillStyle = '#ff2d20';
  ctx.beginPath(); ctx.ellipse(hx + 6.4, hy - 0.5, 5.6, 3.4, 0, 0, 6.29); ctx.fill();
  ctx.globalAlpha = 1;
  for (const [ex, ew] of [[6.4, 4.6], [10.6, 2.6]]) {
    ctx.fillStyle = '#ff2d20';
    ctx.beginPath();
    ctx.moveTo(hx + ex - ew / 2, hy - 0.5);
    ctx.quadraticCurveTo(hx + ex, hy - 0.5 - (narrow ? 1.1 : 1.7), hx + ex + ew / 2, hy - 0.5);
    ctx.quadraticCurveTo(hx + ex, hy - 0.5 + (narrow ? 1.1 : 1.7), hx + ex - ew / 2, hy - 0.5);
    ctx.fill();
    ctx.fillStyle = '#14030a';
    ctx.beginPath(); ctx.ellipse(hx + ex, hy - 0.5, 0.55, 1.15, 0, 0, 6.29); ctx.fill();
  }
  seg(ctx, hx + 0.5, hy - 5.2, hx + 11, hy - 4.2, 2, SHADOW); // the brow's shadow
  if (!lite) { // moonlight on the crown
    ctx.strokeStyle = RIM; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(hx - 11, hy - 7); ctx.lineTo(hx - 4, hy - 13); ctx.lineTo(hx + 6, hy - 12); ctx.stroke();
  }
}

function drawHarpoonHead(ctx, x, y, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const px = -s, py = c;
  ctx.fillStyle = STEEL;
  ctx.beginPath();
  ctx.moveTo(x + c * 10, y + s * 10); ctx.lineTo(x - c * 3 + px * 4, y - s * 3 + py * 4);
  ctx.lineTo(x - c * 3 - px * 4, y - s * 3 - py * 4); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - c * 1, y - s * 1); ctx.lineTo(x - c * 7 + px * 6, y - s * 7 + py * 6);
  ctx.lineTo(x - c * 7 + px * 1.6, y - s * 7 + py * 1.6); ctx.fill();
  seg(ctx, x - c * 3, y - s * 3, x + c * 8, y + s * 8, 1.1, '#ffffff'); // the edge glint
}

// A leg in baggy cloth: base stroke, a fold of lighter cloth along its
// front, the ankle wrap, and a tabi boot planted sole-flat.
function drawLeg(ctx, hip, knee, ank, front, lite) {
  const col = front ? BASE : SHADOW;
  seg(ctx, hip.x, hip.y, knee.x, knee.y, 12, col);
  seg(ctx, knee.x, knee.y, ank.x, ank.y - 4, 9.5, col);
  if (!lite) { // the fold light down the front of the leg
    seg(ctx, hip.x + 3, hip.y + 2, knee.x + 3.5, knee.y, 4.4, front ? FOLD : CLOTH);
    seg(ctx, knee.x + 3, knee.y + 1, ank.x + 2.5, ank.y - 6, 3.4, front ? FOLD : CLOTH);
  }
  const wx = knee.x + (ank.x - knee.x) * 0.78, wy = knee.y + (ank.y - 4 - knee.y) * 0.78;
  seg(ctx, wx - 3.4, wy - 2.6, wx + 3.8, wy + 2.2, 2.2, WRAP); // the ankle wrap
  seg(ctx, wx - 3, wy + 2.8, wx + 4.2, wy + 7, 2.2, WRAP);
  ctx.fillStyle = '#0b0b0f'; // the boot, pointed toe, split at the front
  ctx.beginPath();
  ctx.moveTo(ank.x - 4, ank.y - 6); ctx.lineTo(ank.x + 10, ank.y - 5); ctx.lineTo(ank.x + 14, ank.y - 1); ctx.lineTo(ank.x + 13, ank.y); ctx.lineTo(ank.x - 4, ank.y); ctx.closePath(); ctx.fill();
  seg(ctx, ank.x + 7.5, ank.y - 4.6, ank.x + 8.2, ank.y - 0.8, 1.3, SHADOW);
}

// An arm in a wide sleeve: fold light, the wrist wrap, a bare hand.
function drawArm(ctx, sho, elb, hand, front, lite) {
  const col = front ? BASE : SHADOW;
  seg(ctx, sho.x, sho.y, elb.x, elb.y, 10.5, col);
  seg(ctx, elb.x, elb.y, hand.x, hand.y, 8, col);
  if (!lite) {
    seg(ctx, sho.x + 2.5, sho.y - 2, elb.x + 3, elb.y - 1, 4, front ? FOLD : CLOTH);
    seg(ctx, elb.x + 2.5, elb.y - 1, hand.x - 1, hand.y - 2, 3, front ? FOLD : CLOTH);
  }
  const wx = elb.x + (hand.x - elb.x) * 0.72, wy = elb.y + (hand.y - elb.y) * 0.72;
  seg(ctx, wx - 3, wy - 3, wx + 3.4, wy + 2.6, 2.1, WRAP); // the wrist wrap
  dot(ctx, hand.x, hand.y, 4.1, SKIN);
}

// The torso: a loose gi — fold shadow down the back, two bold fold
// slashes, the gear strap, and the WHITE sash with its knot and ends.
function drawTorso(ctx, hip, sho, lite) {
  ctx.fillStyle = BASE;
  ctx.beginPath();
  ctx.moveTo(hip.x - 13, hip.y + 6); ctx.lineTo(hip.x + 14, hip.y + 6);
  ctx.lineTo(sho.x + 11, sho.y - 3); ctx.lineTo(sho.x - 12, sho.y - 3);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = SHADOW; // the back half falls into shadow
  ctx.beginPath();
  ctx.moveTo(hip.x - 13, hip.y + 6); ctx.lineTo(sho.x - 12, sho.y - 3);
  ctx.lineTo(sho.x - 2, sho.y - 3); ctx.lineTo(hip.x - 3, hip.y + 6);
  ctx.closePath(); ctx.fill();
  if (!lite) { // bold fold slashes, the reference's shading discipline
    seg(ctx, sho.x + 6, sho.y + 6, hip.x + 2, hip.y - 8, 4.6, FOLD);
    seg(ctx, sho.x - 1, sho.y + 16, hip.x + 8, hip.y - 2, 3.8, FOLD);
    seg(ctx, sho.x - 10, sho.y - 2, hip.x + 10, hip.y + 2, 3, SHADOW); // the strap
  }
  ctx.fillStyle = SASH; // the sash: white at the waist, knotted in front
  ctx.beginPath();
  ctx.moveTo(hip.x - 13, hip.y + 1); ctx.lineTo(hip.x + 14, hip.y - 1);
  ctx.lineTo(hip.x + 14, hip.y + 7); ctx.lineTo(hip.x - 13, hip.y + 9);
  ctx.closePath(); ctx.fill();
  seg(ctx, hip.x - 12, hip.y + 7.5, hip.x + 13, hip.y + 5.5, 1.8, SASH_D);
  dot(ctx, hip.x + 13, hip.y + 3, 4.4, SASH); // the knot
  dot(ctx, hip.x + 13, hip.y + 3, 2.2, SASH_D);
  if (!lite) { // the knot's two ends, hanging; and the kunai in the sash
    ctx.fillStyle = SASH;
    ctx.beginPath();
    ctx.moveTo(hip.x + 11, hip.y + 6); ctx.lineTo(hip.x + 16, hip.y + 6);
    ctx.lineTo(hip.x + 17, hip.y + 15); ctx.lineTo(hip.x + 12.5, hip.y + 14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#101014';
    ctx.fillRect(hip.x + 5, hip.y + 4, 4.6, 7);
    ctx.fillStyle = STEEL;
    ctx.beginPath();
    ctx.moveTo(hip.x + 4.4, hip.y + 11); ctx.lineTo(hip.x + 10.2, hip.y + 11); ctx.lineTo(hip.x + 7.3, hip.y + 19);
    ctx.fill();
  }
  ctx.strokeStyle = RIM; // moonlight down his back
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(sho.x - 12, sho.y - 3); ctx.lineTo(hip.x - 13, hip.y + 5); ctx.stroke();
}
export function drawNinja(ctx, run, view, lite = false) {
  const t = view.t;
  const pose = poseOf(run, view);
  const f = run.phase === 'fight' ? run.fight : null;
  const tension = f ? f.tension : 0;
  const gale = WEATHERS[run.weatherIdx].name === 'Gale';
  const surge = f && f.surgeT > 0;
  const fl = (gale ? 0.5 : 0.16) + (tension / 100) * 0.85 + (surge ? 0.35 : 0);
  const drag = Math.min(0.72, (tension / 100) * 0.8 + (surge ? 0.12 : 0));
  const glow = Math.min(1, tension / 100 + (f && f.event && f.event.phase === 'tele' ? 0.35 : 0));
  const c = run.charge || 0;
  const bob = pose === 'idle' ? Math.sin(t * 1.8) * 1 : 0;
  const P = (x, y) => ({ x: NX + x, y: 414 + y });
  let hip = P(-3, -54 + bob), sho = P(2, -92 + bob), head = P(6, -108 + bob);
  let ankB = P(-26, 0), kneeB = P(-32, -26), ankF = P(24, 0), kneeF = P(30, -24);
  let elbB = P(-16, -72 + bob), handB = P(-6, -54 + bob);
  let elbF = P(18, -74 + bob), handF = P(14, -56 + bob);
  let backShaft = true, raisedShaft = -1, plantedShaft = false, seal = false;
  if (pose === 'charge') {
    hip = P(-5, -50 - c * 2); sho = P(-1, -88 - c * 3); head = P(2, -104 - c * 2);
    ankB = P(-28, 0); kneeB = P(-36, -22); ankF = P(26, 0); kneeF = P(32, -21);
    const sh = (s) => P(20 - 58 * s, -70 - (64 + 10 * c) * s);
    handF = sh(0.8); handB = sh(0.6);
    elbF = P(20 - 58 * 0.8 - 6, -70 - (64 + 10 * c) * 0.8 + 15);
    elbB = P(20 - 58 * 0.6 - 10, -70 - (64 + 10 * c) * 0.6 + 11);
    backShaft = false; raisedShaft = c;
  } else if (pose === 'throw') {
    hip = P(12, -50); sho = P(26, -88); head = P(38, -100);
    ankB = P(-34, 0); kneeB = P(-16, -24); ankF = P(40, 0); kneeF = P(40, -28);
    elbF = P(34, -70); handF = P(40, -64);
    elbB = P(10, -54); handB = P(29, -55);
    backShaft = false;
  } else if (pose === 'bitewait') {
    hip = P(-3, -55); sho = P(1, -94); head = P(5, -110);
    elbF = P(16, -78); handF = P(12, -103);
    elbB = P(-8, -70); handB = P(26, -54);
    backShaft = false; seal = true;
  } else if (pose === 'reel' || pose === 'slack') {
    const reel = pose === 'reel';
    hip = reel ? P(-8, -52) : P(8, -53);
    sho = reel ? P(-18, -90) : P(13, -92);
    head = reel ? P(-20, -106) : P(15, -108);
    if (reel) { ankB = P(-32, 0); kneeB = P(-28, -26); ankF = P(46, 0); kneeF = P(34, -24); }
    else { ankB = P(-20, 0); kneeB = P(-22, -26); ankF = P(36, 0); kneeF = P(32, -24); }
    handF = reel ? P(36, -61) : P(50, -40);
    handB = crankKnob(run, view);
    elbF = reel ? P(14, -66) : P(28, -64);
    elbB = { x: (sho.x + handB.x) / 2 - 3, y: (sho.y + handB.y) / 2 + 10 };
    backShaft = false;
  } else if (pose === 'guard') {
    hip = P(-5, -48); sho = P(-6, -84); head = P(-3, -99);
    ankB = P(-28, 0); kneeB = P(-34, -22); ankF = P(28, 0); kneeF = P(34, -21);
    elbF = P(14, -68); handF = P(2, -93);
    elbB = P(0, -62); handB = P(26, -54);
    backShaft = false;
  } else if (pose === 'celebrate') {
    hip = P(0, -54); sho = P(3, -94); head = P(6, -110);
    ankB = P(-20, 0); kneeB = P(-24, -25); ankF = P(22, 0); kneeF = P(26, -25);
    elbF = P(18, -82); handF = P(15, -122);
    elbB = P(16, -64); handB = P(36, -66);
    backShaft = false; plantedShaft = true;
  }
  drawTails(ctx, head.x, head.y, t, pose === 'guard' ? fl * 0.4 : fl, pose === 'guard' ? 0 : drag);
  drawLeg(ctx, hip, kneeB, ankB, false, lite);
  drawLeg(ctx, hip, kneeF, ankF, true, lite);
  if (backShaft) { // the harpoon rides across his back, head above the shoulder
    seg(ctx, NX - 36, 414 - 60, NX + 34, 414 - 124, 4.6, SHAFT);
    drawHarpoonHead(ctx, NX + 34, 414 - 124, Math.atan2(-64, 70));
    dot(ctx, NX - 33, 414 - 51, 5.2, '#101016'); // its reel, at the butt
    dot(ctx, NX - 33, 414 - 51, 3, '#5a6a7a');
  }
  if (raisedShaft >= 0) { // coiled back over the shoulder, furniture and all
    const tipX = NX - 38, tipY = 414 - 134 - raisedShaft * 10;
    seg(ctx, NX + 20, 414 - 70, tipX, tipY, 4.6, SHAFT);
    drawHarpoonHead(ctx, tipX, tipY, Math.atan2(tipY - (414 - 70), tipX - (NX + 20)));
    const gp = (s) => ({ x: NX + 20 - 58 * s, y: 414 - 70 - (64 + 10 * raisedShaft) * s });
    const g1 = gp(0.55), g2 = gp(0.87);
    seg(ctx, g1.x, g1.y, g2.x, g2.y, 7, '#0c0c10');
    ctx.strokeStyle = '#8fa2b5'; ctx.lineWidth = 1.2;
    for (const s of [0.36, 0.18]) {
      const rp = gp(s);
      ctx.beginPath(); ctx.arc(rp.x + 2, rp.y + 3, 2.3, 0, 6.29); ctx.stroke();
    }    dot(ctx, NX + 24, 414 - 58, 5.6, '#101016');
    dot(ctx, NX + 24, 414 - 58, 3.2, '#5a6a7a');
  }
  if (plantedShaft) { // butt on the deck, head to the sky
    seg(ctx, NX + 38, 414, NX + 38, 414 - 112, 4.6, SHAFT);
    drawHarpoonHead(ctx, NX + 38, 414 - 112, -1.57);
  }
  drawArm(ctx, sho, elbB, handB, false, lite);
  drawTorso(ctx, hip, sho, lite);
  drawArm(ctx, sho, elbF, handF, true, lite);
  if (pose === 'celebrate') dot(ctx, handF.x, handF.y, 5, SKIN);
  if (seal && !lite) { // two fingers of the seal, held against the sky
    seg(ctx, handF.x - 1.8, handF.y - 2, handF.x - 2.6, handF.y - 10, 2.5, SKIN); seg(ctx, handF.x + 2, handF.y - 2, handF.x + 2.8, handF.y - 9.4, 2.5, SKIN);
  }
  drawHead(ctx, head.x, head.y, glow, pose === 'guard' || pose === 'bitewait', lite);
}
