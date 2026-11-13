import { describe, expect, it } from "vitest";
import { activationKey, currentTargetHit, primaryPointer } from "./input";

describe("game input safeguards", () => {
  it("accepts primary mouse and touch presses but rejects secondary contacts", () => {
    expect(primaryPointer({ button: 0, isPrimary: true })).toBe(true);
    expect(primaryPointer({ button: 2, isPrimary: true })).toBe(false);
    expect(primaryPointer({ button: 0, isPrimary: false })).toBe(false);
  });

  it("handles keyboard activation only once per press", () => {
    expect(activationKey({ key: " ", repeat: false })).toBe(true);
    expect(activationKey({ key: "Enter", repeat: false })).toBe(true);
    expect(activationKey({ key: " ", repeat: true })).toBe(false);
    expect(activationKey({ key: "Tab", repeat: false })).toBe(false);
  });

  it("rejects duplicate hits on a target that has not rerendered", () => {
    expect(currentTargetHit(0, 0)).toBe(true);
    expect(currentTargetHit(0, 1)).toBe(false);
    expect(currentTargetHit(1, 1)).toBe(true);
  });
});
