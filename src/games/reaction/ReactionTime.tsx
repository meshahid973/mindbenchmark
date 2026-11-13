import { Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { GameShell } from "../components/GameShell";
import styles from "../components/Stage.module.css";
import { reactionDelay } from "../core/random";
import { activationKey, primaryPointer } from "../core/input";
import { mean, median, saveScore } from "../core/scores";
import {
  elapsedMilliseconds,
  inputTimestamp,
  presentedAt,
  reactionSignal,
} from "../core/timing";

type Phase = "ready" | "waiting" | "go" | "early" | "between" | "finished";
const roundsRequired = 5;

type Session = {
  phase: Phase;
  trials: number[];
  startedAt: number;
  timer: number | null;
  frame: number | null;
  paintFrame: number | null;
  armed: boolean;
};

function stopTimer(session: Session) {
  if (session.timer !== null) window.clearTimeout(session.timer);
  if (session.frame !== null) window.cancelAnimationFrame(session.frame);
  if (session.paintFrame !== null) window.cancelAnimationFrame(session.paintFrame);
  session.timer = null;
  session.frame = null;
  session.paintFrame = null;
}

export default function ReactionTime() {
  const session = useRef<Session>({
    phase: "ready",
    trials: [],
    startedAt: 0,
    timer: null,
    frame: null,
    paintFrame: null,
    armed: false,
  });

  const [phase, setPhase] = useState<Phase>("ready");
  const [times, setTimes] = useState<number[]>([]);
  const [revision, setRevision] = useState(0);

  useGameInterruption(() => {
    const current = session.current;
    if (current.phase !== "waiting" && current.phase !== "go") return;
    stopTimer(current);
    current.armed = false;
    current.phase = "ready";
    current.trials = [];
    setTimes([]);
    setPhase("ready");
  });

  useEffect(() => () => stopTimer(session.current), []);

  function startRound() {
    const current = session.current;
    stopTimer(current);
    if (current.phase === "finished") {
      current.trials = [];
      setTimes([]);
    }

    current.phase = "waiting";
    current.armed = false;
    setPhase("waiting");

    current.timer = window.setTimeout(() => {
      current.timer = null;
      current.frame = window.requestAnimationFrame(() => {
        current.frame = null;
        if (current.phase !== "waiting") return;

        flushSync(() => {
          current.phase = "go";
          setPhase("go");
        });

        // The next frame is a closer approximation of when green first appeared.
        // No arbitrary device-latency correction is subtracted.
        current.startedAt = performance.now();
        current.paintFrame = window.requestAnimationFrame((frameTime) => {
          current.paintFrame = null;
          if (current.phase === "go") {
            current.startedAt = presentedAt(current.startedAt, frameTime);
            current.armed = true;
          }
        });
      });
    }, reactionDelay());
  }

  function respond(pressedAt: number) {
    const current = session.current;

    if (
      current.phase === "ready" ||
      current.phase === "early" ||
      current.phase === "between" ||
      current.phase === "finished"
    ) {
      startRound();
      return;
    }

    if (current.phase === "waiting") {
      stopTimer(current);
      current.phase = "early";
      setPhase("early");
      return;
    }

    if (current.phase !== "go") return;
    if (!current.armed) {
      stopTimer(current);
      current.phase = "early";
      setPhase("early");
      return;
    }

    // A press queued before green must not become a zero-millisecond result.
    const elapsed = elapsedMilliseconds(current.startedAt, pressedAt);
    if (elapsed === null) {
      stopTimer(current);
      current.phase = "early";
      setPhase("early");
      return;
    }

    stopTimer(current);
    current.trials = [...current.trials, Math.round(elapsed)];
    setTimes(current.trials);

    if (current.trials.length === roundsRequired) {
      current.phase = "finished";
      saveScore("reaction-time", median(current.trials));
      setRevision((value) => value + 1);
      setPhase("finished");
    } else {
      current.phase = "between";
      setPhase("between");
    }
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
    : `${lastTime} ms`;

  const message = phase === "ready" ? "Click to start"
    : phase === "early" ? "Click to retry"
    : phase === "finished" ? "Average reaction time"
    : phase === "between" ? `Average ${average} ms · Click to continue`
    : null;

  return (
    <GameShell
      game="reaction-time"
      revision={revision}
      howTo="Click when red turns green. Five rounds."
      stage={
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
              if (!activationKey(event)) return;
              event.preventDefault();
              respond(inputTimestamp(event.timeStamp, performance.now()));
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
      }
    />
  );
}
