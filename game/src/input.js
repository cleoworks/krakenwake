// input.js — one job: turn keyboard and pointer into a per-frame input
// snapshot {hold, pressed, released, pressedKeys} plus a queue of canvas
// clicks in game coordinates. Space (or holding the pointer) is the one
// button the whole game is played with.
export function makeInput(canvas) {
  const held = new Set();
  let pressedKeys = new Set();
  let spaceDown = false;
  let pressed = false;
  let released = false;
  const clicks = [];

  const pressSpace = () => {
    if (spaceDown) return;
    spaceDown = true;
    pressed = true;
  };
  const releaseSpace = () => {
    if (!spaceDown) return;
    spaceDown = false;
    released = true;
  };
  const toGame = (e) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 1280,
      y: ((e.clientY - r.top) / r.height) * 720,
    };
  };

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) pressSpace();
    }
    if (!e.repeat) pressedKeys.add(e.code);
    held.add(e.code);
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') releaseSpace();
    held.delete(e.code);
  });
  canvas.addEventListener('pointerdown', (e) => {
    clicks.push(toGame(e));
    pressSpace();
  });
  window.addEventListener('pointerup', () => releaseSpace());
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  return {
    // call once per frame: edges are reported for exactly one frame
    frame() {
      const snap = { hold: spaceDown, pressed, released, pressedKeys };
      pressed = false;
      released = false;
      pressedKeys = new Set();
      return snap;
    },
    takeClicks() {
      const out = clicks.slice();
      clicks.length = 0;
      return out;
    },
    held,
  };
}
