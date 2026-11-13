import type { ReactNode } from "react";
import { Disclosure } from "../../components/ui/Disclosure";
import { SettingSwitch } from "../../components/ui/SettingSwitch";
import styles from "./PracticePanel.module.css";

export function PracticePanel({
  enabled, onChange, label, description, lesson, feedback,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description: string;
  lesson?: { title: string; body: ReactNode };
  feedback?: string | null;
}) {
  return (
    <article className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.summary}>
          <h2>Practice</h2>
          <p>{description}</p>
        </div>
        <SettingSwitch checked={enabled} onCheckedChange={onChange} label={label} />
      </div>
      {lesson && <Disclosure title={lesson.title}>{lesson.body}</Disclosure>}
      {enabled && feedback && <p className={styles.feedback} role="status">{feedback}</p>}
    </article>
  );
}
