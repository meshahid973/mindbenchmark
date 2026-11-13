import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { Games } from "./Games";

describe("games directory", () => {
  it("offers all eight games with accessible category tabs", () => {
    const html = renderToStaticMarkup(<MemoryRouter><Games /></MemoryRouter>);
    expect(html).toContain("Choose a challenge");
    expect(html).toContain("Precision");
    expect(html).toContain('role="tab"');
    expect(html).toContain("Reaction Time");
  });
});
