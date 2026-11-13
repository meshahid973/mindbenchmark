import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router";
import { games } from "../app/games";
import { GameGrid } from "../components/GameGrid";

export function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner">
          <Zap size={56} strokeWidth={1.65} fill="currentColor" aria-hidden="true" />
          <h1 id="hero-title">MindBenchmark</h1>
          <p>Test your mind.</p>
          <Link
            className="primary-button"
            to="/games"
          >
            Explore games <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="games-section content-width" aria-labelledby="games-heading">
        <div className="section-heading">
          <h2 id="games-heading">Choose a game</h2>
          <Link
            className="text-link"
            to="/games"
          >
            All games <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <GameGrid items={games} />
      </section>
    </>
  );
}
