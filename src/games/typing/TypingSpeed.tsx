import { Keyboard } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameAction } from "../components/GameAction";
import { GameShell } from "../components/GameShell";
import stage from "../components/Stage.module.css";
import styles from "../components/ExtraGames.module.css";
import { correctCharacters, typingPassage, wordsPerMinute } from "../core/challenges";
import { saveScore } from "../core/scores";
import { inputTimestamp } from "../core/timing";
import { recordTypingErrors, typingMicroDrill, weakestPairs, type TypingErrors } from "../core/typingDrills";
import { useGameInterruption } from "../core/useGameInterruption";

type Phase = "ready" | "typing" | "running" | "finished";
const durationMs = 30000;

type Result = { wpm: number; accuracy: number };

export default function TypingSpeed() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [passage, setPassage] = useState("");
  const [typed, setTyped] = useState("");
  const [correct, setCorrect] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [result, setResult] = useState<Result>({ wpm: 0, accuracy: 0 });
  const [revision, setRevision] = useState(0);
  const [drilling, setDrilling] = useState(false);
  const [weakPairs, setWeakPairs] = useState<string[]>([]);

  const phaseRef = useRef<Phase>("ready");
  const startedAt = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typedRef = useRef("");
  const correctRef = useRef(0);
  const passageRef = useRef("");
  const errors = useRef<TypingErrors>({});
  const drillRef = useRef(false);
  const limitRef = useRef(durationMs);

  const finish = useCallback((endedAt: number) => {
    if (phaseRef.current !== "running") return;
    phaseRef.current = "finished";
    const elapsed = Math.min(limitRef.current, Math.max(1, endedAt - startedAt.current));
    const current = typedRef.current;
    const correctCount = correctRef.current;
    const wpm = wordsPerMinute(correctCount, elapsed);
    const accuracy = current.length ? Math.round((100 * correctCount) / current.length) : 0;
    setResult({ wpm, accuracy });
    setWeakPairs(weakestPairs(errors.current));
    setSeconds(0);
    setPhase("finished");
    if (!drillRef.current) {
      saveScore("typing-speed", wpm);
      setRevision((value) => value + 1);
    }
  }, []);

  useEffect(() => {
    if (phase === "typing") inputRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== "running") return;
    const tick = window.setInterval(() => {
      const elapsed = performance.now() - startedAt.current;
      if (elapsed >= limitRef.current) {
        finish(startedAt.current + limitRef.current);
      } else {
        const remaining = Math.ceil((limitRef.current - elapsed) / 1000);
        setSeconds((previous) => previous === remaining ? previous : remaining);
      }
    }, 250);
    return () => window.clearInterval(tick);
  }, [phase, finish]);

  useGameInterruption(() => {
    if (phaseRef.current !== "running" && phaseRef.current !== "typing") return;
    phaseRef.current = "ready";
    setPhase("ready");
    setTyped("");
    typedRef.current = "";
    correctRef.current = 0;
    setCorrect(0);
    setSeconds(30);
  });

  function start(kind: "benchmark" | "drill" = "benchmark") {
    const pairs = weakestPairs(errors.current);
    const next = kind === "drill" ? typingMicroDrill(pairs) : typingPassage();
    if (!next) return;
    drillRef.current = kind === "drill";
    setDrilling(kind === "drill");
    limitRef.current = kind === "drill" ? 20000 : durationMs;
    errors.current = {};
    passageRef.current = next;
    typedRef.current = "";
    correctRef.current = 0;
    setCorrect(0);
    startedAt.current = 0;
    phaseRef.current = "typing";
    setPassage(next);
    setTyped("");
    setSeconds(kind === "drill" ? 20 : 30);
    setResult({ wpm: 0, accuracy: 0 });
    setPhase("typing");
  }

  function update(value: string, stamp: number) {
    if (phaseRef.current !== "typing" && phaseRef.current !== "running") return;
    const time = inputTimestamp(stamp, performance.now());
    if (phaseRef.current === "running" && time - startedAt.current >= limitRef.current) {
      finish(startedAt.current + limitRef.current);
      return;
    }
    const next = value.slice(0, passageRef.current.length);
    const previous = typedRef.current;
    errors.current = recordTypingErrors(errors.current, previous, next, passageRef.current);
    const correctCount = next.length === previous.length + 1 &&
      next.slice(0, -1) === previous
      ? correctRef.current + Number(next.at(-1) === passageRef.current[next.length - 1])
      : correctCharacters(next, passageRef.current);
    correctRef.current = correctCount;
    typedRef.current = next;
    setTyped(next);
    setCorrect(correctCount);

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
      progress={{ label: `${seconds}s remaining` }}
      howTo="Type the displayed words for 30 seconds. WPM counts correctly typed characters divided by five, per minute. Paste is disabled."
      stage={
        <div className={stage.panel}>
          <Keyboard className={stage.symbol} size={45} strokeWidth={1.6} aria-hidden="true" />
          <h1 className={stage.title}>
            {phase === "finished" ? `${result.wpm} WPM` : drilling ? "Typing drill" : "Typing Speed"}
          </h1>
          {phase === "typing" || phase === "running" ? (
            <>
              <div className={styles.stats}>
                <span>{seconds}s</span>
                <span>{Math.round(100 * correct / Math.max(1, typed.length))}% accuracy</span>
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
                ref={inputRef}
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
                <p className={stage.message}>{result.accuracy}% accuracy{drilling ? " · unscored" : ""}</p>
              )}
              <GameAction onClick={() => start("benchmark")}>
                {phase === "finished" ? "Try again" : "Start"}
              </GameAction>
              {phase === "finished" && weakPairs.length > 0 && !drilling && (
                <button type="button" className={styles.choice} onClick={() => start("drill")}>
                  Practice weak pairs · {weakPairs.join(", ")}
                </button>
              )}
            </>
          )}
        </div>
      }
    />
  );
}
