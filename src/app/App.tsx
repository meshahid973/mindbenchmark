import type { ReactNode } from "react";
import { Link, NavLink, Route, Routes, useParams } from "react-router";
import { games, getGame } from "./games";

const navigation = [
  { to: "/games", label: "Games" },
  { to: "/multiplayer", label: "Multiplayer" },
  { to: "/leaderboards", label: "Leaderboards" },
] as const;

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="MindBenchmark homepage">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>mindbenchmark</span>
        </Link>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="content">{children}</main>
      <footer className="site-footer">MindBenchmark · Play. Improve. Compete.</footer>
    </div>
  );
}

function GameCards({ limit }: { limit?: number }) {
  return (
    <div className="game-grid">
      {games.slice(0, limit).map((game, index) => (
        <Link className="game-card" key={game.slug} to={"/games/" + game.slug}>
          <span className={"game-symbol symbol-" + (index % 4)} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="game-name">{game.name}</span>
          <span className="game-kind">{game.kind}</span>
        </Link>
      ))}
    </div>
  );
}

function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">TEST YOUR LIMITS</p>
        <h1 id="hero-title">How fast is your mind?</h1>
        <p className="subtle">Play. Improve. Compete.</p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/games">Explore games</Link>
          <Link className="button button-secondary" to="/multiplayer">Multiplayer</Link>
        </div>
      </section>
      <section className="collection" aria-labelledby="games-title">
        <div className="section-heading">
          <h2 id="games-title">Explore games</h2>
          <Link className="text-link" to="/games">All games <span aria-hidden="true">↗</span></Link>
        </div>
        <GameCards limit={6} />
      </section>
    </>
  );
}

function Games() {
  return (
    <section className="page-section">
      <p className="eyebrow">THE COLLECTION</p>
      <h1>Games</h1>
      <p className="subtle">Eight tests. One place to improve.</p>
      <GameCards />
    </section>
  );
}

function GameRoute() {
  const { slug } = useParams();
  const game = getGame(slug);
  if (!game) return <NotFound />;

  return (
    <section className="empty-state" aria-labelledby="game-title">
      <p className="eyebrow">COMING IN PR 4</p>
      <h1 id="game-title">{game.name}</h1>
      <p className="subtle">The game engine and tests are next.</p>
      <Link className="button button-secondary" to="/games">Back to games</Link>
    </section>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <section className="empty-state">
      <p className="eyebrow">COMING SOON</p>
      <h1>{title}</h1>
      <p className="subtle">We're building this part carefully.</p>
      <Link className="button button-secondary" to="/games">Explore games</Link>
    </section>
  );
}

function NotFound() {
  return (
    <section className="empty-state">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <Link className="button button-secondary" to="/">Return home</Link>
    </section>
  );
}

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:slug" element={<GameRoute />} />
        <Route path="/multiplayer" element={<Placeholder title="Multiplayer" />} />
        <Route path="/leaderboards" element={<Placeholder title="Leaderboards" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
