import { Zap } from "lucide-react";
import { Link, NavLink } from "react-router";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { to: "/games", label: "Games" },
  { to: "/multiplayer", label: "Multiplayer" },
  { to: "/leaderboards", label: "Leaderboards" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="MindBenchmark home">
          <Zap size={19} fill="currentColor" strokeWidth={1.7} aria-hidden="true" />
          <span>MindBenchmark</span>
        </Link>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
