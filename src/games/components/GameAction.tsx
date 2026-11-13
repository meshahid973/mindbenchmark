import { Button } from "@base-ui/react/button";
import type { ComponentProps } from "react";
import styles from "./Stage.module.css";

/** Shared start/retry button. Timed hit surfaces remain native controls. */
export function GameAction({
  type = "button",
  ...props
}: Omit<ComponentProps<typeof Button>, "className">) {
  return <Button {...props} type={type} className={styles.primary} />;
}
