/**
 * Adapted from Arc UI Segmented Control by Elia Kuratli (MIT).
 * https://github.com/kuratlielia/arc-library
 * License notice in THIRD_PARTY_NOTICES.md.
 */
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import styles from "./SegmentedControl.module.css";

type Segment = { value: string; label: string };
type SegmentedControlProps = {
  options: readonly Segment[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
};

export function SegmentedControl({ options, value, onValueChange, label }: SegmentedControlProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;

    const updateEdges = () => {
      const rest = node.scrollWidth - node.clientWidth - node.scrollLeft;
      node.toggleAttribute("data-fade-start", node.scrollLeft > 1);
      node.toggleAttribute("data-fade-end", rest > 1);
    };

    updateEdges();
    node.addEventListener("scroll", updateEdges, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateEdges);
    observer?.observe(node);
    return () => {
      node.removeEventListener("scroll", updateEdges);
      observer?.disconnect();
    };
  }, [options.length]);

  useEffect(() => {
    const node = track.current;
    const button = node?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!node || !button || node.scrollWidth <= node.clientWidth) {
      first.current = false;
      return;
    }
    const room = 20;
    const start = button.offsetLeft - room;
    const end = button.offsetLeft + button.offsetWidth + room - node.clientWidth;
    const left = node.scrollLeft > start ? start : node.scrollLeft < end ? end : node.scrollLeft;
    if (left !== node.scrollLeft) {
      node.scrollTo({ left: Math.max(0, left), behavior: first.current || reduced ? "instant" : "smooth" });
    }
    first.current = false;
  }, [value, reduced]);

  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    const target = event.key === "ArrowRight" || event.key === "ArrowDown" ? (selectedIndex + 1) % options.length
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (selectedIndex + options.length - 1) % options.length
      : event.key === "Home" ? 0 : event.key === "End" ? last : -1;

    if (target < 0 || !options[target]) return;
    event.preventDefault();
    onValueChange(options[target].value);
    track.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(options[target].value)}"]`)?.focus({ preventScroll: true });
  };

  return (
    <div className={styles.root} role="group" aria-label={label}>
      <LayoutGroup id={id}>
        <motion.div ref={track} layoutScroll className={styles.track}>
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              className={styles.button}
              data-value={option.value}
              aria-pressed={value === option.value}
              tabIndex={index === selectedIndex ? 0 : -1}
              onClick={() => onValueChange(option.value)}
              onKeyDown={onKeyDown}
            >
              {value === option.value && (
                <motion.span
                  className={styles.selection}
                  layoutId="selection"
                  layoutDependency={value}
                  transition={reduced ? { duration: 0 } : { type: "spring", visualDuration: 0.42, bounce: 0 }}
                  aria-hidden="true"
                />
              )}
              <span className={styles.label}>{option.label}</span>
            </button>
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
