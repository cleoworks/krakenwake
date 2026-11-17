// input.js — keyboard + mouse as one held/tapped stream, plus discrete key
// and click events for menus. `tap` is an edge: true only on the frame the
// press begins, which is what the strike window listens to.
export function makeInput(canvas) {
  const input = {
    hold: false, tap: false, keys: [], clicks: [],
    _down: false,
  };
  const press = () => { if (!input._down) { input._down = true; input.tap = true; } input.hold = true; };
  const release = () => { input._down = false; input.hold = false; };
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { press(); e.preventDefault(); }
    if (!e.repeat) input.keys.push(e.code);
  });
  window.addEventListener('keyup', (e) => { if (e.code === 'Space') release(); });
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    input.clicks.push({
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    });
    press();
  });
  window.addEventListener('pointerup', release);
  canvas.addEventListener('pointerleave', () => { if (input._down) release(); });
  // Called once per frame after the step: clear edges and one-shot events.
  input.consume = () => { input.tap = false; input.keys.length = 0; input.clicks.length = 0; };
  return input;
}
