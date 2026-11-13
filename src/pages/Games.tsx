import { useState } from "react";
import { filterGames, gameFilters, type GameFilter } from "../app/games";
import { GameGrid } from "../components/GameGrid";
import { SegmentedTabs } from "../components/ui/SegmentedTabs";

const options = gameFilters.map((value) => ({ value, label: value }));

export function Games() {
  const [filter, setFilter] = useState<GameFilter>("All");

  return (
    <section className="games-page content-width">
      <div className="page-heading">
        <h1>Choose a challenge</h1>
        <p>Eight quick tests. Pick one and play.</p>
      </div>
      <SegmentedTabs label="Filter games" options={options} value={filter} onValueChange={setFilter}>
        <GameGrid items={filterGames(filter)} detailed />
      </SegmentedTabs>
    </section>
  );
}
