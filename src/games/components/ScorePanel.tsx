import { useState } from "react";
import {
  bestScore,
  lowerIsBetter,
  readScores,
  scoreUnits,
  type ScoreEntry,
  type ScoredGame,
} from "../core/scores";
import { ScoreTrend } from "./ScoreTrend";
import styles from "./GameShell.module.css";

export function ScorePanel({ game }: { game: ScoredGame }) {
  const [history] = useState<ScoreEntry[]>(() => readScores(game));
  const best = bestScore(game, history);
  const unit = scoreUnits[game];

  return (
    <article className={styles.card}>
      <h2>Your results</h2>
      <div className={styles.stat}>
        <span className={styles.statLabel}>
          {game === "aim-trainer" ? "Best time per target" : "Personal best"}
        </span>
        <strong>{best === null ? "—" : best.toLocaleString()} <small>{best === null ? "" : unit}</small></strong>
        {best !== null && (
          <span className={styles.statLabel}>
            {lowerIsBetter(game) ? "Lower is better" : "Higher is better"}
          </span>
        )}
      </div>
      <ScoreTrend values={history.map((entry) => entry.value)} unit={unit} />
      {history.length < 2 && (
        <p className={styles.empty}>
          {history.length === 0 ? "Finish a game to see your scores." : "Keep playing to see your progress."}
        </p>
      )}
      <div className={styles.count}>
        {history.length} {history.length === 1 ? "attempt" : "attempts"} saved
      </div>
    </article>
  );
}
