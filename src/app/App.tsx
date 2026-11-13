import { lazy, Suspense } from "react";
import { Route, Routes, useParams } from "react-router";
import { PlaceholderPage } from "../components/PlaceholderPage";
import { SiteHeader } from "../components/SiteHeader";
import {
  loadAim,
  loadChimp,
  loadNumber,
  loadReaction,
  loadSequence,
  loadTyping,
  loadVerbal,
  loadVisual,
} from "../games/loaders";
import { Games } from "../pages/Games";
import { Home } from "../pages/Home";
import { getGame, type Game } from "./games";

const components = {
  "reaction-time": lazy(loadReaction),
  "sequence-memory": lazy(loadSequence),
  "aim-trainer": lazy(loadAim),
  "number-memory": lazy(loadNumber),
  "verbal-memory": lazy(loadVerbal),
  "chimp-test": lazy(loadChimp),
  "visual-memory": lazy(loadVisual),
  "typing-speed": lazy(loadTyping),
} satisfies Record<Game["slug"], ReturnType<typeof lazy>>;

function GamePage() {
  const { slug } = useParams();
  const game = getGame(slug);
  if (!game) return <PlaceholderPage title="Page not found" label="404" />;

  const Component = components[game.slug];
  return (
    <Suspense fallback={<p className="game-loading" role="status">Loading game…</p>}>
      <Component />
    </Suspense>
  );
}

export function App() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#content">Skip to content</a>
      <SiteHeader />
      <main id="content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:slug" element={<GamePage />} />
          <Route path="/multiplayer" element={<PlaceholderPage title="Multiplayer" />} />
          <Route path="/leaderboards" element={<PlaceholderPage title="Leaderboards" />} />
          <Route path="*" element={<PlaceholderPage title="Page not found" label="404" />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>MindBenchmark</span>
        <span>Play. Improve. Compete.</span>
      </footer>
    </div>
  );
}
