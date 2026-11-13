import { useState } from "react";
import { filterGames, gameFilters, type GameFilter } from "../app/games";
import { SegmentedControl } from "../components/arc/SegmentedControl";
import { GameGrid } from "../components/GameGrid";

export function Games() {
  const [filter, setFilter] = useState<GameFilter>("All");

  return (
    <section className="games-page content-width">
      <div className="page-heading">
        <h1>Games</h1>
        <p>Pick a challenge.</p>
      </div>
      <div className="filter-row">
        <SegmentedControl
          label="Filter games"
          options={gameFilters.map((value) => ({ value, label: value }))}
          value={filter}
          onValueChange={(value) => setFilter(value as GameFilter)}
        />
      </div>
      <GameGrid items={filterGames(filter)} />
    </section>
  );
}
