import { describe, expect, it } from "vitest";
import { recordTypingErrors, typingMicroDrill, weakestPairs } from "./typingDrills";

describe("typing micro-drills", () => {
  it("records new mistakes and keeps them even after correction", () => {
    const expected = "the quick brown";
    let errors = recordTypingErrors({}, "", "t", expected);
    expect(errors).toEqual({});
    errors = recordTypingErrors(errors, "t", "tx", expected);
    expect(errors).toEqual({ th: 1 });
    errors = recordTypingErrors(errors, "tx", "t", expected);
    expect(errors).toEqual({ th: 1 });
    errors = recordTypingErrors(errors, "t", "tx", expected);
    expect(errors).toEqual({ th: 2 });
    expect(weakestPairs(errors)).toEqual(["th"]);
  });

  it("ignores invalid pairs and unchanged text", () => {
    expect(recordTypingErrors({}, "ab", "ab", "abc")).toEqual({});
    expect(weakestPairs({ "!!": 8, re: 2, th: 3 })).toEqual(["th", "re"]);
  });

  it("builds short unscored word passages that emphasize a weak pair", () => {
    const passage = typingMicroDrill(["th"], 20);
    const words = passage.split(" ");
    expect(words).toHaveLength(20);
    expect(words.every((word) => word.includes("th"))).toBe(true);
    expect(typingMicroDrill(["qq"])).toBe("");
  });
});
