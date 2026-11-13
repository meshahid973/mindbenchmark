import { Tabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";
import styles from "./SegmentedTabs.module.css";

type Option<T extends string> = { value: T; label: string };

export function SegmentedTabs<T extends string>({
  label, options, value, onValueChange, children,
}: {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onValueChange: (value: T) => void;
  children: ReactNode;
}) {
  return (
    <Tabs.Root value={value} onValueChange={(next) => onValueChange(next as T)}
      className={styles.root}>
      <Tabs.List aria-label={label} className={styles.list}>
        {options.map((option) => (
          <Tabs.Tab key={option.value} className={styles.tab} value={option.value}>
            {option.label}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator className={styles.indicator} />
      </Tabs.List>
      <Tabs.Panel value={value} className={styles.panel}>
        {children}
      </Tabs.Panel>
    </Tabs.Root>
  );
}
