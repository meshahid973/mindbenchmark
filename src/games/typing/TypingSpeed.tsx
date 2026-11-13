import { Keyboard } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import stage from "../components/Stage.module.css";
import styles from "../components/ExtraGames.module.css";
import { correctCharacters, typingPassage, wordsPerMinute } from "../core/challenges";
import { saveScore } from "../core/scores";
import { inputTimestamp } from "../core/timing";

type Phase = "ready" | "typing" | "running" | "finished";
const durationMs = 30000;

type Result = { wpm: number; accuracy: number };

export default function TypingSpeed() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [passage, setPassage] = useState("");
  const [typed, setTyped] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [result, setResult] = useState<Result>({ wpm: 0, accuracy: 0 });
  const [revision, setRevision] = useState(0);

  const phaseRef = useRef<Phase>("ready");
  const startedAt = useRef(0);
  const typedRef = useRef("");
  const passageRef = useRef("");

  const finish = useCallback((endedAt: number) => {
    if (phaseRef.current !== "running") return;
    phaseRef.current = "finished";
    const elapsed = Math.min(durationMs, Math.max(1, endedAt - startedAt.current));
    const current = typedRef.current;
    const correct = correctCharacters(current, passageRef.current);
    const wpm = wordsPerMinute(correct, elapsed);
    const accuracy = current.length ? Math.round((100 * correct) / current.length) : 0;
    setResult({ wpm, accuracy });
    setSeconds(0);
    setPhase("finished");
    saveScore("typing-speed", wpm);
    setRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    const tick = window.setInterval(() => {
      const elapsed = performance.now() - startedAt.current;
      if (elapsed >= durationMs) {
        finish(startedAt.current + durationMs);
      } else {
        const remaining = Math.ceil((durationMs - elapsed) / 1000);
        setSeconds((previous) => previous === remaining ? previous : remaining);
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, [phase, finish]);

  useEffect(() => {
    function reset() {
      if (phaseRef.current !== "running" && phaseRef.current !== "typing") return;
      phaseRef.current = "ready";
      setPhase("ready");
      setTyped("");
      typedRef.current = "";
      setSeconds(30);
    }
    function onVisibilityChange() { if (document.hidden) reset(); }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", reset);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", reset);
    };
  }, []);

  function start() {
    const next = typingPassage();
    passageRef.current = next;
    typedRef.current = "";
    startedAt.current = 0;
    phaseRef.current = "typing";
    setPassage(next);
    setTyped("");
    setSeconds(30);
    setResult({ wpm: 0, accuracy: 0 });
    setPhase("typing");
  }

  function update(value: string, stamp: number) {
    if (phaseRef.current !== "typing" && phaseRef.current !== "running") return;
    const next = value.slice(0, passageRef.current.length);
    typedRef.current = next;
    setTyped(next);
    const time = inputTimestamp(stamp, performance.now());

    if (phaseRef.current === "typing" && next.length > 0) {
      phaseRef.current = "running";
      startedAt.current = time;
      setPhase("running");
    }
    if (phaseRef.current === "running" && next.length === passageRef.current.length) {
      finish(time);
    }
  }

  let prefixLength = 0;
  while (prefixLength < typed.length && typed[prefixLength] === passage[prefixLength]) {
    prefixLength += 1;
  }

  return (
    <GameShell
      game="typing-speed"
      revision={revision}
      howTo="Type the displayed words for 30 seconds. WPM counts correctly typed characters divided by five, per minute. Paste is disabled."
      stage={
        <div className={stage.panel}>
          <Keyboard className={stage.symbol} size={45} strokeWidth={1.6} aria-hidden="true" />
          <h1 className={stage.title}>
            {phase === "finished" ? `${result.wpm} WPM` : "Typing Speed"}
          </h1>
          {phase === "typing" || phase === "running" ? (
            <>
              <div className={styles.stats}>
                <span>{seconds}s</span>
                <span>{Math.round(100 * correctCharacters(typed, passage) / Math.max(1, typed.length))}% accuracy</span>
              </div>
              <p className={styles.typingPassage}>
                <span className={styles.typedCorrect}>{passage.slice(0, prefixLength)}</span>
                <span className={styles.cursorText}>{passage.slice(prefixLength, prefixLength + 1)}</span>
                {passage.slice(prefixLength + 1)}
              </p>
              <label className={styles.srOnly} htmlFor="typing-input">Type the words above</label>
              <textarea
                id="typing-input"
                className={styles.typingInput}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={typed}
                onChange={(event) => update(event.target.value, event.timeStamp)}
                onPaste={(event) => event.preventDefault()}
                onDrop={(event) => event.preventDefault()}
                placeholder="Start typing..."
                rows={2}
              />
            </>
          ) : (
            <>
              {phase === "finished" && (
                <p className={stage.message}>{result.accuracy}% accuracy</p>
              )}
              <button className={stage.primary} type="button" onClick={start}>
                {phase === "finished" ? "Try again" : "Start"}
              </button>
            </>
          )}
        </div>
      }
    />
  );
}
