import { Crosshair, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { GameShell } from "../components/GameShell";
import styles from "../components/Stage.module.css";
import { nextTarget, type Position } from "../core/random";
import { saveScore } from "../core/scores";
import { elapsedMilliseconds, inputTimestamp, presentedAt } from "../core/timing";

const targetCount = 20;
type Mode = "ready" | "playing" | "finished";

export default function AimTrainer() {
  const active = useRef(false);
  const startAt = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const targetRef = useRef<Position>({ x: 50, y: 50 });
  const lastInputAt = useRef(-Infinity);
  const frame = useRef<number | null>(null);
  const paintFrame = useRef<number | null>(null);

  const [mode, setMode] = useState<Mode>("ready");
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState<Position>({ x: 50, y: 50 });
  const [elapsed, setElapsed] = useState(0);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    function cancelFrames() {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
      if (paintFrame.current !== null) window.cancelAnimationFrame(paintFrame.current);
      frame.current = null;
      paintFrame.current = null;
    }

    function resetIfInterrupted() {
      if (!active.current) return;
      cancelFrames();
      active.current = false;
      hitsRef.current = 0;
      missesRef.current = 0;
      setHits(0);
      setMisses(0);
      setMode("ready");
    }

    function onVisibilityChange() {
      if (document.hidden) resetIfInterrupted();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", resetIfInterrupted);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", resetIfInterrupted);
      cancelFrames();
    };
  }, []);

  function start() {
    active.current = true;
    hitsRef.current = 0;
    missesRef.current = 0;
    const first = nextTarget();
    targetRef.current = first;
    setTarget(first);
    setHits(0);
    setMisses(0);
    setElapsed(0);

    flushSync(() => setMode("playing"));
    startAt.current = performance.now();

    // Start near the frame where the first target becomes visible, not
    // when the Start button's handler was entered.
    frame.current = window.requestAnimationFrame(() => {
      frame.current = null;
      paintFrame.current = window.requestAnimationFrame((frameTime) => {
        paintFrame.current = null;
        if (active.current && hitsRef.current === 0) {
          startAt.current = presentedAt(startAt.current, frameTime);
        }
      });
    });
  }

  function hit(pressedAt: number) {
    if (!active.current || elapsedMilliseconds(startAt.current, pressedAt) === null) return;

    const totalHits = hitsRef.current + 1;
    hitsRef.current = totalHits;
    setHits(totalHits);

    if (totalHits === targetCount) {
      active.current = false;
      const duration = Math.round(elapsedMilliseconds(startAt.current, pressedAt) ?? 0);
      setElapsed(duration);
      saveScore("aim-trainer", duration / targetCount);
      setRevision((value) => value + 1);
      setMode("finished");
      return;
    }

    const next = nextTarget(targetRef.current);
    targetRef.current = next;
    setTarget(next);
  }

  function miss() {
    if (!active.current) return;
    missesRef.current += 1;
    setMisses(missesRef.current);
  }

  const average = Math.round(elapsed / targetCount);

  return (
    <GameShell
      game="aim-trainer"
      revision={revision}
      howTo="Hit 20 targets. Your score is the average time per target."
      stage={
        <div className={styles.panel}>
          {mode === "playing" ? (
            <div
              className={styles.aimArena}
              onPointerDown={(event) => {
                if (event.button === 0) miss();
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
                  if (event.button !== 0) return;
                  event.stopPropagation();
                  const now = performance.now();
                  lastInputAt.current = now;
                  hit(inputTimestamp(event.timeStamp, now));
                }}
                onKeyDown={(event) => {
                  if (event.key !== " " && event.key !== "Enter") return;
                  event.preventDefault();
                  if (event.repeat) return;
                  const now = performance.now();
                  lastInputAt.current = now;
                  hit(inputTimestamp(event.timeStamp, now));
                }}
                onClick={(event) => {
                  // Accessibility tools can activate buttons without pointer or key events.
                  if (event.detail === 0 && performance.now() - lastInputAt.current > 200) {
                    hit(inputTimestamp(event.timeStamp, performance.now()));
                  }
                }}
              />
            </div>
          ) : (
            <>
              <Crosshair className={styles.symbol} size={54} strokeWidth={1.7} aria-hidden="true" />
              <h1 className={styles.title}>{mode === "finished" ? `${average} ms` : "Aim Trainer"}</h1>
              <p className={styles.message}>
                {mode === "finished" ? "Average per target" : "20 targets"}
              </p>
              {mode === "finished" && (
                <span className={styles.rounds}>
                  {(elapsed / 1000).toFixed(2)} s · {misses} misses
                </span>
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
