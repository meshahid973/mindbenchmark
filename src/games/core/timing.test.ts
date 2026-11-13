import { describe, expect, it } from "vitest";
import {
  elapsedMilliseconds,
  inputTimestamp,
  presentedAt,
  reactionSignal,
} from "./timing";

describe("game timing", () => {
  it("shows red before the green reaction signal", () => {
    expect(reactionSignal("waiting")).toBe("red");
    expect(reactionSignal("go")).toBe("green");
  });

  it("uses the input event's timestamp instead of the delayed handler time", () => {
    expect(inputTimestamp(1234.75, 1271.25)).toBe(1234.75);
    expect(elapsedMilliseconds(1100.25, 1234.75)).toBeCloseTo(134.5);
  });

  it("rejects timestamps from other time origins", () => {
    expect(inputTimestamp(1_783_000_000_000, 2200)).toBe(2200);
    expect(inputTimestamp(0, 2200)).toBe(2200);
    expect(inputTimestamp(Number.NaN, 2200)).toBe(2200);
    expect(inputTimestamp(1000, 70_000)).toBe(70_000);
  });

  it("never treats a press preceding the signal as a valid response", () => {
    expect(elapsedMilliseconds(1000, 999.9)).toBeNull();
    expect(elapsedMilliseconds(1000, 1000)).toBe(0);
  });

  it("does not apply a fixed latency subtraction to scores", () => {
    expect(elapsedMilliseconds(1000, 1198.5)).toBe(198.5);
    expect(presentedAt(1000, 1016.6)).toBe(1016.6);
    expect(presentedAt(1000, 999)).toBe(1000);
  });
});
