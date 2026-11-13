import { describe, expect, it } from "vitest";
import {
  chimpBoard,
  chooseVerbalWord,
  correctCharacters,
  randomDigits,
  sampleDistinct,
  typingPassage,
  visualPattern,
  wordsPerMinute,
} from "./challenges";

describe("game challenges", () => {
  it("generates numeric strings without losing precision or leading digits", () => {
    for (const length of [1, 8, 20, 64]) {
      const value = randomDigits(length);
      expect(value).toMatch(/^[1-9][0-9]*$/);
      expect(value.length).toBe(length);
    }
    expect(() => randomDigits(0)).toThrow(RangeError);
  });

  it("generates unique positions without modifying the source pool", () => {
    const sample = sampleDistinct(36, 15);
    expect(new Set(sample).size).toBe(15);
    expect(sample.every((index) => index >= 0 && index < 36)).toBe(true);
    expect(() => sampleDistinct(3, 4)).toThrow(RangeError);
  });

  it("assigns chimp numbers 1 through N to distinct cells", () => {
    const board = chimpBoard(12);
    expect(board).toHaveLength(36);
    expect(board.filter(Boolean).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
  });

  it("increases visual memory difficulty without duplicated squares", () => {
    for (const level of [1, 2, 5, 10, 15]) {
      const { size, highlighted } = visualPattern(level);
      expect(size).toBeGreaterThanOrEqual(3);
      expect(size).toBeLessThanOrEqual(6);
      expect(new Set(highlighted).size).toBe(highlighted.length);
      expect(highlighted.every((x) => x >= 0 && x < size * size)).toBe(true);
    }
  });

  it("never marks a fresh word as already seen", () => {
    const seen = new Set<string>();
    const first = chooseVerbalWord(seen);
    expect(first.wasSeen).toBe(false);
    seen.add(first.word);
    for (let i = 0; i < 50; i += 1) {
      const item = chooseVerbalWord(seen, first.word);
      expect(item.word).not.toBe(first.word);
      expect(item.wasSeen).toBe(seen.has(item.word));
    }
  });

  it("compares exact typing positions and computes conventional five-character WPM", () => {
    expect(correctCharacters("abx de", "abc de")).toBe(5);
    expect(correctCharacters("abcdef", "abc")).toBe(3);
    expect(wordsPerMinute(150, 30000)).toBe(60);
    expect(wordsPerMinute(200, 30000)).toBe(80);
    expect(wordsPerMinute(10, 0)).toBe(0);
    const passage = typingPassage(95);
    expect(passage.split(" ")).toHaveLength(95);
  });
});
