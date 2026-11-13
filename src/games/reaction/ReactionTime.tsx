import { AlertCircle, CircleDot, Ellipsis, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { GameShell } from "../components/GameShell";
import styles from "../components/Stage.module.css";
import { oppositeColor, reactionDelay, waitingColor, type SignalColor } from "../core/random";
import { median, saveScore } from "../core/scores";

type Phase = "ready" | "waiting" | "go" | "early" | "between" | "finished";
const roundsRequired = 5;

type Session = {
  phase: Phase;
  color: SignalColor;
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

export default function ReactionTime() {
  const session = useRef<Session>({
    phase: "ready",
    color: "red",
    trials: [],
    startedAt: 0,
    timer: null,
    frame: null,
  });

  const [phase, setPhase] = useState<Phase>("ready");
  const [color, setColor] = useState<SignalColor>("red");
  const [times, setTimes] = useState<number[]>([]);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    function onVisibilityChange() {
      const current = session.current;
      if (!document.hidden || (current.phase !== "waiting" && current.phase !== "go")) return;
      stopTimer(current);
      current.phase = "ready";
      current.trials = [];
      setTimes([]);
      setPhase("ready");
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopTimer(session.current);
    };
  }, []);

  function startRound() {
    const current = session.current;
    stopTimer(current);
    if (current.phase === "finished") {
      current.trials = [];
      setTimes([]);
    }

    const nextColor = waitingColor();
    current.color = nextColor;
    current.phase = "waiting";
    setColor(nextColor);
    setPhase("waiting");

    current.timer = window.setTimeout(() => {
      current.timer = null;
      current.frame = window.requestAnimationFrame(() => {
        current.frame = null;
        if (current.phase !== "waiting") return;

        // Commit the visible color change before starting the monotonic timer.
        flushSync(() => {
          current.phase = "go";
          setPhase("go");
        });
        current.startedAt = performance.now();
      });
    }, reactionDelay());
  }

  function respond(pressedAt: number) {
    const current = session.current;

    if (current.phase === "ready" || current.phase === "early" || current.phase === "between" || current.phase === "finished") {
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

    const elapsed = Math.max(0, Math.round(pressedAt - current.startedAt));
    current.trials = [...current.trials, elapsed];
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

  const signal = phase === "waiting" ? color : phase === "go" ? oppositeColor(color) : undefined;
  const lastTime = times.at(-1);
  const bestRun = times.length === roundsRequired ? Math.round(median(times)) : null;

  const heading = phase === "ready" ? "Reaction Time"
    : phase === "waiting" ? "Wait for the change"
    : phase === "go" ? "CLICK!"
    : phase === "early" ? "Too soon!"
    : phase === "finished" ? `${bestRun} ms`
    : `${lastTime} ms`;

  const message = phase === "ready" ? "Tap or press Space to start."
    : phase === "waiting" ? "Don't click yet."
    : phase === "go" ? "React now."
    : phase === "early" ? "You clicked before the color changed."
    : phase === "finished" ? "Median reaction time across five rounds."
    : "Tap to start the next round.";

  const Icon = phase === "waiting" ? Ellipsis : phase === "go" ? CircleDot : phase === "early" ? AlertCircle : Zap;

  return (
    <GameShell
      game="reaction-time"
      revision={revision}
      howTo="Wait until the screen changes color, then react as quickly as you can. The wait is different every round, and either color can be the signal. Five valid rounds make one score."
      stage={
        <button
          type="button"
          className={`${styles.panel} ${styles.action}`}
          data-signal={signal}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            respond(performance.now());
          }}
          onKeyDown={(event) => {
            if (event.repeat || (event.key !== " " && event.key !== "Enter")) return;
            event.preventDefault();
            respond(performance.now());
          }}
        >
          <Icon className={styles.symbol} size={55} strokeWidth={1.8} aria-hidden="true" />
          <h1 className={styles.title}>{heading}</h1>
          <span className={styles.message} aria-live="polite">{message}</span>
          {phase === "waiting" && <span className={styles.secondary}>Early clicks don't count.</span>}
          {phase === "early" && <span className={styles.secondary}>Tap to retry.</span>}
          {phase === "finished" && <span className={styles.secondary}>Tap to play again.</span>}
          {(phase === "between" || phase === "waiting" || phase === "go") && (
            <span className={styles.rounds}>Round {times.length + 1} / {roundsRequired}</span>
          )}
          {phase === "finished" && <span className={styles.rounds}>{times.join(" · ")} ms</span>}
        </button>
      }
    />
  );
}
