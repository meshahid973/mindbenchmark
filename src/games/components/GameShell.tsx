import type { ReactNode } from "react";
import { getGame } from "../../app/games";
import { Disclosure } from "../../components/ui/Disclosure";
import type { ScoredGame } from "../core/scores";
import { ScorePanel } from "./ScorePanel";
import styles from "./GameShell.module.css";

export type GameProgress = {
  label: string;
  current?: number;
  total?: number;
};

export function GameShell({
  stage, game, howTo, revision = 0, active = false, practice, progress,
}: {
  stage: ReactNode;
  game: ScoredGame;
  howTo: string;
  revision?: number;
  active?: boolean;
  practice?: ReactNode;
  progress?: GameProgress;
}) {
  const title = getGame(game)?.name ?? "Game";
  const percent = progress && progress.total && progress.total > 0
    ? Math.max(0, Math.min(100, ((progress.current ?? 0) / progress.total) * 100))
    : null;

  return (
    <div className={styles.page}>
      <header className={styles.gameHeader}>
        <div className={styles.headerInner}>
          <span className={styles.gameName}>{title}</span>
          <span className={styles.progressText}>{progress?.label ?? "Benchmark"}</span>
        </div>
        {percent !== null && (
          <div className={styles.progressTrack} aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>
        )}
      </header>
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
          <h2>Guide</h2>
          <Disclosure title="How to play"><p>{howTo}</p></Disclosure>
        </article>
        {practice}
      </section>
    </div>
  );
}
