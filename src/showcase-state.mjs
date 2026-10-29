export const STAGE_COUNT = 6;

export function advanceStage(index, direction) {
  const next = index + Math.sign(direction);
  if (next < 0) return { index: 0, exit: 'before' };
  if (next >= STAGE_COUNT) return { index: STAGE_COUNT - 1, exit: 'after' };
  return { index: next, exit: null };
}

// A trackpad's momentum belongs to the same gesture, not to the next chapter.
export function createWheelGate() {
  let lastAt = -Infinity, fired = false, distance = 0, lastDirection = 0;
  return {
    consume(delta, now, blockedUntil = 0) {
      const direction = Math.sign(delta);
      if (now - lastAt > 180 || direction !== lastDirection) { fired = false; distance = 0; }
      lastAt = now; lastDirection = direction;
      if (now < blockedUntil || fired) return 0;
      distance += Math.abs(delta);
      if (distance < 34) return 0;
      fired = true;
      return direction;
    },
    reset() { lastAt = -Infinity; fired = false; distance = 0; lastDirection = 0; },
  };
}
