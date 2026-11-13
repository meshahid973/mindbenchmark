import type { Game } from "../app/games";

export const loadReaction = () => import("./reaction/ReactionTime");
export const loadSequence = () => import("./sequence/SequenceMemory");
export const loadAim = () => import("./aim/AimTrainer");

export function isPlayableGame(slug: Game["slug"]): boolean {
  return slug === "reaction-time" || slug === "sequence-memory" || slug === "aim-trainer";
}

export function prefetchGame(slug: Game["slug"]) {
  const loader =
    slug === "reaction-time" ? loadReaction
    : slug === "sequence-memory" ? loadSequence
    : slug === "aim-trainer" ? loadAim
    : null;

  if (loader) void loader().catch(() => {
    // Navigation can retry a failed chunk request.
  });
}
