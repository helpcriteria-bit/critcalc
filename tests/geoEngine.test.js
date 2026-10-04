import test from 'node:test';
import assert from 'node:assert/strict';
import { solveDependencies } from '../src/canvas/geoEngine.js';

test('solves dependency chains longer than three levels', () => {
  const objects = [];
  for (let level = 5; level >= 1; level--) {
    objects.push({
      id: `m${level}`,
      type: 'point',
      x: 0,
      y: 0,
      dependency: {
        type: 'midpoint',
        p1Id: level === 1 ? 'a' : `m${level - 1}`,
        p2Id: 'b'
      }
    });
  }
  objects.push(
    { id: 'a', type: 'point', x: 0, y: 0 },
    { id: 'b', type: 'point', x: 1, y: 0 }
  );

  const solved = solveDependencies(objects);
  assert.equal(solved.find((item) => item.id === 'm5').x, 0.96875);
});

test('preserves precise midpoint coordinates', () => {
  const solved = solveDependencies([
    {
      id: 'mid',
      type: 'point',
      x: 0,
      y: 0,
      dependency: { type: 'midpoint', p1Id: 'a', p2Id: 'b' }
    },
    { id: 'a', type: 'point', x: 0.11, y: 0 },
    { id: 'b', type: 'point', x: 0.14, y: 0 }
  ]);

  assert.equal(solved[0].x, 0.125);
});
