import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ScoreTrend } from "./ScoreTrend";

describe("mini score chart", () => {
  it("provides accessible per-run values, a touch inspector and score range", () => {
    const html = renderToStaticMarkup(<ScoreTrend values={[230, 210, 195]} unit="ms" />);
    expect(html).toContain("Run 1: 230 ms");
    expect(html).toContain("Run 3: 195 ms");
    expect(html).toContain('aria-label="Inspect past scores"');
    expect(html).toContain("Range 195");
    expect(html).toContain("230 ms");
  });

  it("does not create an inspection slider without useful history", () => {
    expect(renderToStaticMarkup(<ScoreTrend values={[]} unit="ms" />)).toBe("");
    expect(renderToStaticMarkup(<ScoreTrend values={[150]} unit="ms" />)).toBe("");
  });
});
