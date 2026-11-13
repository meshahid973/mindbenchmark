import { afterEach, describe, expect, it, vi } from "vitest";
import { bestScore, median, readScores, saveScore } from "./scores";

const data = new Map<string, string>();
const storage = {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => { data.set(key, value); },
};

afterEach(() => {
  data.clear();
  vi.unstubAllGlobals();
});

describe("score helpers", () => {
  it("uses the median instead of the mean for reaction rounds", () => {
    expect(median([200, 210, 1000, 190, 220])).toBe(210);
    expect(median([100, 200])).toBe(150);
    expect(median([])).toBe(0);
  });

  it("saves only the latest 20 attempts and keeps game histories separate", () => {
    vi.stubGlobal("localStorage", storage);
    for (let i = 1; i <= 25; i += 1) saveScore("reaction-time", i);
    expect(readScores("reaction-time").map((entry) => entry.value)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 6),
    );
    expect(readScores("sequence-memory")).toEqual([]);
    expect(bestScore("reaction-time", readScores("reaction-time"))).toBe(6);
  });

  it("ranks higher sequence scores and lower time scores", () => {
    const history = [{ value: 5, createdAt: 1 }, { value: 8, createdAt: 2 }];
    expect(bestScore("sequence-memory", history)).toBe(8);
    expect(bestScore("aim-trainer", history)).toBe(5);
    expect(bestScore("reaction-time", [])).toBeNull();
  });

  it("rejects malformed or impossible saved values safely", () => {
    vi.stubGlobal("localStorage", storage);
    data.set("mindbenchmark:scores:v1:aim-trainer", "[null,{}, {\"value\":15,\"createdAt\":5}]");
    expect(readScores("aim-trainer")).toEqual([{ value: 15, createdAt: 5 }]);
    expect(saveScore("aim-trainer", Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("works without storage permission", () => {
    vi.stubGlobal("localStorage", {
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); },
    });
    expect(readScores("reaction-time")).toEqual([]);
    expect(saveScore("reaction-time", 210)).toBeNull();
  });
});
