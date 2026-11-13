import { ArrowLeft } from "lucide-react";
import { lazy, Suspense } from "react";
import { Link, Route, Routes, useParams } from "react-router";
import { SiteHeader } from "../components/SiteHeader";
import { Home } from "../pages/Home";
import { getGame } from "./games";

const Games = lazy(() => import("../pages/Games"));

function EmptyPage({ title, label = "Coming soon" }: { title: string; label?: string }) {
  return (
    <section className="empty-page content-width">
      <span className="status-label">{label}</span>
      <h1>{title}</h1>
      <Link className="back-link" to="/games">
        <ArrowLeft size={17} aria-hidden="true" /> All games
      </Link>
    </section>
  );
}

function GamePage() {
  const { slug } = useParams();
  const game = getGame(slug);
  if (!game) return <EmptyPage title="Page not found" label="404" />;
  return <EmptyPage title={game.name} label="In development" />;
}

export function App() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="content">
        <Suspense fallback={<p className="route-loading content-width">Loading…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:slug" element={<GamePage />} />
            <Route path="/multiplayer" element={<EmptyPage title="Multiplayer" />} />
            <Route path="/leaderboards" element={<EmptyPage title="Leaderboards" />} />
            <Route path="*" element={<EmptyPage title="Page not found" label="404" />} />
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
