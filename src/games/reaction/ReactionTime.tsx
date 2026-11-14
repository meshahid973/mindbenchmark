import { useState } from "react";
import { GameShell } from "../components/GameShell";
import { median, saveScore } from "../core/scores";
import { ReactionStage, roundsRequired, type RoundPhase } from "./ReactionStage";

export default function ReactionTime() {
  const [phase, setPhase] = useState<RoundPhase>("ready");
  const [completed, setCompleted] = useState(0);
  const [revision, setRevision] = useState(0);

  function updateRound(next: RoundPhase, trials: number[]) {
    setPhase(next);
    setCompleted(trials.length);
    if (next === "finished") {
      saveScore("reaction-time", median(trials));
      setRevision((value) => value + 1);
    }
  }

  return (
    <GameShell
      game="reaction-time"
      revision={revision}
      progress={{
        current: completed,
        total: roundsRequired,
        label: phase === "finished" ? "Complete" : phase === "ready" ? "5 rounds"
          : `Round ${Math.min(completed + 1, roundsRequired)} / ${roundsRequired}`,
      }}
      active={phase === "waiting"}
      howTo="Click when red turns green. Five rounds. Responses under 80 ms count as anticipation."
      stage={<ReactionStage onRoundChange={updateRound} />}
    />
  );
}
