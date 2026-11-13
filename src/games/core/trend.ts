export type TrendPoint = { x: number; y: number };
export type ScoreTrendData = {
  points: TrendPoint[];
  low: number;
  high: number;
};

export function makeScoreTrend(values: readonly number[]): ScoreTrendData {
  if (!values.length) return { points: [], low: 0, high: 0 };

  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = high - low;
  return {
    low,
    high,
    points: values.map((value, index) => ({
      x: 8 + (index * 204) / Math.max(1, values.length - 1),
      y: range === 0 ? 26 : 45 - ((value - low) / range) * 38,
    })),
  };
}
