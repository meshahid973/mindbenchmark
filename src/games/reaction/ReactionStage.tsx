import { Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import styles from "../components/Stage.module.css";
import { activationKey, primaryPointer } from "../core/input";
import { reactionDelay } from "../core/random";
import { mean, median } from "../core/scores";
import { inputTimestamp, reactionSignal } from "../core/timing";
import { useGameInterruption } from "../core/useGameInterruption";
import { reactionElapsed } from "./reactionTiming";

type Phase = "ready" | "waiting" | "go" | "early" | "between" | "finished";
export type RoundPhase = Exclude<Phase, "go">;
export const roundsRequired = 5;

type Session = {
  phase: Phase;
  trials: number[];
  startedAt: number;
  timer: number | null;
  frame: number | null;
};

function stopTimer(session: Session) {
  if (session.timer !== null) window.clearTimeout(session.timer);
  if (session.frame !== null) window.cancelAnimationFrame(session.frame);
  session.timer = null;
  session.frame = null;
}

/** The cue is local state: revealing it must not render the surrounding shell. */
export function ReactionStage({
  onRoundChange,
}: {
  onRoundChange: (phase: RoundPhase, trials: number[]) => void;
}) {
  const session = useRef<Session>({
    phase: "ready", trials: [], startedAt: 0, timer: null, frame: null,
  });
  const [phase, setPhase] = useState<Phase>("ready");
  const [times, setTimes] = useState<number[]>([]);

  function publish(next: RoundPhase) {
    const current = session.current;
    current.phase = next;
    setPhase(next);
    setTimes(current.trials);
    onRoundChange(next, current.trials);
  }

  useGameInterruption(() => {
    const current = session.current;
    if (current.phase !== "waiting" && current.phase !== "go") return;
    stopTimer(current);
    current.trials = [];
    publish("ready");
  });

  useEffect(() => () => stopTimer(session.current), []);

  function startRound() {
    const current = session.current;
    stopTimer(current);
    if (current.phase === "finished") current.trials = [];

    publish("waiting");
    current.timer = window.setTimeout(() => {
      current.timer = null;
      current.frame = window.requestAnimationFrame(() => {
        current.frame = null;
        if (current.phase !== "waiting" || document.hidden) return;

        // Commit the cue and timestamp it in the same pre-paint callback.
        // A second frame would move the clock after the cue became visible.
        flushSync(() => setPhase("go"));
        current.startedAt = performance.now();
        current.phase = "go";
      });
    }, reactionDelay());
  }

  function respond(pressedAt: number) {
    const current = session.current;
    if (current.phase === "ready" || current.phase === "early" ||
        current.phase === "between" || current.phase === "finished") {
      startRound();
      return;
    }
    if (current.phase === "waiting") {
      stopTimer(current);
      publish("early");
      return;
    }

    const elapsed = reactionElapsed(current.startedAt, pressedAt);
    if (elapsed === null) {
      stopTimer(current);
      publish("early");
      return;
    }

    stopTimer(current);
    current.trials = [...current.trials, elapsed];
    publish(current.trials.length === roundsRequired ? "finished" : "between");
  }

  const signal = phase === "waiting" || phase === "go" ? reactionSignal(phase) : undefined;
  const lastTime = times.at(-1);
  const bestRun = times.length === roundsRequired ? Math.round(median(times)) : null;
  const average = times.length ? Math.round(mean(times)) : null;
  const heading = phase === "ready" ? "Reaction Time"
    : phase === "waiting" ? "Wait for green"
    : phase === "go" ? "Click!"
    : phase === "early" ? "Too soon!"
    : phase === "finished" ? `${average} ms`
    : `${Math.round(lastTime ?? 0)} ms`;
  const message = phase === "ready" ? "Click to start"
    : phase === "early" ? "Click to retry"
    : phase === "finished" ? "Average reaction time"
    : phase === "between" ? `Average ${average} ms · Click to continue`
    : null;

  return (
    <div className={styles.panel} data-signal={signal}>
      <button
        type="button"
        className={styles.fillAction}
        aria-label={message ? `${heading}. ${message}` : heading}
        onPointerDown={(event) => {
          if (!primaryPointer(event)) return;
          respond(inputTimestamp(event.timeStamp, performance.now()));
        }}
        onKeyDown={(event) => {
          if (event.key !== " " && event.key !== "Enter") return;
          // Also cancel the browser default for held keys.
          event.preventDefault();
          if (!activationKey(event)) return;
          respond(inputTimestamp(event.timeStamp, performance.now()));
        }}
        onClick={(event) => {
          // Native assistive activation has no pointer-down or key-down.
          if (event.detail === 0) respond(inputTimestamp(event.timeStamp, performance.now()));
        }}
      />
      {phase === "ready" && (
        <Zap className={styles.symbol} size={55} strokeWidth={1.8} aria-hidden="true" />
      )}
      <h1 className={styles.title}>{heading}</h1>
      {message && <p className={styles.message}>{message}</p>}
      {phase === "between" && (
        <span className={styles.rounds}>{times.length} / {roundsRequired}</span>
      )}
      {phase === "finished" && (
        <span className={styles.rounds}>Median {bestRun} ms · Click to restart</span>
      )}
    </div>
  );
}
