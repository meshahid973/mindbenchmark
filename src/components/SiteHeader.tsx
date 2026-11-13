import { Moon, Sun, Zap } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { Link, NavLink } from "react-router";

type Theme = "dark" | "light";
const themeKey = "mindbenchmark-theme";

function initialTheme(): Theme {
  try {
    return window.localStorage.getItem(themeKey) === "light" ? "light" : "dark";
  } catch {
    return "dark";
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
      // Keep the theme working when storage is disabled.
    }
  }, [theme]);

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
        <button
          type="button"
          className="theme-toggle"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Light theme" : "Dark theme"}
          onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
