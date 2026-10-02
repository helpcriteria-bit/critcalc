/**
 * Shared unique ID generator for canvas objects.
 * Prevents collisions when multiple objects are created in the same millisecond (e.g. AI batch drawing).
 */

let idCounter = 0;

export function generateId(prefix = 'obj') {
  idCounter = (idCounter + 1) % 1000000;
  const time = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${time}_${idCounter}_${rand}`;
}
