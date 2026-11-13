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

  it("renders game filters", () => {
    const html = renderRoute("/games");
    expect(html).toContain("Filter games");
    expect(html).toContain("Precision");
  });

  it("prepares the playable game route without a placeholder", () => {
    const html = renderRoute("/games/reaction-time");
    expect(html).toContain("Loading game");
    expect(html).not.toContain("In development");
  });

  it("keeps planned games clearly marked as coming soon", () => {
    expect(renderRoute("/games/number-memory")).toContain("Coming soon");
  });

  it("renders a clear missing-page state", () => {
    const html = renderRoute("/not-a-page");
    expect(html).toContain("Page not found");
  });
});
