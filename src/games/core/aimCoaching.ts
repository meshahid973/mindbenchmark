import { randomInt, type Position } from "./random";

const regions = [
  { x: [16, 38], y: [26, 42] },
  { x: [62, 84], y: [26, 42] },
  { x: [16, 38], y: [58, 74] },
  { x: [62, 84], y: [58, 74] },
] as const;

/** Coach drill: visit different areas rather than staying near the center. */
export function nextReachTarget(index: number): Position {
  const region = regions[index % regions.length];
  return {
    x: randomInt(region.x[0], region.x[1]),
    y: randomInt(region.y[0], region.y[1]),
  };
}

export type AimBatch = {
  averageMs: number;
  misses: number;
};

export function coachAimBatch(
  current: AimBatch,
  previous: AimBatch | null,
): string {
  if (current.misses >= 2 && previous && current.misses > previous.misses && current.averageMs < previous.averageMs) {
    return "Faster, but less precise. Focus on clean hits.";
  }
  if (current.misses >= 2) {
    return "Accuracy focus: slow down slightly.";
  }
  if (current.misses === 0 && previous && current.averageMs >= previous.averageMs) {
    return "Clean hits. Try moving a little faster.";
  }
  if (current.misses === 0) {
    return "Good control. Keep a steady pace.";
  }
  return "Balance your speed with accurate clicks.";
}
