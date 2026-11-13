import type { ReactNode } from "react";
import type { ScoredGame } from "../core/scores";
import { ScorePanel } from "./ScorePanel";
import styles from "./GameShell.module.css";

export function GameShell({
  stage,
  game,
  howTo,
  revision = 0,
}: {
  stage: ReactNode;
  game: ScoredGame;
  howTo: string;
  revision?: number;
}) {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-label="Game area">
        {stage}
      </section>

      <section className={styles.details} aria-label="Game information">
        <ScorePanel key={`${game}:${revision}`} game={game} />
        <article className={styles.card}>
          <h2>How it works</h2>
          <p>{howTo}</p>
          <p className={styles.note}>Results depend on your device and input. Scores are saved on this device.</p>
        </article>
      </section>
    </div>
  );
}
