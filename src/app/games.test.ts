import { describe, expect, it } from "vitest";
import { games, getGame } from "./games";

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
});
