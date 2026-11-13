export const games = [
  { slug: "reaction-time", name: "Reaction Time", kind: "Speed", hint: "Test your reflexes." },
  { slug: "sequence-memory", name: "Sequence Memory", kind: "Memory", hint: "Repeat the pattern." },
  { slug: "aim-trainer", name: "Aim Trainer", kind: "Precision", hint: "Hit the targets." },
  { slug: "number-memory", name: "Number Memory", kind: "Memory", hint: "Remember the digits." },
  { slug: "verbal-memory", name: "Verbal Memory", kind: "Memory", hint: "Remember the words." },
  { slug: "chimp-test", name: "Chimp Test", kind: "Memory", hint: "Find the hidden numbers." },
  { slug: "visual-memory", name: "Visual Memory", kind: "Memory", hint: "Recall the squares." },
  { slug: "typing-speed", name: "Typing Speed", kind: "Speed", hint: "How fast can you type?" },
] as const;

export type Game = (typeof games)[number];
export type GameKind = Game["kind"];
export type GameFilter = GameKind | "All";

export const gameFilters: GameFilter[] = ["All", "Speed", "Memory", "Precision"];

export function getGame(slug: string | undefined): Game | undefined {
  return games.find((game) => game.slug === slug);
}

export function filterGames(filter: GameFilter): Game[] {
  return filter === "All" ? [...games] : games.filter((game) => game.kind === filter);
}
