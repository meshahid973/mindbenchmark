import { Hash } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import stage from "../components/Stage.module.css";
import styles from "../components/ExtraGames.module.css";
import { randomDigits } from "../core/challenges";
import { saveScore } from "../core/scores";

type Phase = "ready" | "show" | "answer" | "correct" | "failed" | "finished";
const maximumDigits = 64;

export default function NumberMemory() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(1);
  const [digits, setDigits] = useState("");
  const [answer, setAnswer] = useState("");
  const [revision, setRevision] = useState(0);
  const timer = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("ready");

  const clear = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    const reset = () => {
      if (phaseRef.current !== "show" && phaseRef.current !== "answer") return;
      clear();
      phaseRef.current = "ready";
      setLevel(1);
      setPhase("ready");
      setAnswer("");
      setDigits("");
    };
    const onVisibility = () => { if (document.hidden) reset(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", reset);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", reset);
      clear();
    };
  }, [clear]);

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

  const startButton = (label: string, nextLevel: number) => (
    <button className={stage.primary} type="button" onClick={() => showNumber(nextLevel)}>
      {label}
    </button>
  );

  return (
    <GameShell
      game="number-memory"
      revision={revision}
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
          {phase === "ready" && startButton("Start", 1)}
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
                autoFocus
                value={answer}
                maxLength={digits.length}
                onChange={(event) => setAnswer(event.target.value.replace(/\D/g, ""))}
              />
              <button className={stage.primary} disabled={!answer} type="submit">Submit</button>
            </form>
          )}
          {(phase === "correct" || phase === "failed" || phase === "finished") && (
            <>
              <p className={stage.message}>
                {phase === "correct" ? `${level} ${level === 1 ? "digit" : "digits"} remembered`
                  : phase === "failed" ? `Answer: ${digits}`
                  : `${maximumDigits} digits remembered`}
              </p>
              {startButton(phase === "correct" ? "Next" : "Try again", phase === "correct" ? level + 1 : 1)}
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
