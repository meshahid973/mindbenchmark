import { Moon, Sun, Zap } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { Link, NavLink } from "react-router";

type Theme = "light" | "dark";
const themeKey = "mindbenchmark-theme";

function initialTheme(): Theme {
  try {
    return window.localStorage.getItem(themeKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

const navigation = [
  { to: "/games", label: "Games" },
  { to: "/multiplayer", label: "Multiplayer" },
  { to: "/leaderboards", label: "Leaderboards" },
] as const;

export function SiteHeader() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(themeKey, theme);
    } catch {
      // The theme still works when storage is unavailable.
    }
  }, [theme]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="MindBenchmark home">
          <Zap size={20} fill="currentColor" strokeWidth={2.3} aria-hidden="true" />
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
        <button
          type="button"
          className="theme-toggle"
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          title={theme === "light" ? "Dark theme" : "Light theme"}
          onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon size={19} aria-hidden="true" /> : <Sun size={19} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
