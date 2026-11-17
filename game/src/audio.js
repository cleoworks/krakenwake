// audio.js — every sound is synthesized with WebAudio; there are no audio
// files. One tiny synth: oscillators + filtered noise, shaped envelopes.
let ctx = null;
let master = null;

export function initAudio() {
  if (ctx) { ctx.resume?.(); return; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  } catch { ctx = null; }
}

function tone(freq, dur, type = 'sine', vol = 0.2, slide = 0, delay = 0) {
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

function noise(dur, vol = 0.15, freq = 1200, delay = 0) {
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const len = Math.max(1, (dur * ctx.sampleRate) | 0);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(t0);
}

export const sfx = {
  cast() { noise(0.28, 0.12, 700); tone(220, 0.25, 'sine', 0.05, 380); },
  splash() { noise(0.3, 0.22, 600); noise(0.18, 0.12, 1400, 0.05); },
  plip() { tone(740, 0.09, 'sine', 0.22, -340); tone(1050, 0.07, 'sine', 0.12, -240, 0.03); },
  strike() { tone(150, 0.14, 'square', 0.18); noise(0.14, 0.18, 420); tone(70, 0.22, 'sine', 0.2, -30); },
  click() { tone(560, 0.05, 'square', 0.08); },
  coin() { tone(988, 0.08, 'square', 0.1); tone(1319, 0.14, 'square', 0.1, 0, 0.07); },
  // the haul drum: a deep thud that grows with the monster's weight
  drum(kg) {
    const v = Math.min(0.34, 0.14 + kg * 0.004);
    tone(58, 0.4, 'sine', v, -22); noise(0.16, v * 0.5, 300);
    tone(46, 0.5, 'sine', v * 0.7, -14, 0.07);
  },
  snap() { noise(0.2, 0.3, 2400); tone(120, 0.3, 'sawtooth', 0.14, -70); },
  spook() { tone(440, 0.16, 'sine', 0.1, -220); },
  day() { tone(392, 0.12, 'triangle', 0.12); tone(587, 0.18, 'triangle', 0.12, 0, 0.1); },
  win() { [392, 494, 587, 784].forEach((f, i) => tone(f, 0.22, 'triangle', 0.14, 0, i * 0.11)); },
  lose() { [330, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, 0, i * 0.13)); },
};

// Continuous loops, rebuilt per frame from game state: winch clicks while
// reeling, a cable creak whose pitch climbs with tension, low sea ambience.
let ambGain = null;
export function ambience(weatherId, reeling, tension) {
  if (!ctx) return;
  if (!ambGain) {
    const src = ctx.createBufferSource();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380;
    ambGain = ctx.createGain(); ambGain.gain.value = 0;
    src.connect(f).connect(ambGain).connect(master);
    src.start();
  }
  const sea = weatherId === 'bloodmoon' ? 0.04 : weatherId === 'gale' ? 0.05 : 0.014;
  ambGain.gain.setTargetAtTime(sea, ctx.currentTime, 0.4);
  if (reeling && Math.random() < 0.5) tone(1100 + Math.random() * 400, 0.02, 'square', 0.03);
  // the creak: pitch and urgency rise as the cable nears snapping
  if (tension > 45 && Math.random() < 0.36) {
    tone(55 + tension * 1.7, 0.1, 'sawtooth', 0.028 + tension * 0.0004);
  }
}
