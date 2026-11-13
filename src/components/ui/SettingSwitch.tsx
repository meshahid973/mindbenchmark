import { Switch } from "@base-ui/react/switch";
import { useId } from "react";
import styles from "./SettingSwitch.module.css";

export function SettingSwitch({
  checked, onCheckedChange, label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div className={styles.label}>
      <Switch.Root id={id} nativeButton render={<button type="button" />}
        className={styles.track} checked={checked} onCheckedChange={onCheckedChange}>
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
