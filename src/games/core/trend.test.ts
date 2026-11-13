import { describe, expect, it } from "vitest";
import { makeScoreTrend, scoreImprovement } from "./trend";

describe("score graphs", () => {
  it("shows identical scores as a flat line in the middle", () => {
    const chart = makeScoreTrend([240, 240, 240]);
    expect(chart.low).toBe(240);
    expect(chart.high).toBe(240);
    expect(chart.points.map((point) => point.y)).toEqual([26, 26, 26]);
    expect(chart.points[0].x).toBe(8);
    expect(chart.points[2].x).toBe(212);
  });

  it("keeps data order and numerical boundaries intact", () => {
    const chart = makeScoreTrend([200, 400, 300]);
    expect(chart.low).toBe(200);
    expect(chart.high).toBe(400);
    expect(chart.points[0].y).toBe(45);
    expect(chart.points[1].y).toBe(7);
    expect(chart.points[2].y).toBe(26);
  });

  it("handles empty and single-run history safely", () => {
    expect(makeScoreTrend([])).toEqual({ points: [], low: 0, high: 0 });
    expect(makeScoreTrend([10]).points).toEqual([{ x: 8, y: 26 }]);
  });

  it("compares scores in the correct direction without rounding", () => {
    expect(scoreImprovement(210, 230, true)).toBe(20);
    expect(scoreImprovement(250, 230, true)).toBe(-20);
    expect(scoreImprovement(120, 95, false)).toBe(25);
    expect(scoreImprovement(95, 120, false)).toBe(-25);
    expect(scoreImprovement(10, 10, true)).toBe(0);
  });
});
