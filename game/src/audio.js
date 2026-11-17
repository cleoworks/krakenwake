// audio.js — one job: every sound, synthesized with WebAudio; no audio
// files. Entry points no-op until initAudio() runs on a user gesture.
let ac = null;
let master = null;

export function initAudio() {
  if (ac) {
    if (ac.state === 'suspended') ac.resume();
    return;
  }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = 0.45;
    master.connect(ac.destination);
  } catch {
    ac = null;
  }
}

function tone(freq, dur, type = 'sine', vol = 0.2, slideTo = null, delay = 0) {
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(dur, vol = 0.2, freq = 800, delay = 0) {
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = 0.8;
  const g = ac.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(t0);
}

export const sfx = {
  plip() { tone(640, 0.09, 'sine', 0.14, 300); },
  fake() { tone(420, 0.07, 'sine', 0.08, 260); },
  bite() { tone(880, 0.12, 'square', 0.1, 430); tone(1170, 0.1, 'square', 0.08, 590, 0.05); },
  throwIt() { noise(0.18, 0.12, 1600); },
  strike() { noise(0.14, 0.3, 1100); tone(190, 0.16, 'sawtooth', 0.18, 55); },
  splash() { noise(0.35, 0.22, 640); noise(0.22, 0.12, 1500, 0.04); },
  coin() { tone(1318, 0.07, 'square', 0.1); tone(1760, 0.12, 'square', 0.1, null, 0.06); },
  thud(bulk) { tone(95, 0.3, 'sine', Math.min(0.5, 0.15 + bulk * 0.02), 38); },
  snap() { noise(0.2, 0.35, 2400); tone(320, 0.3, 'sawtooth', 0.16, 40); },
  escape() { tone(300, 0.25, 'sine', 0.1, 120); },
  click() { tone(740, 0.05, 'square', 0.07); },
  night() { tone(523, 0.4, 'sine', 0.1); tone(392, 0.5, 'sine', 0.1, null, 0.18); },
  feat() { tone(988, 0.1, 'triangle', 0.12); tone(1318, 0.16, 'triangle', 0.12, null, 0.08); },
  charm() { tone(1568, 0.14, 'sine', 0.12, 2093); tone(1046, 0.2, 'sine', 0.08, null, 0.05); },
  warn() { tone(196, 0.16, 'sawtooth', 0.14, 147); tone(196, 0.16, 'sawtooth', 0.12, 147, 0.2); },
  vital() { tone(1568, 0.06, 'square', 0.07); tone(2093, 0.09, 'square', 0.06, null, 0.05); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.35, 'triangle', 0.14, null, i * 0.13)); },
  // the cable complaining: main calls this on a timer during fights
  creak(tension01) { tone(55 + tension01 * 170, 0.07, 'sawtooth', 0.03 + tension01 * 0.09); },
};
