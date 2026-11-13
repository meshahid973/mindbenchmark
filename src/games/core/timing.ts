/**
 * Both event.timeStamp and performance.now() use the page's monotonic clock in
 * modern browsers. Prefer the event timestamp so handler scheduling latency is
 * not included in a player's result.
 */
export function inputTimestamp(eventTimestamp: number, now: number): number {
  if (
    Number.isFinite(eventTimestamp) &&
    eventTimestamp > 0 &&
    eventTimestamp <= now + 1 &&
    now - eventTimestamp < 60_000
  ) {
    return eventTimestamp;
  }
  return now;
}

export function elapsedMilliseconds(startedAt: number, inputAt: number): number | null {
  if (
    !Number.isFinite(startedAt) ||
    !Number.isFinite(inputAt) ||
    inputAt < startedAt
  ) {
    return null;
  }
  return inputAt - startedAt;
}

/** The second animation frame approximates the first displayed frame. */
export function presentedAt(beforePaint: number, nextFrame: number): number {
  return Number.isFinite(nextFrame)
    ? Math.max(beforePaint, nextFrame)
    : beforePaint;
}

export function reactionSignal(phase: "waiting" | "go"): "red" | "green" {
  return phase === "waiting" ? "red" : "green";
}
