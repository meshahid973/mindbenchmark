export type AdaptiveProgress = {
  level: number;
  streak: number;
  attempts: number;
  successes: number;
  batchSuccesses: number;
  feedback: string | null;
};

export function initialAdaptive(level: number): AdaptiveProgress {
  return { level, streak: 0, attempts: 0, successes: 0, batchSuccesses: 0, feedback: null };
}

/** Practice only: two successes raise difficulty; one miss lowers it. */
export function advanceAdaptive(
  state: AdaptiveProgress,
  correct: boolean,
  minimum: number,
  maximum: number,
): AdaptiveProgress {
  if (minimum > maximum || state.level < minimum || state.level > maximum) {
    throw new RangeError("Invalid adaptive level");
  }
  const attempts = state.attempts + 1;
  const successes = state.successes + Number(correct);
  const streak = correct ? state.streak + 1 : 0;
  const level = correct && streak >= 2
    ? Math.min(maximum, state.level + 1)
    : correct ? state.level : Math.max(minimum, state.level - 1);
  const batchSuccesses = state.batchSuccesses + Number(correct);
  const feedback = attempts % 5 === 0
    ? batchSuccesses >= 4
      ? "Strong recall. Try the next difficulty."
      : batchSuccesses <= 2
        ? "Try smaller groups, then build back up."
        : "Steady practice. Keep the same approach."
    : null;

  return {
    level,
    streak: correct && streak >= 2 ? 0 : streak,
    attempts,
    successes,
    batchSuccesses: attempts % 5 === 0 ? 0 : batchSuccesses,
    feedback,
  };
}

export function adaptiveSummary(state: AdaptiveProgress): string | null {
  return state.attempts > 0 && state.attempts % 5 === 0 ? state.feedback : null;
}
