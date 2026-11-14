import { describe, expect, it } from "vitest";
import { minimumReactionMs, reactionElapsed } from "./reactionTiming";

describe("reaction cue timing", () => {
  it("rejects queued pre-cue events and anticipation without adding a frame", () => {
    expect(reactionElapsed(1000, 999)).toBeNull();
    expect(reactionElapsed(1000, 1000)).toBeNull();
    expect(reactionElapsed(1000, 1000 + minimumReactionMs - 0.01)).toBeNull();
    expect(reactionElapsed(1000, 1000 + minimumReactionMs)).toBe(minimumReactionMs);
  });

  it("preserves fractional elapsed time and makes no latency subtraction", () => {
    expect(reactionElapsed(1000.25, 1185.75)).toBe(185.5);
    expect(reactionElapsed(1000, 1200)).toBe(200);
    expect(reactionElapsed(Number.NaN, 1200)).toBeNull();
  });
});
