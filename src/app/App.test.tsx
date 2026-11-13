import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { App } from "./App";

function renderRoute(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("app routes", () => {
  it("renders the homepage and keyboard skip link", () => {
    const html = renderRoute("/");
    expect(html).toContain("Choose a game");
    expect(html).toContain('href="#content"');
  });

  it("loads the games directory separately from the homepage", () => {
    const html = renderRoute("/games");
    expect(html).toContain("Loading games");
  });

  it("prepares the playable game route without a placeholder", () => {
    const html = renderRoute("/games/reaction-time");
    expect(html).toContain("Loading game");
    expect(html).not.toContain("In development");
  });

  it("loads each game independently without a placeholder", () => {
    for (const slug of ["number-memory", "verbal-memory", "chimp-test", "visual-memory", "typing-speed"]) {
      const html = renderRoute(`/games/${slug}`);
      expect(html).toContain("Loading game");
      expect(html).not.toContain("Coming soon");
    }
  });

  it("renders a clear missing-page state", () => {
    const html = renderRoute("/not-a-page");
    expect(html).toContain("Page not found");
  });
});
