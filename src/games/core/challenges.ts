import { randomInt } from "./random";
import { wordBank } from "./words";

export function randomDigits(length: number): string {
  if (!Number.isInteger(length) || length < 1 || length > 64) {
    throw new RangeError("Invalid digit count");
  }
  let result = String(randomInt(1, 9));
  for (let index = 1; index < length; index += 1) {
    result += String(randomInt(0, 9));
  }
  return result;
}

export function sampleDistinct(total: number, count: number): number[] {
  if (
    !Number.isInteger(total) ||
    !Number.isInteger(count) ||
    total < 1 ||
    count < 0 ||
    count > total ||
    total > 10000
  ) {
    throw new RangeError("Invalid sample size");
  }
  const cells = Array.from({ length: total }, (_, index) => index);
  for (let index = 0; index < count; index += 1) {
    const swap = randomInt(index, total - 1);
    [cells[index], cells[swap]] = [cells[swap], cells[index]];
  }
  return cells.slice(0, count);
}

export function chimpBoard(count: number): number[] {
  if (!Number.isInteger(count) || count < 4 || count > 18) {
    throw new RangeError("Invalid chimp level");
  }
  const positions = sampleDistinct(36, count);
  const board = Array<number>(36).fill(0);
  positions.forEach((position, index) => {
    board[position] = index + 1;
  });
  return board;
}

export function visualPattern(level: number): { size: number; highlighted: number[] } {
  if (!Number.isInteger(level) || level < 1 || level > 15) {
    throw new RangeError("Invalid visual memory level");
  }
  const size = Math.min(6, 3 + Math.floor((level - 1) / 3));
  const count = Math.min(size * size - 1, level + 2);
  return { size, highlighted: sampleDistinct(size * size, count) };
}

export function chooseVerbalWord(seen: ReadonlySet<string>, previous?: string): {
  word: string;
  wasSeen: boolean;
} {
  const old = [...seen].filter((word) => word !== previous);
  const fresh = wordBank.filter((word) => !seen.has(word));
  const wasSeen = old.length > 0 && (fresh.length === 0 || randomInt(0, 1) === 0);
  const pool = wasSeen ? old : fresh;
  if (!pool.length) throw new Error("No available words");
  return { word: pool[randomInt(0, pool.length - 1)], wasSeen };
}

export function typingPassage(count = 95): string {
  if (!Number.isInteger(count) || count < 1 || count > 200) {
    throw new RangeError("Invalid word count");
  }
  const words: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const choices = wordBank.filter((word) => word !== words[index - 1]);
    words.push(choices[randomInt(0, choices.length - 1)]);
  }
  return words.join(" ");
}

export function correctCharacters(input: string, expected: string): number {
  let count = 0;
  for (let index = 0; index < Math.min(input.length, expected.length); index += 1) {
    if (input[index] === expected[index]) count += 1;
  }
  return count;
}

export function wordsPerMinute(correct: number, milliseconds: number): number {
  if (!Number.isFinite(correct) || !Number.isFinite(milliseconds) ||
    correct < 0 || milliseconds <= 0) return 0;
  return Math.round((correct / 5) * (60000 / milliseconds));
}
