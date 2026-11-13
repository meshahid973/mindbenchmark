import type { PointerEvent, ReactNode } from "react";
import { Link } from "react-router";

/**
 * A smaller, pointer-only adaptation of React Bits SpotlightCard by David Haz.
 * No animation loop and no listeners when the pointer is idle.
 * License: MIT + Commons Clause, see THIRD_PARTY_NOTICES.md.
 */
export function SpotlightLink({ to, children }: { to: string; children: ReactNode }) {
  const onPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <Link className="game-card" to={to} onPointerMove={onPointerMove}>
      {children}
    </Link>
  );
}
