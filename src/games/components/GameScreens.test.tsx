import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AimTrainer from "../aim/AimTrainer";
import ReactionTime from "../reaction/ReactionTime";
import SequenceMemory from "../sequence/SequenceMemory";

describe("game screens", () => {
  it("starts Reaction Time with one short instruction", () => {
    const html = renderToStaticMarkup(<ReactionTime />);
    expect(html).toContain("Reaction Time");
    expect(html).toContain("Click to start");
    expect(html).not.toContain("Early clicks don't count");
  });

  it("renders an accessible Aim Trainer start control", () => {
    const html = renderToStaticMarkup(<AimTrainer />);
    expect(html).toContain("Aim Trainer");
    expect(html).toContain("20 targets");
    expect(html).toContain(">Start</button>");
  });

  it("keeps the sequence game in a predictable ready state", () => {
    const html = renderToStaticMarkup(<SequenceMemory />);
    expect(html).toContain("Sequence Memory");
    expect(html).toContain("Remember the order.");
  });
});
