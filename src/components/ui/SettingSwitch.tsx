import { Switch } from "@base-ui/react/switch";
import styles from "./SettingSwitch.module.css";

export function SettingSwitch({
  checked, onCheckedChange, label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className={styles.label}>
      <Switch.Root className={styles.track} checked={checked} onCheckedChange={onCheckedChange}>
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
      <span>{label}</span>
    </label>
  );
}
