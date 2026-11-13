import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

describe("theme toggle", () => {
  it("renders a useful label without a browser environment", () => {
    const html = renderToStaticMarkup(<ThemeToggle />);
    expect(html).toContain('aria-label="Switch to light theme"');
  });
});
