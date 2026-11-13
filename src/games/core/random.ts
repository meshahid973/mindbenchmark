/** Cryptographically unbiased integer sampling for unpredictable challenges. */
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
  return randomInt(1200, 7800);
}

export function nextSequence(sequence: readonly number[]): number[] {
  return [...sequence, randomInt(0, 8)];
}

export type Position = { x: number; y: number };

export function nextTarget(previous?: Position): Position {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const candidate = { x: randomInt(12, 88), y: randomInt(20, 80) };
    if (!previous || Math.hypot(candidate.x - previous.x, candidate.y - previous.y) >= 20) {
      return candidate;
    }
  }

  // A guaranteed distant fallback, even in the unlikely rejection-limit case.
  return { x: previous && previous.x > 50 ? 12 : 88, y: previous && previous.y > 50 ? 20 : 80 };
}
