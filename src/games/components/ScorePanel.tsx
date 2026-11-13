import { memo, useState } from "react";
import { InfoTooltip } from "../../components/ui/InfoTooltip";
import {
  bestScore,
  lowerIsBetter,
  readScores,
  scoreUnits,
  type ScoreEntry,
  type ScoredGame,
} from "../core/scores";
import { scoreImprovement } from "../core/trend";
import { ScoreTrend } from "./ScoreTrend";
import styles from "./GameShell.module.css";

export const ScorePanel = memo(function ScorePanel({ game }: { game: ScoredGame }) {
  const [history] = useState<ScoreEntry[]>(() => readScores(game));
  const best = bestScore(game, history);
  const latest = history.at(-1)?.value ?? null;
  const previous = history.at(-2)?.value ?? null;
  const improvement = latest !== null && previous !== null
    ? scoreImprovement(latest, previous, lowerIsBetter(game)) : null;
  const unit = scoreUnits[game];

  return (
    <article className={styles.card}>
      <div className={styles.resultsHeading}>
        <h2>Your results</h2>
        <InfoTooltip label="Completed standard runs saved on this device. Practice sessions are excluded." />
      </div>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.statLabel}>Best</span>
          <strong>{best === null ? "—" : best.toLocaleString()} <small>{best === null ? "" : unit}</small></strong>
        </div>
        <div className={styles.metric}>
          <span className={styles.statLabel}>Latest</span>
          <strong>{latest === null ? "—" : latest.toLocaleString()} <small>{latest === null ? "" : unit}</small></strong>
        </div>
        <div className={styles.metric}>
          <span className={styles.statLabel}>vs previous</span>
          <strong className={styles.delta} data-improved={improvement === null ? "none" : improvement > 0 ? "yes" : improvement < 0 ? "no" : "same"}>
            {improvement === null ? "—" : improvement > 0 ? `+${improvement}` : improvement < 0 ? `−${Math.abs(improvement)}` : "0"}
            {improvement !== null && <small> {unit}</small>}
          </strong>
        </div>
      </div>
      <ScoreTrend values={history.map((entry) => entry.value)} unit={unit} />
      {history.length < 2 && (
        <p className={styles.empty}>
          {history.length === 0 ? "Finish a game to see your scores." : "Keep playing to see your progress."}
        </p>
      )}
      <div className={styles.count}>{history.length} {history.length === 1 ? "attempt" : "attempts"} saved · {lowerIsBetter(game) ? "Lower" : "Higher"} is better</div>
    </article>
  );
});
