import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GameShell } from "./GameShell";

describe("game shell", () => {
  it("renders a dedicated game stage with compact instructions and results", () => {
    const html = renderToStaticMarkup(
      <GameShell
        game="reaction-time"
        active
        stage={<button type="button">Start</button>}
        howTo="Click when the cue changes."
      />,
    );
    expect(html).toContain("Game area");
    expect(html).toContain('data-playing="true"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Your results");
    expect(html).toContain("How to play");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Start");
  });
});
