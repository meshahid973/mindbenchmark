import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AimTrainer from "../aim/AimTrainer";
import ChimpTest from "../chimp/ChimpTest";
import NumberMemory from "../number/NumberMemory";
import ReactionTime from "../reaction/ReactionTime";
import SequenceMemory from "../sequence/SequenceMemory";
import TypingSpeed from "../typing/TypingSpeed";
import VerbalMemory from "../verbal/VerbalMemory";
import VisualMemory from "../visual/VisualMemory";

describe("game screens", () => {
  it("renders all eight accessible initial screens", () => {
    for (const [Game, name] of [
      [ReactionTime, "Reaction Time"],
      [SequenceMemory, "Sequence Memory"],
      [AimTrainer, "Aim Trainer"],
      [NumberMemory, "Number Memory"],
      [VerbalMemory, "Verbal Memory"],
      [ChimpTest, "Chimp Test"],
      [VisualMemory, "Visual Memory"],
      [TypingSpeed, "Typing Speed"],
    ] as const) {
      const html = renderToStaticMarkup(<Game />);
      expect(html).toContain(name);
      expect(html).toContain("Game area");
      expect(html).toContain("Your results");
    }
  });

  it("keeps Reaction Time short and shows no redundant text", () => {
    const html = renderToStaticMarkup(<ReactionTime />);
    expect(html).toContain("Click to start");
    expect(html).not.toContain("Early clicks don't count");
  });

  it("provides focused start controls", () => {
    expect(renderToStaticMarkup(<AimTrainer />)).toContain(">Start</button>");
    expect(renderToStaticMarkup(<TypingSpeed />)).toContain(">Start</button>");
    expect(renderToStaticMarkup(<NumberMemory />)).toContain(">Start</button>");
  });
});
