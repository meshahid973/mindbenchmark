/** Only the primary contact / left mouse button can act on a timed target. */
export function primaryPointer(event: Pick<PointerEvent, "button" | "isPrimary">): boolean {
  return event.isPrimary && event.button === 0;
}

/** Space and Enter activate buttons; held keys must not repeat a score. */
export function activationKey(event: Pick<KeyboardEvent, "key" | "repeat">): boolean {
  return !event.repeat && (event.key === " " || event.key === "Enter");
}

/** Reject a second event that still refers to the previous displayed target. */
export function currentTargetHit(renderedHits: number, acceptedHits: number): boolean {
  return renderedHits === acceptedHits;
}
