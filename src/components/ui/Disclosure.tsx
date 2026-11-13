import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Disclosure.module.css";

export function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Collapsible.Root className={styles.root}>
      <Collapsible.Trigger className={styles.trigger}>
        <span>{title}</span>
        <ChevronDown size={15} aria-hidden="true" className={styles.chevron} />
      </Collapsible.Trigger>
      <Collapsible.Panel className={styles.panel}>
        <div className={styles.content}>{children}</div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
