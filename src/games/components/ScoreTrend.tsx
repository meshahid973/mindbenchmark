import { makeScoreTrend } from "../core/trend";
import styles from "./GameShell.module.css";

export function ScoreTrend({ values, unit }: { values: readonly number[]; unit: string }) {
  const { points, low, high } = makeScoreTrend(values);
  if (points.length < 2) return null;

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
            key={index}
            cx={x}
            cy={y}
            r={index === points.length - 1 ? 3 : 1.6}
            fill="currentColor"
          />
        ))}
      </svg>
      <div className={styles.chartFoot}>
        <span>Range {low}–{high} {unit}</span>
        <span>Oldest → newest</span>
      </div>
    </div>
  );
}
