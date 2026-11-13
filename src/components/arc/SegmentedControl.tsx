/**
 * Simplified from the Arc UI segmented control by Elia Kuratli.
 * Uses native buttons and CSS instead of a runtime animation package.
 * See THIRD_PARTY_NOTICES.md for the MIT license.
 */
import type { KeyboardEvent } from "react";
import styles from "./SegmentedControl.module.css";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onValueChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
}: Props<T>) {
  const selected = Math.max(0, options.findIndex((option) => option.value === value));

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const { key } = event;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;

    event.preventDefault();
    let next = index;

    if (key === "Home") next = 0;
    else if (key === "End") next = options.length - 1;
    else if (key === "ArrowRight") next = (index + 1) % options.length;
    else next = (index - 1 + options.length) % options.length;

    const option = options[next];
    if (!option) return;
    onValueChange(option.value);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>("button")
      [next]?.focus({ preventScroll: true });
  };

  return (
    <fieldset className={styles.root} aria-label={label}>
      <div className={styles.track}>
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            className={styles.option}
            aria-pressed={option.value === value}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
