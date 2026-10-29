import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeliveryState, selectDeliveryJourney, selectDeliveryStep, deliveryStepForKey, journeys } from '../src/delivery-data.mjs';

test('visitors can explore each journey and return to their previous stage', () => {
  let state = createDeliveryState();
  assert.equal(state.journey, 'custom');
  assert.equal(state.steps.custom, 2);
  state = selectDeliveryStep(state, 3);
  state = selectDeliveryJourney(state, 'ready');
  assert.equal(state.steps.ready, 0);
  state = selectDeliveryStep(state, 1);
  state = selectDeliveryJourney(state, 'custom');
  assert.equal(state.steps.custom, 3);
  assert.equal(selectDeliveryJourney(state, 'ready').steps.ready, 1);
});

test('keyboard traversal wraps and supports Home/End while ignoring unrelated keys', () => {
  assert.equal(deliveryStepForKey(3, 'ArrowRight', 4), 0);
  assert.equal(deliveryStepForKey(0, 'ArrowLeft', 4), 3);
  assert.equal(deliveryStepForKey(2, 'Home', 4), 0);
  assert.equal(deliveryStepForKey(1, 'End', 4), 3);
  assert.equal(deliveryStepForKey(2, 'Tab', 4), null);
});

test('invalid selections cannot corrupt the rendered journey', () => {
  const state = createDeliveryState();
  for (const index of [-1, 4, NaN, 1.5, '2']) assert.equal(selectDeliveryStep(state, index), state);
  assert.equal(selectDeliveryJourney(state, '__proto__'), state);
  assert.equal(selectDeliveryJourney(state, 'missing'), state);
  const next = selectDeliveryStep(state, 0);
  assert.equal(state.steps.custom, 2);
  assert.equal(next.steps.custom, 0);
});

test('every reachable stage has a complete handover with three readable deliverables', () => {
  for (const journey of Object.values(journeys)) {
    assert.equal(journey.stages.length, 4);
    for (const stage of journey.stages) {
      assert.ok(stage.label && stage.title && stage.description && stage.packTitle);
      assert.equal(stage.items.length, 3);
      assert.equal(stage.checks.length, 3);
      for (const item of stage.items) assert.ok(item.title && item.detail);
    }
  }
});
