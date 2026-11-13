import { describe, expect, it } from "vitest";
import { coachAimBatch, nextReachTarget } from "./aimCoaching";

describe("aim coaching", () => {
  it("covers four separated board regions, with safe margins", () => {
    for (let index = 0; index < 40; index += 1) {
      const { x, y } = nextReachTarget(index);
      expect(x).toBeGreaterThanOrEqual(16);
      expect(x).toBeLessThanOrEqual(84);
      expect(y).toBeGreaterThanOrEqual(26);
      expect(y).toBeLessThanOrEqual(74);
      const right = index % 4 === 1 || index % 4 === 3;
      const bottom = index % 4 >= 2;
      expect(right ? x > 50 : x < 50).toBe(true);
      expect(bottom ? y > 50 : y < 50).toBe(true);
    }
  });

  it("recognizes when speed improves but mistakes rise", () => {
    expect(coachAimBatch(
      { averageMs: 240, misses: 3 },
      { averageMs: 340, misses: 0 },
    )).toContain("Faster, but less precise");
  });

  it("prefers accuracy when misses are high", () => {
    expect(coachAimBatch({ averageMs: 510, misses: 2 }, null)).toContain("Accuracy");
    expect(coachAimBatch({ averageMs: 430, misses: 0 }, null)).toContain("Good control");
    expect(coachAimBatch({ averageMs: 530, misses: 0 }, { averageMs: 490, misses: 1 })).toContain("faster");
  });
});
