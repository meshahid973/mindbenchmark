import { Crosshair, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { GameShell } from "../components/GameShell";
import styles from "../components/Stage.module.css";
import { nextTarget, type Position } from "../core/random";
import { saveScore } from "../core/scores";

const targetCount = 20;
type Mode = "ready" | "playing" | "finished";

export default function AimTrainer() {
  const active = useRef(false);
  const startAt = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const targetRef = useRef<Position>({ x: 50, y: 50 });

  const [mode, setMode] = useState<Mode>("ready");
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState<Position>({ x: 50, y: 50 });
  const [elapsed, setElapsed] = useState(0);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    function onVisibilityChange() {
      if (!document.hidden || !active.current) return;
      active.current = false;
      hitsRef.current = 0;
      missesRef.current = 0;
      setHits(0);
      setMisses(0);
      setMode("ready");
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
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

    // Show the first target before starting the clock.
    flushSync(() => setMode("playing"));
    startAt.current = performance.now();
  }

  function hit(pressedAt: number) {
    if (!active.current) return;
    const totalHits = hitsRef.current + 1;
    hitsRef.current = totalHits;
    setHits(totalHits);

    if (totalHits === targetCount) {
      active.current = false;
      const duration = Math.max(1, Math.round(pressedAt - startAt.current));
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
      howTo="Hit all 20 targets as quickly as possible. Missed clicks still cost time. Your score is your average time per target. Mouse, touch and keyboard can all be used."
      stage={
        <div className={styles.panel}>
          {mode === "playing" ? (
            <div
              className={styles.aimBoard}
              onPointerDown={(event) => {
                if (event.pointerType !== "mouse" || event.button === 0) miss();
              }}
            >
              <span className={styles.aimHud} role="status">
                {hits} / {targetCount} hits · {misses} misses
              </span>
              <button
                type="button"
                className={styles.target}
                style={{ left: `${target.x}%`, top: `${target.y}%` }}
                aria-label={`Target ${hits + 1} of ${targetCount}`}
                onPointerDown={(event) => {
                  if (event.pointerType === "mouse" && event.button !== 0) return;
                  event.stopPropagation();
                  hit(performance.now());
                }}
                onClick={(event) => {
                  // Keyboard-generated clicks have detail 0. Pointer clicks were handled above.
                  if (event.detail === 0) hit(performance.now());
                }}
                onKeyDown={(event) => {
                  if (event.repeat) event.preventDefault();
                }}
              />
            </div>
          ) : (
            <>
              <Crosshair className={styles.symbol} size={54} strokeWidth={1.7} aria-hidden="true" />
              <h1 className={styles.title}>{mode === "finished" ? `${average} ms` : "Aim Trainer"}</h1>
              <p className={styles.message}>
                {mode === "finished" ? "Average time per target." : "20 targets. As fast as you can."}
              </p>
              {mode === "finished" && (
                <span className={styles.rounds}>
                  {(elapsed / 1000).toFixed(2)} seconds · {misses} misses
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
