import { randomInt } from "./random";
import { wordBank } from "./words";

export type TypingErrors = Record<string, number>;

/** Record the letter pair near each new typing error, including corrected errors. */
export function recordTypingErrors(
  errors: TypingErrors,
  before: string,
  after: string,
  expected: string,
): TypingErrors {
  if (after.length <= before.length || !after.startsWith(before)) return errors;
  let next = errors;
  for (let index = before.length; index < after.length; index += 1) {
    if (after[index] === expected[index]) continue;
    const left = Math.max(0, index - 1);
    const pair = expected.slice(left, left + 2).toLowerCase();
    if (!/^[a-z]{2}$/.test(pair)) continue;
    if (next === errors) next = { ...errors };
    next[pair] = (next[pair] ?? 0) + 1;
  }
  return next;
}

export function weakestPairs(errors: TypingErrors, count = 2): string[] {
  return Object.entries(errors)
    .filter(([pair, total]) => /^[a-z]{2}$/.test(pair) && total > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, count)
    .map(([pair]) => pair);
}

/** Build an unscored short passage with words containing the weak letter pairs. */
export function typingMicroDrill(pairs: readonly string[], length = 28): string {
  const pool = wordBank.filter((word) => pairs.some((pair) => word.includes(pair)));
  if (!pool.length) return "";
  const words: string[] = [];
  for (let index = 0; index < length; index += 1) {
    words.push(pool[randomInt(0, pool.length - 1)]);
  }
  return words.join(" ");
}
