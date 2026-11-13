import { BookOpen } from "lucide-react";
import { useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import stage from "../components/Stage.module.css";
import styles from "../components/ExtraGames.module.css";
import { chooseVerbalWord } from "../core/challenges";
import { saveScore } from "../core/scores";

type Round = {
  mode: "ready" | "playing" | "finished";
  word: string;
  wasSeen: boolean;
  score: number;
  lives: number;
};

const ready: Round = {
  mode: "ready",
  word: "",
  wasSeen: false,
  score: 0,
  lives: 3,
};

export default function VerbalMemory() {
  const [round, setRound] = useState<Round>(ready);
  const current = useRef<Round>(ready);
  const seen = useRef(new Set<string>());
  const [revision, setRevision] = useState(0);

  function start() {
    seen.current = new Set();
    const next = chooseVerbalWord(seen.current);
    seen.current.add(next.word);
    const state: Round = { mode: "playing", word: next.word, wasSeen: false, score: 0, lives: 3 };
    current.current = state;
    setRound(state);
  }

  function answer(wasSeen: boolean) {
    const previous = current.current;
    if (previous.mode !== "playing") return;
    const correct = wasSeen === previous.wasSeen;
    const score = previous.score + Number(correct);
    const lives = previous.lives - Number(!correct);
    if (lives <= 0) {
      const state: Round = { ...previous, mode: "finished", score, lives: 0 };
      current.current = state;
      setRound(state);
      saveScore("verbal-memory", score);
      setRevision((value) => value + 1);
      return;
    }

    const next = chooseVerbalWord(seen.current, previous.word);
    seen.current.add(next.word);
    const state: Round = { mode: "playing", word: next.word, wasSeen: next.wasSeen, score, lives };
    current.current = state;
    setRound(state);
  }

  return (
    <GameShell
      game="verbal-memory"
      revision={revision}
      howTo="Choose Seen if the word appeared earlier in this run, otherwise choose New. Three mistakes end the run."
      stage={
        <div className={stage.panel}>
          <BookOpen className={stage.symbol} size={45} strokeWidth={1.6} aria-hidden="true" />
          {round.mode === "playing" ? (
            <>
              <div className={styles.stats}>
                <span>Score {round.score}</span><span>Lives {round.lives}</span>
              </div>
              <h1 className={stage.title}>{round.word}</h1>
              <div className={styles.actions}>
                <button className={styles.choice} type="button" onClick={() => answer(true)}>Seen</button>
                <button className={styles.choice} type="button" onClick={() => answer(false)}>New</button>
              </div>
            </>
          ) : (
            <>
              <h1 className={stage.title}>
                {round.mode === "finished" ? `${round.score} points` : "Verbal Memory"}
              </h1>
              {round.mode === "finished" && <p className={stage.message}>Run complete</p>}
              <button className={stage.primary} type="button" onClick={start}>
                {round.mode === "finished" ? "Try again" : "Start"}
              </button>
            </>
          )}
        </div>
      }
    />
  );
}
