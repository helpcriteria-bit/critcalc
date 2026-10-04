import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression } from '../src/canvas/mathParser.js';

test('unary signs have lower precedence than exponentiation', () => {
  assert.equal(evaluateExpression('-2^2'), -4);
  assert.equal(evaluateExpression('2^3^2'), 512);
  assert.equal(evaluateExpression('2^-2'), 0.25);
});

test('supports implicit multiplication and percentage postfix', () => {
  assert.equal(evaluateExpression('2pi'), 2 * Math.PI);
  assert.equal(evaluateExpression('2(3)'), 6);
  assert.equal(evaluateExpression('50%'), 0.5);
  assert.equal(evaluateExpression('5%2'), 1);
});

test('rejects inherited variables and non-finite results', () => {
  for (const name of ['constructor', 'toString']) {
    assert.throws(() => evaluateExpression(name), /Unknown variable/);
  }
  assert.throws(() => evaluateExpression('0^-1'), /not finite/);
});

test('retains factorial evaluation', () => {
  assert.equal(evaluateExpression('5!'), 120);
});
