import { useState } from "react";
import { filterGames, gameFilters, type GameFilter } from "../app/games";
import { GameGrid } from "../components/GameGrid";
import { SegmentedControl } from "../components/arc/SegmentedControl";

const options = gameFilters.map((value) => ({ value, label: value }));

export function Games() {
  const [filter, setFilter] = useState<GameFilter>("All");

  return (
    <section className="games-page content-width">
      <div className="page-heading">
        <h1>Games</h1>
        <p>Choose a challenge.</p>
      </div>
      <div className="filter-row">
        <SegmentedControl
          label="Filter games"
          options={options}
          value={filter}
          onValueChange={setFilter}
        />
      </div>
      <GameGrid items={filterGames(filter)} detailed />
    </section>
  );
}
