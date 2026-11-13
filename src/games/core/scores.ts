export type ScoredGame = "reaction-time" | "sequence-memory" | "aim-trainer";

export type ScoreEntry = {
  value: number;
  createdAt: number;
};

const prefix = "mindbenchmark:scores:v1:";
const historyLimit = 20;

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const center = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 1
    ? ordered[center]
    : (ordered[center - 1] + ordered[center]) / 2;
}

function isScoreEntry(value: unknown): value is ScoreEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.value === "number" &&
    Number.isFinite(item.value) &&
    item.value >= 0 &&
    typeof item.createdAt === "number" &&
    Number.isFinite(item.createdAt) &&
    item.createdAt > 0
  );
}

export function readScores(game: ScoredGame): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(prefix + game);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isScoreEntry).slice(-historyLimit) : [];
  } catch {
    return [];
  }
}

export function saveScore(game: ScoredGame, value: number): ScoreEntry | null {
  if (!Number.isFinite(value) || value < 0) return null;

  const entry: ScoreEntry = { value: Math.round(value), createdAt: Date.now() };

  try {
    const next = [...readScores(game), entry].slice(-historyLimit);
    localStorage.setItem(prefix + game, JSON.stringify(next));
    return entry;
  } catch {
    // Gameplay works even when local storage is blocked.
    return null;
  }
}

export function bestScore(game: ScoredGame, history: readonly ScoreEntry[]): number | null {
  if (history.length === 0) return null;
  const values = history.map((entry) => entry.value);
  return game === "sequence-memory" ? Math.max(...values) : Math.min(...values);
}
