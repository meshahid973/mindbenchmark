import { elapsedMilliseconds } from "../core/timing";

/** A deliberately conservative anticipation rule, not a latency correction. */
export const minimumReactionMs = 80;

export function reactionElapsed(cueAt: number, inputAt: number): number | null {
  const elapsed = elapsedMilliseconds(cueAt, inputAt);
  return elapsed !== null && elapsed >= minimumReactionMs ? elapsed : null;
}
