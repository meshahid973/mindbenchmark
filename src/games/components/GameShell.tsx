import type { ReactNode } from "react";
import type { ScoredGame } from "../core/scores";
import { ScorePanel } from "./ScorePanel";
import styles from "./GameShell.module.css";

export function GameShell({
  stage,
  game,
  howTo,
  revision = 0,
  active = false,
  practice,
}: {
  stage: ReactNode;
  game: ScoredGame;
  howTo: string;
  revision?: number;
  active?: boolean;
  practice?: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <section className={styles.hero} data-game={game} aria-label="Game area">
        {stage}
      </section>
      <section
        className={styles.details}
        data-playing={active}
        aria-hidden={active}
        aria-label="Game information"
      >
        <ScorePanel key={`${game}:${revision}`} game={game} />
        <article className={styles.card}>
          <h2>How it works</h2>
          <p>{howTo}</p>
        </article>
        {practice}
      </section>
    </div>
  );
}
