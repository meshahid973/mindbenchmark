import { Grid2X2, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import { PracticePanel } from "../components/PracticePanel";
import { advanceAdaptive, adaptiveSummary, initialAdaptive } from "../core/adaptive";
import styles from "../components/Stage.module.css";
import { nextSequence } from "../core/random";
import { saveScore } from "../core/scores";
import { useGameInterruption } from "../core/useGameInterruption";
import { useTrainingSetting } from "../core/useTrainingSetting";

type Mode = "ready" | "showing" | "input" | "levelup" | "failed" | "review";
const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export default function SequenceMemory() {
  const modeRef = useRef<Mode>("ready");
  const sequenceRef = useRef<number[]>([]);
  const progressRef = useRef(0);
  const timers = useRef<number[]>([]);
  const feedbackTimer = useRef<number | null>(null);
  const [mode, setMode] = useState<Mode>("ready");
  const [level, setLevel] = useState(1);
  const [lit, setLit] = useState<number | null>(null);
  const [completed, setCompleted] = useState(0);
  const [revision, setRevision] = useState(0);
  const [adaptive, setAdaptive] = useTrainingSetting("adaptive-memory");
  const training = useRef(initialAdaptive(3));
  const [progress, setProgress] = useState(training.current);

  const cancelPlayback = useCallback(() => {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = null;
  }, []);

  function schedule(callback: () => void, delay: number) {
    timers.current.push(window.setTimeout(callback, delay));
  }

  useGameInterruption(() => {
    if (modeRef.current === "ready" || modeRef.current === "failed") return;
    cancelPlayback();
    modeRef.current = "ready";
    sequenceRef.current = [];
    progressRef.current = 0;
    setMode("ready");
    setLit(null);
    setLevel(1);
    training.current = initialAdaptive(3);
    setProgress(training.current);
  });

  useEffect(() => () => cancelPlayback(), [cancelPlayback]);

  function playSequence(sequence: number[], newLevel: number) {
    cancelPlayback();
    sequenceRef.current = sequence;
    progressRef.current = 0;
    modeRef.current = "showing";
    setMode("showing");
    setLevel(newLevel);
    setLit(null);

    const interval = Math.max(490, 730 - newLevel * 15);
    const lead = 450;
    for (const [index, tile] of sequence.entries()) {
      schedule(() => setLit(tile), lead + index * interval);
      schedule(() => setLit(null), lead + index * interval + 350);
    }

    schedule(() => {
      if (modeRef.current !== "showing") return;
      modeRef.current = "input";
      setMode("input");
    }, lead + sequence.length * interval);
  }

  function practiceSequence(length: number): number[] {
    let sequence: number[] = [];
    for (let index = 0; index < length; index += 1) {
      sequence = nextSequence(sequence);
    }
    return sequence;
  }

  function start() {
    if (adaptive) {
      if (mode !== "failed" && mode !== "review") {
        training.current = initialAdaptive(3);
        setProgress(training.current);
      }
      const length = training.current.level;
      playSequence(practiceSequence(length), length);
      return;
    }
    setCompleted(0);
    playSequence(nextSequence([]), 1);
  }

  function changePractice(enabled: boolean) {
    cancelPlayback();
    setAdaptive(enabled);
    training.current = initialAdaptive(3);
    setProgress(training.current);
    modeRef.current = "ready";
    sequenceRef.current = [];
    progressRef.current = 0;
    setLevel(1);
    setLit(null);
    setMode("ready");
  }

  function pressTile(tile: number) {
    if (modeRef.current !== "input") return;
    const sequence = sequenceRef.current;
    if (tile !== sequence[progressRef.current]) {
      cancelPlayback();
      modeRef.current = "failed";
      setLit(null);
      setMode("failed");
      if (adaptive) {
        const updated = advanceAdaptive(training.current, false, 2, 9);
        training.current = updated;
        setProgress(updated);
      } else {
        const score = level - 1;
        setCompleted(score);
        saveScore("sequence-memory", score);
        setRevision((value) => value + 1);
      }
      return;
    }

    progressRef.current += 1;
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
    setLit(tile);
    feedbackTimer.current = window.setTimeout(() => {
      feedbackTimer.current = null;
      setLit(null);
    }, 130);

    if (progressRef.current === sequence.length) {
      modeRef.current = "levelup";
      setMode("levelup");
      setCompleted(level);
      if (adaptive) {
        const updated = advanceAdaptive(training.current, true, 2, 9);
        training.current = updated;
        setProgress(updated);
        if (adaptiveSummary(updated)) {
          modeRef.current = "review";
          setMode("review");
        } else {
          schedule(() => playSequence(practiceSequence(updated.level), updated.level), 850);
        }
      } else {
        schedule(() => playSequence(nextSequence(sequence), level + 1), 850);
      }
    }
  }

  const title = mode === "ready" ? "Sequence Memory"
    : mode === "showing" ? "Watch closely"
    : mode === "input" ? "Your turn"
    : mode === "levelup" ? "Nice!"
    : mode === "review" ? "Practice review"
    : adaptive ? "Try another pattern" : `Level ${completed}`;

  const message = mode === "ready" ? "Remember the order."
    : mode === "showing" ? "Follow the highlighted squares."
    : mode === "input" ? "Repeat the pattern."
    : mode === "levelup" ? "Next pattern..."
    : mode === "review" ? "Five patterns complete."
    : adaptive ? "Try a different sequence." : "One wrong tile ends the run.";

  return (
    <GameShell
      game="sequence-memory"
      revision={revision}
      active={mode === "showing" || mode === "input" || mode === "levelup"}
      practice={<PracticePanel enabled={adaptive} onChange={changePractice}
        label="Adaptive practice"
        description={adaptive ? "Unscored · difficulty adjusts after each pattern." : "Off by default · standard scores stay separate."}
        lesson={{ title: "Learn pattern chunking", body: <>Remember small shapes: <strong>1–2–3</strong> is a row, <strong>3–6–9</strong> is a column. Combine short shapes when recalling a longer sequence.</> }}
        feedback={adaptiveSummary(progress)} />}
      howTo="Watch the tiles light up and repeat the sequence in the same order. Each level adds one step. Finish as many levels as you can."
      stage={
        <div className={styles.panel}>
          {(mode === "ready" || mode === "failed" || mode === "review") && <Grid2X2 className={styles.symbol} size={48} strokeWidth={1.6} aria-hidden="true" />}
          <h1 className={mode === "ready" || mode === "failed" || mode === "review" ? styles.title : styles.compactTitle}>{title}</h1>
          <p className={styles.message} role="status">{message}</p>
          {(mode === "showing" || mode === "input" || mode === "levelup") && (
            <span className={styles.rounds}>Level {level}</span>
          )}
          {mode === "ready" || mode === "failed" || mode === "review" ? (
            <button type="button" className={styles.primary} onClick={start}>
              {mode === "failed" && <RotateCcw size={17} aria-hidden="true" />}
              {adaptive && mode !== "ready" ? "Continue practice" : mode === "failed" ? "Try again" : adaptive ? "Start practice" : "Start"}
            </button>
          ) : (
            <fieldset className={styles.board} aria-label="Memory tiles">
              {tiles.map((tile) => (
                <button
                  key={tile}
                  type="button"
                  className={styles.tile}
                  data-lit={lit === tile}
                  aria-label={`Tile ${tile + 1}`}
                  disabled={mode !== "input"}
                  onClick={() => pressTile(tile)}
                />
              ))}
            </fieldset>
          )}
        </div>
      }
    />
  );
}
