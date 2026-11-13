import { Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import stage from "../components/Stage.module.css";
import styles from "../components/ExtraGames.module.css";
import { visualPattern } from "../core/challenges";
import { saveScore } from "../core/scores";

type Phase = "ready" | "showing" | "input" | "passed" | "finished";
const maximumLevel = 15;
const cells = Array.from({ length: 36 }, (_, value) => value);

export default function VisualMemory() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [size, setSize] = useState(3);
  const [highlights, setHighlights] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [completed, setCompleted] = useState(0);
  const [revision, setRevision] = useState(0);

  const timer = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("ready");
  const chosen = useRef(new Set<number>());

  const clearTimer = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    function resetIfInterrupted() {
      if (phaseRef.current !== "showing" && phaseRef.current !== "input") return;
      clearTimer();
      phaseRef.current = "ready";
      chosen.current.clear();
      setPhase("ready");
      setLevel(1);
      setLives(3);
      setSelected([]);
      setCompleted(0);
    }
    function onVisibilityChange() { if (document.hidden) resetIfInterrupted(); }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", resetIfInterrupted);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", resetIfInterrupted);
      clearTimer();
    };
  }, [clearTimer]);

  function startLevel(nextLevel: number) {
    clearTimer();
    const pattern = visualPattern(nextLevel);
    chosen.current = new Set();
    setLevel(nextLevel);
    setSize(pattern.size);
    setHighlights(pattern.highlighted);
    setSelected([]);
    phaseRef.current = "showing";
    setPhase("showing");
    timer.current = window.setTimeout(() => {
      timer.current = null;
      if (phaseRef.current === "showing") {
        phaseRef.current = "input";
        setPhase("input");
      }
    }, 1700);
  }

  function press(index: number) {
    if (phaseRef.current !== "input" || chosen.current.has(index)) return;
    if (!highlights.includes(cell)) {
      const remaining = lives - 1;
      setLives(remaining);
      if (remaining === 0) {
        phaseRef.current = "finished";
        setPhase("finished");
        saveScore("visual-memory", completed);
        setRevision((value) => value + 1);
      }
      return;
    }

    chosen.current.add(index);
    setSelected([...chosen.current]);
    if (chosen.current.size === highlights.length) {
      const result = Math.max(completed, level);
      setCompleted(result);
      if (level === maximumLevel) {
        phaseRef.current = "finished";
        setPhase("finished");
        saveScore("visual-memory", result);
        setRevision((value) => value + 1);
      } else {
        phaseRef.current = "passed";
        setPhase("passed");
      }
    }
  }

  return (
    <GameShell
      game="visual-memory"
      revision={revision}
      howTo="Remember the highlighted squares and select them after they disappear. You have three lives."
      stage={
        <div className={stage.panel}>
          <Eye className={stage.symbol} size={46} strokeWidth={1.6} aria-hidden="true" />
          {(phase === "ready" || phase === "finished" || phase === "passed") ? (
            <>
              <h1 className={stage.title}>
                {phase === "finished" ? `Level ${completed}` :
                  phase === "passed" ? "Correct" : "Visual Memory"}
              </h1>
              <button className={stage.primary} type="button" onClick={() => {
                if (phase !== "passed") {
                  setLives(3);
                  setCompleted(0);
                }
                startLevel(phase === "passed" ? level + 1 : 1);
              }}>
                {phase === "passed" ? "Next" : phase === "finished" ? "Try again" : "Start"}
              </button>
            </>
          ) : (
            <>
              <div className={styles.stats}>
                <span>Level {level}</span><span>Lives {lives}</span>
              </div>
              <h1 className={styles.shortTitle}>
                {phase === "showing" ? "Remember" : "Select the squares"}
              </h1>
              <fieldset
                className={styles.visualGrid}
                aria-label="Visual memory grid"
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
              >
                {cells.slice(0, size * size).map((cell) => (
                  <button
                    key={cell}
                    type="button"
                    className={styles.visualTile}
                    data-lit={phase === "showing" ? highlights.includes(index) : selected.includes(cell)}
                    aria-label={`Square ${cell + 1}`}
                    disabled={phase === "showing" || selected.includes(index)}
                    onClick={() => press(cell)}
                  />
                ))}
              </fieldset>
            </>
          )}
        </div>
      }
    />
  );
}
