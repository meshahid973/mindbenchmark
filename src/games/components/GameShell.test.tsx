import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GameShell } from "./GameShell";

describe("game shell", () => {
  it("renders a dedicated game stage with compact instructions and results", () => {
    const html = renderToStaticMarkup(
      <GameShell
        game="reaction-time"
        stage={<button type="button">Start</button>}
        howTo="Click when the cue changes."
      />,
    );
    expect(html).toContain("Game area");
    expect(html).toContain("Your results");
    expect(html).toContain("Click when the cue changes.");
    expect(html).toContain("Start");
  });
});
