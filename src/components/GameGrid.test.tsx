import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { filterGames, games } from "../app/games";
import { GameGrid } from "./GameGrid";

function renderGames(detailed = false) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <GameGrid items={games} detailed={detailed} />
    </MemoryRouter>,
  );
}

describe("game grid", () => {
  it("links to every registered game", () => {
    const html = renderGames();
    expect((html.match(/href="\/games\//g) ?? []).length).toBe(games.length);
    expect(html).toContain("Reaction Time");
    expect(html).toContain("Typing Speed");
  });

  it("keeps descriptions off the homepage", () => {
    expect(renderGames()).not.toContain("Test your reflexes.");
    expect(renderGames(true)).toContain("Test your reflexes.");
  });

  it("renders an empty state for no results", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <GameGrid items={filterGames("All").filter(() => false)} />
      </MemoryRouter>,
    );
    expect(html).toContain("No games found.");
  });
});
