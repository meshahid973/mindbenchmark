import { useState, type ReactNode } from "react";
import styles from "./PracticePanel.module.css";

export function PracticePanel({
  enabled,
  onChange,
  label,
  description,
  lesson,
  feedback,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description: string;
  lesson?: { title: string; body: ReactNode };
  feedback?: string | null;
}) {
  const [showLesson, setShowLesson] = useState(false);

  return (
    <article className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2>Practice</h2>
          <p>{description}</p>
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" checked={enabled} onChange={(event) => onChange(event.target.checked)} />
          <span>{label}</span>
        </label>
      </div>
      {lesson && (
        <>
          <button className={styles.lessonButton} type="button"
            aria-expanded={showLesson} onClick={() => setShowLesson(!showLesson)}>
            {showLesson ? "Hide technique" : lesson.title}
          </button>
          {showLesson && <div className={styles.lesson}>{lesson.body}</div>}
        </>
      )}
      {enabled && feedback && <p className={styles.feedback} role="status">{feedback}</p>}
    </article>
  );
}
