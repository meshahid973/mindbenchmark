import type { Game } from "../app/games";

export const loadReaction = () => import("./reaction/ReactionTime");
export const loadSequence = () => import("./sequence/SequenceMemory");
export const loadAim = () => import("./aim/AimTrainer");
export const loadNumber = () => import("./number/NumberMemory");
export const loadVerbal = () => import("./verbal/VerbalMemory");
export const loadChimp = () => import("./chimp/ChimpTest");
export const loadVisual = () => import("./visual/VisualMemory");
export const loadTyping = () => import("./typing/TypingSpeed");

const loaders = {
  "reaction-time": loadReaction,
  "sequence-memory": loadSequence,
  "aim-trainer": loadAim,
  "number-memory": loadNumber,
  "verbal-memory": loadVerbal,
  "chimp-test": loadChimp,
  "visual-memory": loadVisual,
  "typing-speed": loadTyping,
} satisfies Record<Game["slug"], () => Promise<{ default: () => import("react").ReactNode }>>;

export function prefetchGame(slug: Game["slug"]): void {
  void loaders[slug]().catch(() => {
    // Navigation retries a failed request.
  });
}
