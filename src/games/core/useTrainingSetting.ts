import { useState } from "react";

const prefix = "mindbenchmark:training:v1:";

function readSetting(name: string): boolean {
  try {
    return localStorage.getItem(prefix + name) === "true";
  } catch {
    return false;
  }
}

/** Preferences are local, optional and off until explicitly enabled. */
export function useTrainingSetting(name: string): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState(() => readSetting(name));
  function update(next: boolean) {
    setEnabled(next);
    try {
      localStorage.setItem(prefix + name, String(next));
    } catch {
      // The setting still works in memory when storage is unavailable.
    }
  }
  return [enabled, update];
}
