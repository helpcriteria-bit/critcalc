import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction } from '../src/canvas/canvasActions.js';

test('bounds regular polygon sides and total generated objects', () => {
  const tooManySides = applyAction([], {
    type: 'add_regular_polygon',
    radius: 1,
    sides: 100000
  });
  assert.match(tooManySides.error, /64 sides/);

  const overCapacity = applyAction(
    Array.from({ length: 140 }, (_, index) => ({
      id: `p${index}`,
      type: 'point',
      x: 0,
      y: 0
    })),
    { type: 'add_regular_polygon', radius: 1, sides: 60 }
  );
  assert.match(overCapacity.error, /capacity/);
});

test('prevents AI updates to protected object properties', () => {
  const objects = [{ id: 'point-1', type: 'point', x: 1, y: 2 }];
  const result = applyAction(objects, {
    type: 'update_object',
    id: 'point-1',
    props: { id: 'forged', type: 'line' }
  });

  assert.match(result.error, /cannot be updated/);
  assert.equal(result.objects[0].id, 'point-1');
  assert.equal(result.objects[0].type, 'point');
});

test('filters action metadata from grid settings and rejects invalid grid sizes', () => {
  let savedSettings;
  const result = applyAction([], {
    type: 'set_grid',
    showGrid: false,
    tool_call_id: 'call-1',
    source: 'ai'
  }, {
    setGridSettings: (settings) => {
      savedSettings = settings;
    }
  });

  assert.equal(result.error, undefined);
  assert.deepEqual(savedSettings, { showGrid: false });

  const invalid = applyAction([], {
    type: 'set_grid',
    gridSize: Infinity
  }, { setGridSettings: () => {} });
  assert.match(invalid.error, /Grid size/);
});
