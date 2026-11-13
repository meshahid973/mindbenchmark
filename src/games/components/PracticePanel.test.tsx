import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PracticePanel } from "./PracticePanel";

describe("practice controls", () => {
  it("shows the off-by-default setting and an optional lesson control", () => {
    const html = renderToStaticMarkup(
      <PracticePanel enabled={false} onChange={() => {}}
        label="Adaptive practice" description="Unscored practice"
        lesson={{ title: "Learn chunking", body: "572 · 814 · 639" }} />,
    );
    expect(html).toContain("Adaptive practice");
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="false"');
    expect(html).toContain("Learn chunking");
    expect(html).not.toContain("572 · 814 · 639");
  });

  it("shows only batch feedback after training is enabled", () => {
    const html = renderToStaticMarkup(
      <PracticePanel enabled onChange={() => {}}
        label="Aim coaching" description="Tracking misses"
        feedback="Try a steadier pace." />,
    );
    expect(html).toContain("Try a steadier pace.");
    expect(html).toContain('role="status"');
  });
});
