export const games = [
  { slug: "reaction-time", name: "Reaction Time", shortName: "Reaction", kind: "Speed" },
  { slug: "aim-trainer", name: "Aim Trainer", shortName: "Aim", kind: "Precision" },
  { slug: "sequence-memory", name: "Sequence Memory", shortName: "Sequence", kind: "Memory" },
  { slug: "number-memory", name: "Number Memory", shortName: "Numbers", kind: "Memory" },
  { slug: "verbal-memory", name: "Verbal Memory", shortName: "Verbal", kind: "Memory" },
  { slug: "chimp-test", name: "Chimp Test", shortName: "Chimp", kind: "Memory" },
  { slug: "visual-memory", name: "Visual Memory", shortName: "Visual", kind: "Memory" },
  { slug: "typing-speed", name: "Typing Speed", shortName: "Typing", kind: "Speed" },
] as const;

export function getGame(slug: string | undefined) {
  return games.find((game) => game.slug === slug);
}
