import { Crosshair, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { GameAction } from "../components/GameAction";
import { GameShell } from "../components/GameShell";
import { PracticePanel } from "../components/PracticePanel";
import styles from "../components/Stage.module.css";
import { coachAimBatch, nextReachTarget, type AimBatch } from "../core/aimCoaching";
import { currentTargetHit, primaryPointer } from "../core/input";
import { nextTarget, type Position } from "../core/random";
import { saveScore } from "../core/scores";
import { elapsedMilliseconds, inputTimestamp, presentedAt } from "../core/timing";
import { useGameInterruption } from "../core/useGameInterruption";
import { useTrainingSetting } from "../core/useTrainingSetting";

type Mode = "ready" | "playing" | "finished";
type TargetCount = 20 | 30;
const coachingCount = 20;

function drillFocus(hits: number): string {
  const phase = Math.floor(hits / 5);
  return ["Accuracy", "Speed", "Control", "Reach"][Math.min(3, phase)];
}

export default function AimTrainer() {
  const active = useRef(false);
  const startedAt = useRef(0);
  const acceptedHits = useRef(0);
  const missedHits = useRef(0);
  const currentPosition = useRef<Position>({ x: 50, y: 50 });
  const frames = useRef<number[]>([]);
  const lastHitAt = useRef(0);
  const batchTimes = useRef<number[]>([]);
  const batchMisses = useRef(0);
  const lastBatch = useRef<AimBatch | null>(null);

  const [mode, setMode] = useState<Mode>("ready");
  const [targetCount, setTargetCount] = useState<TargetCount>(30);
  const [runCount, setRunCount] = useState<TargetCount>(30);
  const [coaching, setCoaching] = useTrainingSetting("aim-coach");
  const [coachingNote, setCoachingNote] = useState<string | null>(null);
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
    batchTimes.current = [];
    batchMisses.current = 0;
    setHits(0);
    setMisses(0);
    setCoachingNote(null);
    setMode("ready");
  });

  function setCoach(enabled: boolean) {
    setCoaching(enabled);
    setMode("ready");
    setCoachingNote(null);
  }

  function start() {
    cancelFrames();
    acceptedHits.current = 0;
    missedHits.current = 0;
    batchTimes.current = [];
    batchMisses.current = 0;
    lastBatch.current = null;
    const first = coaching ? nextReachTarget(0) : nextTarget();
    currentPosition.current = first;
    setTarget(first);
    setHits(0);
    setMisses(0);
    setElapsed(0);
    setCoachingNote(null);
    const count = coaching ? coachingCount : targetCount;
    setRunCount(count);
    active.current = true;

    flushSync(() => setMode("playing"));
    startedAt.current = performance.now();
    lastHitAt.current = startedAt.current;
    frames.current.push(window.requestAnimationFrame(() => {
      frames.current.push(window.requestAnimationFrame((frameTime) => {
        if (active.current && acceptedHits.current === 0) {
          startedAt.current = presentedAt(startedAt.current, frameTime);
          lastHitAt.current = startedAt.current;
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
    if (coaching) {
      batchTimes.current.push(Math.max(0, pressedAt - lastHitAt.current));
      lastHitAt.current = pressedAt;
      if (nextHits % 5 === 0) {
        const current: AimBatch = {
          averageMs: batchTimes.current.reduce((sum, time) => sum + time, 0) / batchTimes.current.length,
          misses: batchMisses.current,
        };
        setCoachingNote(coachAimBatch(current, lastBatch.current));
        lastBatch.current = current;
        batchTimes.current = [];
        batchMisses.current = 0;
      }
    }

    if (nextHits === runCount) {
      active.current = false;
      cancelFrames();
      const total = Math.round(duration);
      setElapsed(total);
      if (!coaching && runCount === 30) {
        saveScore("aim-trainer", total / runCount);
        setRevision((value) => value + 1);
      }
      setHits(nextHits);
      setMode("finished");
      return;
    }

    const next = coaching ? nextReachTarget(nextHits) : nextTarget(currentPosition.current);
    currentPosition.current = next;
    setTarget(next);
    setHits(nextHits);
  }

  function miss() {
    if (!active.current) return;
    missedHits.current += 1;
    if (coaching) batchMisses.current += 1;
    setMisses(missedHits.current);
  }

  return (
    <GameShell
      game="aim-trainer"
      revision={revision}
      progress={{ current: hits, total: mode === "ready" ? targetCount : runCount, label: mode === "finished" ? "Complete" : mode === "ready" ? "30-target standard" : `${hits} / ${runCount} targets` }}
      active={mode === "playing"}
      howTo="Hit each target as quickly as possible. Standard mode uses 30 targets; quick and coaching drills are unscored."
      practice={<PracticePanel enabled={coaching} onChange={setCoach}
        label="Aim coaching"
        description={coaching
          ? "Coaching tracks speed and misses every five targets. Unscored."
          : "Optional speed-versus-accuracy coaching, off by default."}
        feedback={coachingNote} />}
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
                {hits} / {runCount} · {misses} misses
              </span>
              {coaching && (
                <span className={styles.coachHud} aria-live="polite">
                  {drillFocus(hits)} · {coachingNote ?? "Analyzing speed + misses"}
                </span>
              )}
              <button
                type="button"
                className={styles.target}
                data-focus={coaching ? drillFocus(hits) : undefined}
                style={{ left: `${target.x}%`, top: `${target.y}%` }}
                aria-label={`Target ${hits + 1} of ${runCount}`}
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
                {mode === "finished" ? `${Math.round(elapsed / runCount)} ms` : "Aim Trainer"}
              </h1>
              <p className={styles.message}>
                {mode === "finished" ? coaching ? "Coached drill · unscored" : "Average per target"
                  : coaching ? "20-target coached drill" : `${targetCount} targets`}
              </p>
              {mode === "finished" && (
                <span className={styles.rounds}>
                  {(elapsed / 1000).toFixed(2)} s · {misses} misses
                </span>
              )}
              {mode === "ready" && !coaching && (
                <fieldset className={styles.modeChoice} aria-label="Aim Trainer length">
                  <button type="button" aria-pressed={targetCount === 30}
                    onClick={() => setTargetCount(30)}>Standard · 30</button>
                  <button type="button" aria-pressed={targetCount === 20}
                    onClick={() => setTargetCount(20)}>Quick · 20</button>
                </fieldset>
              )}
              <GameAction onClick={start}>
                {mode === "finished" && <RotateCcw size={17} aria-hidden="true" />}
                {mode === "finished" ? "Try again" : coaching ? "Start drill" : "Start"}
              </GameAction>
            </>
          )}
        </div>
      }
    />
  );
}
