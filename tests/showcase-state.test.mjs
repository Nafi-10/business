import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceStage, createWheelGate } from '../src/showcase-state.mjs';

test('five industry scrolls stay pinned; only the sixth exits', () => {
  let index = 0;
  for (let expected = 1; expected <= 5; expected++) {
    const result = advanceStage(index, 1);
    assert.deepEqual(result, { index: expected, exit: null });
    index = result.index;
  }
  assert.deepEqual(advanceStage(index, 1), { index: 5, exit: 'after' });
});
test('reverse travel visits every chapter and can return to the hero', () => {
  let index = 5;
  for (let expected = 4; expected >= 0; expected--) {
    const result = advanceStage(index, -1);
    assert.deepEqual(result, { index: expected, exit: null });
    index = result.index;
  }
  assert.deepEqual(advanceStage(index, -1), { index: 0, exit: 'before' });
});
test('one long trackpad gesture cannot skip several industries', () => {
  const gate = createWheelGate();
  const results = Array.from({length: 40}, (_, i) => gate.consume(12, i * 25));
  assert.equal(results.filter(Boolean).length, 1);
  assert.equal(gate.consume(100, 1300), 1);
});
test('opposite gestures can reverse, while animation momentum is ignored', () => {
  const gate = createWheelGate();
  assert.equal(gate.consume(100, 0), 1);
  assert.equal(gate.consume(100, 100, 800), 0);
  assert.equal(gate.consume(-100, 1000), -1);
});
