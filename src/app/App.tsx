import { lazy, Suspense } from "react";
import { Route, Routes, useParams } from "react-router";
import { PlaceholderPage } from "../components/PlaceholderPage";
import { SiteHeader } from "../components/SiteHeader";
import { loadAim, loadReaction, loadSequence } from "../games/loaders";
import { Games } from "../pages/Games";
import { Home } from "../pages/Home";
import { getGame } from "./games";

const ReactionTime = lazy(loadReaction);
const SequenceMemory = lazy(loadSequence);
const AimTrainer = lazy(loadAim);

function GamePage() {
  const { slug } = useParams();
  const game = getGame(slug);
  if (!game) return <PlaceholderPage title="Page not found" label="404" />;

  let content = null;
  if (slug === "reaction-time") content = <ReactionTime />;
  if (slug === "sequence-memory") content = <SequenceMemory />;
  if (slug === "aim-trainer") content = <AimTrainer />;

  if (!content) return <PlaceholderPage title={game.name} label="Coming soon" />;

  return (
    <Suspense fallback={<p className="game-loading" role="status">Loading game…</p>}>
      {content}
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
