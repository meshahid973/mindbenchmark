import { useEffect, useState } from "react";
import { bestScore, readScores, type ScoreEntry, type ScoredGame } from "../core/scores";
import styles from "./GameShell.module.css";

export function ScorePanel({ game, revision }: { game: ScoredGame; revision: number }) {
  const [history, setHistory] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    setHistory(readScores(game));
  }, [game, revision]);

  const best = bestScore(game, history);
  const unit = game === "sequence-memory" ? "levels" : "ms";
  const label = game === "aim-trainer" ? "Best average per target" : "Personal best";
  const values = history.map((entry) => entry.value);
  const minimum = Math.min(...values);
  const span = Math.max(1, Math.max(...values) - minimum);
  const points = values
    .map((value, index) => {
      const x = 6 + (index * 208) / Math.max(1, values.length - 1);
      const y = 43 - ((value - minimum) / span) * 35;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <article className={styles.card}>
      <h2>Your results</h2>
      <div className={styles.stat}>
        <span className={styles.statLabel}>{label}</span>
        <strong>{best === null ? "—" : best.toLocaleString()} <small>{best === null ? "" : unit}</small></strong>
      </div>
      {history.length > 1 ? (
        <svg className={styles.trend} viewBox="0 0 220 50" role="img" aria-label="Recent score history">
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <p className={styles.empty}>{history.length === 0 ? "Finish a game to see your scores." : "Keep playing to see your progress."}</p>
      )}
      <div className={styles.count}>{history.length} {history.length === 1 ? "attempt" : "attempts"} saved</div>
    </article>
  );
}
