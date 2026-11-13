import { Tooltip } from "@base-ui/react/tooltip";
import { CircleHelp } from "lucide-react";
import styles from "./InfoTooltip.module.css";

export function InfoTooltip({ label }: { label: string }) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger type="button" className={styles.trigger} aria-label={label}>
          <CircleHelp size={14} aria-hidden="true" />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup className={styles.popup}>{label}</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
