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

  it("renders game filters without an additional loading page", () => {
    const html = renderRoute("/games");
    expect(html).toContain("Filter games");
    expect(html).toContain("Precision");
  });

  it("renders a clear missing-page state", () => {
    const html = renderRoute("/not-a-page");
    expect(html).toContain("Page not found");
  });
});
