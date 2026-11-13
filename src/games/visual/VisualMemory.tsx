import { Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import { PracticePanel } from "../components/PracticePanel";
import { advanceAdaptive, adaptiveSummary, initialAdaptive } from "../core/adaptive";
import stage from "../components/Stage.module.css";
import styles from "../components/ExtraGames.module.css";
import { visualPattern } from "../core/challenges";
import { saveScore } from "../core/scores";
import { useGameInterruption } from "../core/useGameInterruption";
import { useTrainingSetting } from "../core/useTrainingSetting";

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
  const [missed, setMissed] = useState<number[]>([]);
  const [completed, setCompleted] = useState(0);
  const [revision, setRevision] = useState(0);
  const [adaptive, setAdaptive] = useTrainingSetting("adaptive-memory");
  const training = useRef(initialAdaptive(2));
  const [progress, setProgress] = useState(training.current);

  const timer = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("ready");
  const chosen = useRef(new Set<number>());
  const missedRef = useRef(new Set<number>());

  const clearTimer = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useGameInterruption(() => {
    if (phaseRef.current !== "showing" && phaseRef.current !== "input") return;
    clearTimer();
    phaseRef.current = "ready";
    chosen.current.clear();
    missedRef.current.clear();
    setMissed([]);
    setPhase("ready");
    setLevel(1);
    setLives(3);
    setSelected([]);
    setCompleted(0);
    training.current = initialAdaptive(2);
    setProgress(training.current);
  });

  useEffect(() => () => clearTimer(), [clearTimer]);

  function startLevel(nextLevel: number) {
    clearTimer();
    const pattern = visualPattern(nextLevel);
    chosen.current = new Set();
    missedRef.current = new Set();
    setLevel(nextLevel);
    setSize(pattern.size);
    setHighlights(pattern.highlighted);
    setSelected([]);
    setMissed([]);
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

  function changePractice(enabled: boolean) {
    clearTimer();
    setAdaptive(enabled);
    training.current = initialAdaptive(2);
    setProgress(training.current);
    phaseRef.current = "ready";
    setPhase("ready");
    setLevel(1);
    setLives(3);
    setCompleted(0);
    chosen.current.clear();
    missedRef.current.clear();
    setSelected([]);
    setMissed([]);
  }

  function press(index: number) {
    if (phaseRef.current !== "input" || chosen.current.has(index) || missedRef.current.has(index)) return;
    if (!highlights.includes(index)) {
      if (adaptive) {
        const updated = advanceAdaptive(training.current, false, 1, 15);
        training.current = updated;
        setProgress(updated);
        phaseRef.current = "finished";
        setPhase("finished");
        return;
      }
      missedRef.current.add(index);
      setMissed([...missedRef.current]);
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
      if (adaptive) {
        const updated = advanceAdaptive(training.current, true, 1, 15);
        training.current = updated;
        setProgress(updated);
        phaseRef.current = "passed";
        setPhase("passed");
        return;
      }
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
      active={phase === "showing" || phase === "input"}
      practice={<PracticePanel enabled={adaptive} onChange={changePractice}
        label="Adaptive practice"
        description={adaptive ? "Unscored · match a pattern, then adjust difficulty." : "Off by default · standard scores stay separate."}
        lesson={{ title: "Learn visual chunking", body: <>Look for small <strong>lines, corners and L-shapes</strong>, rather than memorizing every square separately.</> }}
        feedback={adaptiveSummary(progress)} />}
      howTo="Remember the highlighted squares and select them after they disappear. You have three lives."
      stage={
        <div className={stage.panel}>
          {phase !== "showing" && phase !== "input" && <Eye className={stage.symbol} size={46} strokeWidth={1.6} aria-hidden="true" />}
          {(phase === "ready" || phase === "finished" || phase === "passed") ? (
            <>
              <h1 className={stage.title}>
                {phase === "finished" ? adaptive ? "Try another pattern" : `Level ${completed}` :
                  phase === "passed" ? "Correct" : "Visual Memory"}
              </h1>
              <button className={stage.primary} type="button" onClick={() => {
                if (!adaptive && phase !== "passed") {
                  setLives(3);
                  setCompleted(0);
                }
                startLevel(adaptive ? progress.level : phase === "passed" ? level + 1 : 1);
              }}>
                {adaptive ? phase === "ready" ? "Start practice" : "Next practice" : phase === "passed" ? "Next" : phase === "finished" ? "Try again" : "Start"}
              </button>
            </>
          ) : (
            <>
              <div className={styles.stats}>
                <span>Level {level}</span><span>{adaptive ? "Practice" : `Lives ${lives}`}</span>
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
                    data-lit={phase === "showing" ? highlights.includes(cell) : selected.includes(cell)}
                    data-missed={missed.includes(cell)}
                    aria-label={`Square ${cell + 1}${missed.includes(cell) ? ", incorrect" : ""}`}
                    disabled={phase === "showing" || selected.includes(cell) || missed.includes(cell)}
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
