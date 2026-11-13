import { Grid2X2, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import styles from "../components/Stage.module.css";
import { nextSequence } from "../core/random";
import { saveScore } from "../core/scores";
import { useGameInterruption } from "../core/useGameInterruption";

type Mode = "ready" | "showing" | "input" | "levelup" | "failed";
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

  function start() {
    setCompleted(0);
    playSequence(nextSequence([]), 1);
  }

  function pressTile(tile: number) {
    if (modeRef.current !== "input") return;
    const sequence = sequenceRef.current;
    if (tile !== sequence[progressRef.current]) {
      cancelPlayback();
      modeRef.current = "failed";
      setLit(null);
      setMode("failed");
      const score = level - 1;
      setCompleted(score);
      saveScore("sequence-memory", score);
      setRevision((value) => value + 1);
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
      schedule(() => playSequence(nextSequence(sequence), level + 1), 850);
    }
  }

  const title = mode === "ready" ? "Sequence Memory"
    : mode === "showing" ? "Watch closely"
    : mode === "input" ? "Your turn"
    : mode === "levelup" ? "Nice!"
    : `Level ${completed}`;

  const message = mode === "ready" ? "Remember the order."
    : mode === "showing" ? "Follow the highlighted squares."
    : mode === "input" ? "Repeat the pattern."
    : mode === "levelup" ? "Next level..."
    : "One wrong tile ends the run.";

  return (
    <GameShell
      game="sequence-memory"
      revision={revision}
      howTo="Watch the tiles light up and repeat the sequence in the same order. Each level adds one step. Finish as many levels as you can."
      stage={
        <div className={styles.panel}>
          <Grid2X2 className={styles.symbol} size={48} strokeWidth={1.6} aria-hidden="true" />
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.message} role="status">{message}</p>
          {(mode === "showing" || mode === "input" || mode === "levelup") && (
            <span className={styles.rounds}>Level {level}</span>
          )}
          {mode === "ready" || mode === "failed" ? (
            <button type="button" className={styles.primary} onClick={start}>
              {mode === "failed" && <RotateCcw size={17} aria-hidden="true" />}
              {mode === "failed" ? "Try again" : "Start"}
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
