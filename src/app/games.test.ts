import { describe, expect, it } from "vitest";
import { filterGames, gameFilters, games, getGame } from "./games";

describe("game registry", () => {
  it("uses unique, URL-safe slugs", () => {
    const slugs = games.map(({ slug }) => slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z]+(?:-[a-z]+)*$/.test(slug))).toBe(true);
  });

  it("resolves known games and ignores unknown ones", () => {
    expect(getGame("reaction-time")?.name).toBe("Reaction Time");
    expect(getGame("not-a-game")).toBeUndefined();
  });

  it("filters games by supported categories", () => {
    expect(filterGames("All")).toHaveLength(games.length);
    expect(filterGames("Memory")).toHaveLength(5);
    expect(filterGames("Speed")).toHaveLength(2);
    expect(filterGames("Precision")).toHaveLength(1);
    expect(gameFilters).toEqual(["All", "Speed", "Memory", "Precision"]);
  });
});
