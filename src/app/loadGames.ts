// Share the import with React.lazy so a hover or keyboard focus warms the same chunk.
export const loadGames = () => import("../pages/Games");

export function prefetchGames() {
  void loadGames();
}
