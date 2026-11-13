import {
  ArrowUpRight,
  BookOpen,
  Crosshair,
  Eye,
  Grid2X2,
  Hash,
  Keyboard,
  Puzzle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";
import type { Game } from "../app/games";
import { prefetchGame } from "../games/loaders";
import styles from "./GameCard.module.css";

const icons: Record<Game["slug"], LucideIcon> = {
  "reaction-time": Zap,
  "sequence-memory": Grid2X2,
  "aim-trainer": Crosshair,
  "number-memory": Hash,
  "verbal-memory": BookOpen,
  "chimp-test": Puzzle,
  "visual-memory": Eye,
  "typing-speed": Keyboard,
};

export function GameCard({ game, detailed = false }: { game: Game; detailed?: boolean }) {
  const Icon = icons[game.slug];

  return (
    <Link
      className={styles.card}
      to={`/games/${game.slug}`}
      onPointerEnter={() => prefetchGame(game.slug)}
      onFocus={() => prefetchGame(game.slug)}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon size={32} strokeWidth={1.65} />
      </span>
      <span className={styles.name}>{game.name}</span>
      {detailed && <span className={styles.hint}>{game.hint}</span>}
      <ArrowUpRight className={styles.arrow} size={17} aria-hidden="true" />
    </Link>
  );
}
