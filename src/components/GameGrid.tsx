import {
  BookOpen, Crosshair, Eye, Grid2X2, Hash, Keyboard, Puzzle, Zap,
  type LucideIcon,
} from "lucide-react";
import type { Game } from "../app/games";
import { SpotlightLink } from "./effects/SpotlightLink";

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

export function GameGrid({ items }: { items: readonly Game[] }) {
  if (!items.length) return <p className="empty-results">No games found.</p>;

  return (
    <div className="game-grid">
      {items.map((game) => {
        const Icon = icons[game.slug];
        return (
          <SpotlightLink key={game.slug} to={`/games/${game.slug}`}>
            <span className={`game-icon kind-${game.kind.toLowerCase()}`} aria-hidden="true">
              <Icon size={35} strokeWidth={1.8} />
            </span>
            <span className="game-name">{game.name}</span>
            <span className="game-hint">{game.hint}</span>
          </SpotlightLink>
        );
      })}
    </div>
  );
}
