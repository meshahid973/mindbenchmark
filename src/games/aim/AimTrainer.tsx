import { Crosshair, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { GameShell } from "../components/GameShell";
import styles from "../components/Stage.module.css";
import { currentTargetHit, primaryPointer } from "../core/input";
import { nextTarget, type Position } from "../core/random";
import { saveScore } from "../core/scores";
import { elapsedMilliseconds, inputTimestamp, presentedAt } from "../core/timing";
import { useGameInterruption } from "../core/useGameInterruption";

type Mode = "ready" | "playing" | "finished";
type TargetCount = 20 | 30;

export default function AimTrainer() {
  const active = useRef(false);
  const startedAt = useRef(0);
  const acceptedHits = useRef(0);
  const missedHits = useRef(0);
  const currentPosition = useRef<Position>({ x: 50, y: 50 });
  const frames = useRef<number[]>([]);

  const [mode, setMode] = useState<Mode>("ready");
  const [targetCount, setTargetCount] = useState<TargetCount>(30);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState<Position>({ x: 50, y: 50 });
  const [elapsed, setElapsed] = useState(0);
  const [revision, setRevision] = useState(0);

  function cancelFrames() {
    for (const frame of frames.current) window.cancelAnimationFrame(frame);
    frames.current = [];
  }

  useGameInterruption(() => {
    if (!active.current) return;
    active.current = false;
    cancelFrames();
    acceptedHits.current = 0;
    missedHits.current = 0;
    setHits(0);
    setMisses(0);
    setMode("ready");
  });

  function start() {
    cancelFrames();
    acceptedHits.current = 0;
    missedHits.current = 0;
    const first = nextTarget();
    currentPosition.current = first;
    setTarget(first);
    setHits(0);
    setMisses(0);
    setElapsed(0);
    active.current = true;

    flushSync(() => setMode("playing"));
    startedAt.current = performance.now();
    frames.current.push(window.requestAnimationFrame(() => {
      frames.current.push(window.requestAnimationFrame((frameTime) => {
        if (active.current && acceptedHits.current === 0) {
          startedAt.current = presentedAt(startedAt.current, frameTime);
        }
        frames.current = [];
      }));
    }));
  }

  function hit(pressedAt: number, displayedHits: number) {
    if (!active.current || !currentTargetHit(displayedHits, acceptedHits.current)) return;
    const duration = elapsedMilliseconds(startedAt.current, pressedAt);
    if (duration === null) return;

    const nextHits = acceptedHits.current + 1;
    acceptedHits.current = nextHits;
    if (nextHits === targetCount) {
      active.current = false;
      cancelFrames();
      const total = Math.round(duration);
      setElapsed(total);
      if (targetCount === 30) {
        saveScore("aim-trainer", total / targetCount);
        setRevision((value) => value + 1);
      }
      setHits(nextHits);
      setMode("finished");
      return;
    }

    const next = nextTarget(currentPosition.current);
    currentPosition.current = next;
    setTarget(next);
    setHits(nextHits);
  }

  function miss() {
    if (!active.current) return;
    missedHits.current += 1;
    setMisses(missedHits.current);
  }

  return (
    <GameShell
      game="aim-trainer"
      revision={revision}
      howTo="Hit each target as quickly as possible. The standard test uses 30 targets. Quick mode is practice and does not save scores."
      stage={
        <div className={styles.panel}>
          {mode === "playing" ? (
            <div
              className={styles.aimArena}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget && primaryPointer(event)) miss();
              }}
            >
              <span className={styles.aimHud} role="status">
                {hits} / {targetCount} · {misses} misses
              </span>
              <button
                type="button"
                className={styles.target}
                style={{ left: `${target.x}%`, top: `${target.y}%` }}
                aria-label={`Target ${hits + 1} of ${targetCount}`}
                onPointerDown={(event) => {
                  if (!primaryPointer(event)) return;
                  event.stopPropagation();
                  hit(inputTimestamp(event.timeStamp, performance.now()), hits);
                }}
                onKeyDown={(event) => {
                  if (event.repeat && (event.key === " " || event.key === "Enter")) {
                    event.preventDefault();
                  }
                }}
                onClick={(event) => {
                  // Keyboard and assistive clicks have detail 0. Pointer hits were handled above.
                  if (event.detail === 0) {
                    hit(inputTimestamp(event.timeStamp, performance.now()), hits);
                  }
                }}
              />
            </div>
          ) : (
            <>
              <Crosshair className={styles.symbol} size={54} strokeWidth={1.7} aria-hidden="true" />
              <h1 className={styles.title}>
                {mode === "finished" ? `${Math.round(elapsed / targetCount)} ms` : "Aim Trainer"}
              </h1>
              <p className={styles.message}>
                {mode === "finished" ? "Average per target" : `${targetCount} targets`}
              </p>
              {mode === "finished" && (
                <span className={styles.rounds}>
                  {(elapsed / 1000).toFixed(2)} s · {misses} misses
                </span>
              )}
              {mode === "ready" && (
                <fieldset className={styles.modeChoice} aria-label="Aim Trainer length">
                  <button type="button" aria-pressed={targetCount === 30}
                    onClick={() => setTargetCount(30)}>Standard · 30</button>
                  <button type="button" aria-pressed={targetCount === 20}
                    onClick={() => setTargetCount(20)}>Quick · 20</button>
                </fieldset>
              )}
              <button className={styles.primary} type="button" onClick={start}>
                {mode === "finished" && <RotateCcw size={17} aria-hidden="true" />}
                {mode === "finished" ? "Try again" : "Start"}
              </button>
            </>
          )}
        </div>
      }
    />
  );
}
