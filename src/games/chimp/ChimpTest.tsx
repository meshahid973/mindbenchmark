import { Puzzle } from "lucide-react";
import { useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import stage from "../components/Stage.module.css";
import styles from "../components/ExtraGames.module.css";
import { chimpBoard } from "../core/challenges";
import { saveScore } from "../core/scores";
import { useGameInterruption } from "../core/useGameInterruption";

type Phase = "ready" | "playing" | "finished";
const maximum = 18;
const cells = Array.from({ length: 36 }, (_, value) => value);

export default function ChimpTest() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(4);
  const [lives, setLives] = useState(3);
  const [board, setBoard] = useState<number[]>([]);
  const [hidden, setHidden] = useState(false);
  const [cleared, setCleared] = useState<number[]>([]);
  const [bestRun, setBestRun] = useState(0);
  const [revision, setRevision] = useState(0);
  const modeRef = useRef<Phase>("ready");
  const nextRef = useRef(1);
  const completed = useRef(0);

  useGameInterruption(() => {
    if (modeRef.current !== "playing") return;
    modeRef.current = "ready";
    completed.current = 0;
    nextRef.current = 1;
    setPhase("ready");
    setBoard([]);
    setHidden(false);
    setCleared([]);
    setLevel(4);
    setLives(3);
  });

  function begin(nextLevel = 4, remainingLives = 3) {
    modeRef.current = "playing";
    nextRef.current = 1;
    setPhase("playing");
    setBoard(chimpBoard(nextLevel));
    setLevel(nextLevel);
    setLives(remainingLives);
    setHidden(false);
    setCleared([]);
  }

  function finish() {
    modeRef.current = "finished";
    setPhase("finished");
    setBestRun(completed.current);
    saveScore("chimp-test", completed.current);
    setRevision((value) => value + 1);
  }

  function clickCell(index: number) {
    if (modeRef.current !== "playing") return;
    const expected = nextRef.current;
    if (board[index] === 0) return;
    if (board[index] !== expected) {
      const remaining = lives - 1;
      if (remaining === 0) {
        finish();
      } else {
        begin(level, remaining);
      }
      return;
    }

    nextRef.current += 1;
    setCleared((previous) => [...previous, index]);
    setHidden(true);

    if (expected === level) {
      completed.current = level;
      if (level >= maximum) {
        finish();
      } else {
        begin(level + 1, lives);
      }
    }
  }

  return (
    <GameShell
      game="chimp-test"
      revision={revision}
      howTo="Click the numbers in order. They disappear after your first click. Three mistakes end the run."
      stage={
        <div className={stage.panel}>
          <Puzzle className={stage.symbol} size={45} strokeWidth={1.6} aria-hidden="true" />
          {phase === "playing" ? (
            <>
              <div className={styles.stats}><span>{level} numbers</span><span>Lives {lives}</span></div>
              <h1 className={styles.shortTitle}>Chimp Test</h1>
              <fieldset className={styles.chimpGrid} aria-label="Number memory grid">
                {cells.map((cell) => (
                  <button
                    key={cell}
                    type="button"
                    className={styles.chimpTile}
                    data-visible={!hidden && board[cell] > 0}
                    data-empty={board[cell] === 0}
                    data-cleared={cleared.includes(cell)}
                    aria-label={!hidden && board[cell] > 0 ? `Number ${board[cell]}` : `Cell ${cell + 1}`}
                    disabled={board[cell] === 0 || cleared.includes(cell)}
                    onClick={() => clickCell(cell)}
                  >
                    {!hidden && board[cell] > 0 ? board[cell] : ""}
                  </button>
                ))}
              </fieldset>
            </>
          ) : (
            <>
              <h1 className={stage.title}>
                {phase === "finished" ? `${bestRun} numbers` : "Chimp Test"}
              </h1>
              <button className={stage.primary} type="button" onClick={() => {
                completed.current = 0;
                begin();
              }}>
                {phase === "finished" ? "Try again" : "Start"}
              </button>
            </>
          )}
        </div>
      }
    />
  );
}
