import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SettingSwitch } from "./SettingSwitch";

describe("accessible training switches", () => {
  it("renders an off-by-default switch with an accessible label", () => {
    const html = renderToStaticMarkup(
      <SettingSwitch label="Adaptive practice" checked={false} onCheckedChange={() => {}} />,
    );
    expect(html).toContain("Adaptive practice");
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="false"');
  });
});
