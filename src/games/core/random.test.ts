import { describe, expect, it } from "vitest";
import {
  nextSequence,
  nextTarget,
  randomInt,
  reactionDelay,
} from "./random";

describe("game randomness", () => {
  it("samples unpredictable reaction delays in the allowed range", () => {
    const delays = Array.from({ length: 250 }, () => reactionDelay());
    expect(delays.every((delay) => delay >= 1200 && delay <= 7800)).toBe(true);
    expect(new Set(delays).size).toBeGreaterThan(200);
  });

  it("rejects invalid random boundaries", () => {
    expect(() => randomInt(4, 3)).toThrow(RangeError);
    expect(() => randomInt(0, Number.MAX_SAFE_INTEGER)).toThrow(RangeError);
  });

  it("appends one valid memory tile without modifying the previous sequence", () => {
    const previous = [1, 3, 8];
    const next = nextSequence(previous);
    expect(previous).toEqual([1, 3, 8]);
    expect(next.slice(0, 3)).toEqual(previous);
    expect(next).toHaveLength(4);
    expect(next[3]).toBeGreaterThanOrEqual(0);
    expect(next[3]).toBeLessThanOrEqual(8);
  });

  it("keeps aim targets within the board", () => {
    const targets = Array.from({ length: 100 }, () => nextTarget());
    expect(targets.every(({ x, y }) => x >= 12 && x <= 88 && y >= 20 && y <= 80)).toBe(true);
    const far = nextTarget({ x: 10, y: 20 });
    expect(Math.hypot(far.x - 10, far.y - 20)).toBeGreaterThanOrEqual(20);
    for (let index = 0; index < 300; index += 1) {
      const previous = { x: randomInt(12, 88), y: randomInt(20, 80) };
      const next = nextTarget(previous);
      expect(Math.hypot(next.x - previous.x, next.y - previous.y)).toBeGreaterThanOrEqual(20);
    }
  });
});
