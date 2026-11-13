import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SegmentedTabs } from "./SegmentedTabs";

describe("game filter tabs", () => {
  it("renders accessible Base UI tabs and a selected panel", () => {
    const html = renderToStaticMarkup(
      <SegmentedTabs label="Filter games" options={[
        { value: "All", label: "All" },
        { value: "Memory", label: "Memory" },
      ]} value="All" onValueChange={() => {}}>
        <p>Eight games</p>
      </SegmentedTabs>,
    );
    expect(html).toContain("Filter games");
    expect(html).toContain('role="tab"');
    expect(html).toContain("Eight games");
    expect(html).toContain("Memory");
  });
});
