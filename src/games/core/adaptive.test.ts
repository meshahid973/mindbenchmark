import { describe, expect, it } from "vitest";
import { advanceAdaptive, adaptiveSummary, initialAdaptive } from "./adaptive";

describe("adaptive practice", () => {
  it("starts at an explicit level, with no feedback yet", () => {
    const state = initialAdaptive(3);
    expect(state.level).toBe(3);
    expect(state.attempts).toBe(0);
    expect(adaptiveSummary(state)).toBeNull();
  });

  it("raises difficulty after two consecutive correct attempts", () => {
    let state = advanceAdaptive(initialAdaptive(3), true, 1, 8);
    expect(state.level).toBe(3);
    state = advanceAdaptive(state, true, 1, 8);
    expect(state.level).toBe(4);
    expect(state.streak).toBe(0);
  });

  it("lowers difficulty on errors, respecting bounds", () => {
    let state = advanceAdaptive(initialAdaptive(3), false, 2, 8);
    expect(state.level).toBe(2);
    state = advanceAdaptive(state, false, 2, 8);
    expect(state.level).toBe(2);
    let high = initialAdaptive(8);
    high = advanceAdaptive(advanceAdaptive(high, true, 2, 8), true, 2, 8);
    expect(high.level).toBe(8);
  });

  it("only reports feedback after groups of five attempts", () => {
    let state = initialAdaptive(3);
    for (let i = 1; i <= 10; i += 1) {
      state = advanceAdaptive(state, i <= 5, 1, 12);
      if (i % 5 !== 0) expect(adaptiveSummary(state)).toBeNull();
      else expect(adaptiveSummary(state)).toBeTruthy();
    }
    expect(state.attempts).toBe(10);
    expect(state.successes).toBe(5);
  });

  it("rejects invalid training boundaries", () => {
    expect(() => advanceAdaptive(initialAdaptive(3), true, 5, 2)).toThrow(RangeError);
  });
});
