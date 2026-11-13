import { useState, type PointerEvent } from "react";
import { makeScoreTrend } from "../core/trend";
import styles from "./GameShell.module.css";

export function ScoreTrend({ values, unit }: { values: readonly number[]; unit: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const { points, low, high } = makeScoreTrend(values);
  if (points.length < 2) return null;

  const chosen = selected ?? values.length - 1;

  function pointFromPointer(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;
    const fraction = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    setSelected(Math.round(Math.max(0, Math.min(1, (fraction * 220 - 8) / 204)) * (values.length - 1)));
  }

  return (
    <div className={styles.chart}>
      <div className={styles.chartHeading}>
        <span>Recent scores</span>
        <span>{values.length} runs</span>
      </div>
      <svg
        className={styles.trend}
        viewBox="0 0 220 52"
        role="img"
        aria-label={`Scores from oldest to newest: ${values.join(", ")} ${unit}`}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse") pointFromPointer(event);
        }}
        onPointerDown={pointFromPointer}
      >
        <line x1="8" y1="45" x2="212" y2="45" stroke="currentColor" strokeOpacity=".15" />
        <line x1="8" y1="26" x2="212" y2="26" stroke="currentColor" strokeOpacity=".09" />
        <line x1="8" y1="7" x2="212" y2="7" stroke="currentColor" strokeOpacity=".09" />
        <polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map(({ x, y }, index) => (
          <circle
            key={x}
            cx={x}
            cy={y}
            r={index === chosen ? 3.3 : 1.7}
            fill="currentColor"
          >
            <title>{`Run ${index + 1}: ${values[index]} ${unit}`}</title>
          </circle>
        ))}
      </svg>
      <div className={styles.chartInspect}>
        <label htmlFor="score-inspector">Run {chosen + 1}: {values[chosen]} {unit}</label>
        <input
          id="score-inspector"
          aria-label="Inspect past scores"
          type="range"
          min={0}
          max={values.length - 1}
          step={1}
          value={chosen}
          onChange={(event) => setSelected(Number(event.target.value))}
        />
      </div>
      <div className={styles.chartFoot}>
        <span>Range {low}–{high} {unit}</span>
        <span>Oldest → newest</span>
      </div>
    </div>
  );
}
