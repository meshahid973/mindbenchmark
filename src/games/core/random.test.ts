import { describe, expect, it } from "vitest";
import {
  nextSequence,
  nextTarget,
  randomInt,
  reactionDelay,
  reactionDelayFromUnit,
  reactionMinimumWait,
  reactionMeanExtraWait,
} from "./random";

describe("game randomness", () => {
  it("samples independent, finite reaction delays above the minimum", () => {
    const delays = Array.from({ length: 250 }, () => reactionDelay());
    expect(delays.every((delay) => Number.isFinite(delay) && delay >= reactionMinimumWait)).toBe(true);
    expect(new Set(delays).size).toBeGreaterThan(100);
  });

  it("uses a shifted exponential rather than a predictable maximum wait", () => {
    expect(reactionDelayFromUnit(0)).toBe(reactionMinimumWait);
    expect(reactionDelayFromUnit(1 - Math.exp(-1))).toBeCloseTo(
      reactionMinimumWait + reactionMeanExtraWait, 0,
    );
    expect(reactionDelayFromUnit(0.5)).toBe(2524);
    expect(reactionDelayFromUnit(0.99)).toBeGreaterThan(10_000);
    // Equal intervals have equal conditional survival probabilities.
    const interval = 1000;
    const survival = Math.exp(-interval / reactionMeanExtraWait);
    const q1 = 1 - Math.exp(-interval / reactionMeanExtraWait);
    const q2 = 1 - Math.exp(-2 * interval / reactionMeanExtraWait);
    expect((1 - q2) / (1 - q1)).toBeCloseTo(survival);
    expect(() => reactionDelayFromUnit(1)).toThrow(RangeError);
    expect(() => reactionDelayFromUnit(-0.01)).toThrow(RangeError);
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
