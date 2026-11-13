import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router";
import { games } from "../app/games";
import { GameGrid } from "../components/GameGrid";

export function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <Zap className="hero-bolt" aria-hidden="true" size={64} fill="currentColor" strokeWidth={1.3} />
          <h1 id="hero-title">MindBenchmark</h1>
          <p>Test your reflexes. Challenge your memory.</p>
          <Link className="hero-button" to="/games">
            Explore games <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="games-section content-width" aria-labelledby="games-heading">
        <div className="section-heading">
          <h2 id="games-heading">Choose a game</h2>
          <Link className="text-link" to="/games">View all <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <GameGrid items={games} />
      </section>
    </>
  );
}
