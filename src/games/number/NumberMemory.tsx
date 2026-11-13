import { Hash } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameAction } from "../components/GameAction";
import { GameShell } from "../components/GameShell";
import stage from "../components/Stage.module.css";
import styles from "../components/ExtraGames.module.css";
import { PracticePanel } from "../components/PracticePanel";
import { advanceAdaptive, adaptiveSummary, initialAdaptive } from "../core/adaptive";
import { randomDigits } from "../core/challenges";
import { saveScore } from "../core/scores";
import { useGameInterruption } from "../core/useGameInterruption";
import { useTrainingSetting } from "../core/useTrainingSetting";

type Phase = "ready" | "show" | "answer" | "correct" | "failed" | "finished";
const maximumDigits = 64;

export default function NumberMemory() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(1);
  const [digits, setDigits] = useState("");
  const [answer, setAnswer] = useState("");
  const [revision, setRevision] = useState(0);
  const [adaptive, setAdaptive] = useTrainingSetting("adaptive-memory");
  const training = useRef(initialAdaptive(3));
  const [progress, setProgress] = useState(training.current);
  const timer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const phaseRef = useRef<Phase>("ready");

  useEffect(() => {
    if (phase === "answer") inputRef.current?.focus();
  }, [phase]);

  const clear = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useGameInterruption(() => {
    if (phaseRef.current !== "show" && phaseRef.current !== "answer") return;
    clear();
    phaseRef.current = "ready";
    setLevel(1);
    setPhase("ready");
    setAnswer("");
    setDigits("");
    training.current = initialAdaptive(3);
    setProgress(training.current);
  });

  useEffect(() => () => clear(), [clear]);

  function showNumber(nextLevel: number) {
    clear();
    const value = randomDigits(nextLevel);
    setDigits(value);
    setAnswer("");
    setLevel(nextLevel);
    phaseRef.current = "show";
    setPhase("show");
    timer.current = window.setTimeout(() => {
      timer.current = null;
      if (phaseRef.current !== "show") return;
      phaseRef.current = "answer";
      setPhase("answer");
    }, Math.min(12000, 1700 + 700 * nextLevel));
  }

  function submitAnswer() {
    if (phaseRef.current !== "answer") return;
    if (adaptive) {
      const updated = advanceAdaptive(training.current, answer === digits, 1, 12);
      training.current = updated;
      setProgress(updated);
      const next = answer === digits ? "correct" : "failed";
      phaseRef.current = next;
      setPhase(next);
      return;
    }
    if (answer === digits) {
      const next = level === maximumDigits ? "finished" : "correct";
      phaseRef.current = next;
      setPhase(next);
      if (next === "finished") {
        saveScore("number-memory", maximumDigits);
        setRevision((value) => value + 1);
      }
    } else {
      phaseRef.current = "failed";
      setPhase("failed");
      saveScore("number-memory", level - 1);
      setRevision((value) => value + 1);
    }
  }

  function resetSetting(enabled: boolean) {
    clear();
    setAdaptive(enabled);
    training.current = initialAdaptive(3);
    setProgress(training.current);
    phaseRef.current = "ready";
    setPhase("ready");
    setLevel(1);
    setAnswer("");
  }

  const startButton = (label: string, nextLevel: number) => (
    <GameAction onClick={() => showNumber(nextLevel)}>
      {label}
    </GameAction>
  );

  return (
    <GameShell
      game="number-memory"
      revision={revision}
      progress={{ label: `Level ${level}` }}
      active={phase === "show" || phase === "answer"}
      practice={<PracticePanel enabled={adaptive} onChange={resetSetting}
        label="Adaptive practice"
        description={adaptive ? "Unscored · difficulty adjusts as you practice." : "Off by default · standard scores stay separate."}
        lesson={{ title: "Learn number chunking", body: <>Group digits into small parts: <strong>572 · 814 · 639</strong> is easier to rehearse than 572814639. Recall the full number when answering.</> }}
        feedback={adaptiveSummary(progress)} />}
      howTo="Memorize each number, then type it after it disappears. Every correct answer adds one digit."
      stage={
        <div className={stage.panel}>
          <Hash className={stage.symbol} size={46} strokeWidth={1.6} aria-hidden="true" />
          <h1 className={stage.title}>
            {phase === "ready" ? "Number Memory"
              : phase === "show" ? "Memorize"
              : phase === "answer" ? "Enter the number"
              : phase === "correct" ? "Correct"
              : phase === "finished" ? "Perfect"
              : "Not quite"}
          </h1>
          {phase === "ready" && startButton(adaptive ? "Start practice" : "Start", adaptive ? 3 : 1)}
          {phase === "show" && (
            <p className={styles.digits} aria-live="off">{digits}</p>
          )}
          {phase === "answer" && (
            <form className={styles.answerForm} onSubmit={(event) => {
              event.preventDefault();
              submitAnswer();
            }}>
              <label className={styles.srOnly} htmlFor="memory-answer">Remembered number</label>
              <input
                id="memory-answer"
                className={styles.input}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                ref={inputRef}
                value={answer}
                maxLength={digits.length}
                onChange={(event) => setAnswer(event.target.value.replace(/\D/g, ""))}
              />
              <GameAction type="submit" disabled={!answer}>Submit</GameAction>
            </form>
          )}
          {(phase === "correct" || phase === "failed" || phase === "finished") && (
            <>
              <p className={stage.message}>
                {phase === "correct" ? `${level} ${level === 1 ? "digit" : "digits"} remembered`
                  : phase === "failed" ? `Answer: ${digits}`
                  : `${maximumDigits} digits remembered`}
              </p>
              {startButton(adaptive ? "Next practice" : phase === "correct" ? "Next" : "Try again", adaptive ? progress.level : phase === "correct" ? level + 1 : 1)}
            </>
          )}
          {(phase === "show" || phase === "answer") && (
            <span className={stage.rounds}>Level {level}</span>
          )}
        </div>
      }
    />
  );
}
