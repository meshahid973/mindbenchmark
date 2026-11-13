import { useEffect, useRef } from "react";

/** One consistent interruption policy across active gameplay screens. */
export function useGameInterruption(onInterrupt: () => void): void {
  const latest = useRef(onInterrupt);
  useEffect(() => {
    latest.current = onInterrupt;
  }, [onInterrupt]);

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) latest.current();
    }
    function onBlur() {
      latest.current();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, []);
}
