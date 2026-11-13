import { lazy, Suspense } from "react";
import { Route, Routes, useParams } from "react-router";
import { PlaceholderPage } from "../components/PlaceholderPage";
import { SiteHeader } from "../components/SiteHeader";
import { Home } from "../pages/Home";
import { getGame } from "./games";
import { loadGames } from "./loadGames";

const Games = lazy(loadGames);

function GamePage() {
  const { slug } = useParams();
  const game = getGame(slug);
  if (!game) return <PlaceholderPage title="Page not found" label="404" />;
  return <PlaceholderPage title={game.name} label="In development" />;
}

export function App() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#content">Skip to content</a>
      <SiteHeader />
      <main id="content">
        <Suspense fallback={<p className="route-loading content-width" role="status">Loading…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:slug" element={<GamePage />} />
            <Route path="/multiplayer" element={<PlaceholderPage title="Multiplayer" />} />
            <Route path="/leaderboards" element={<PlaceholderPage title="Leaderboards" />} />
            <Route path="*" element={<PlaceholderPage title="Page not found" label="404" />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="site-footer">
        <span>MindBenchmark</span>
        <span>Play. Improve. Compete.</span>
      </footer>
    </div>
  );
}
