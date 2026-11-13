import type { Game } from "../app/games";
import { GameCard } from "./GameCard";
import styles from "./GameCard.module.css";

export function GameGrid({
  items,
  detailed = false,
}: {
  items: readonly Game[];
  detailed?: boolean;
}) {
  if (items.length === 0) return <p className={styles.empty}>No games found.</p>;

  return (
    <div className={styles.grid}>
      {items.map((game) => <GameCard key={game.slug} game={game} detailed={detailed} />)}
    </div>
  );
}
