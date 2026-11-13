/**
 * Random gameplay values are sampled from Web Crypto, not Math.random.
 * Independent ranges keep challenge timing from following a fixed pattern.
 */
export function randomInt(min: number, max: number): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
    throw new RangeError("Invalid random range");
  }

  const range = max - min + 1;
  if (range < 1 || range > 0x100000000) {
    throw new RangeError("Random range is too large");
  }

  const limit = Math.floor(0x100000000 / range) * range;
  const value = new Uint32Array(1);

  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);

  return min + (value[0] % range);
}

export function reactionDelay(): number {
  // A fresh, millisecond-granularity delay between 1.2 and 7.8 seconds.
  return randomInt(1200, 7800);
}

export function nextSequence(sequence: readonly number[]): number[] {
  return [...sequence, randomInt(0, 8)];
}

export type Position = { x: number; y: number };

export function nextTarget(previous?: Position): Position {
  let candidate = { x: 50, y: 50 };

  for (let attempt = 0; attempt < 12; attempt += 1) {
    candidate = { x: randomInt(10, 90), y: randomInt(20, 80) };
    if (!previous || Math.hypot(candidate.x - previous.x, candidate.y - previous.y) >= 20) {
      break;
    }
  }

  return candidate;
}
