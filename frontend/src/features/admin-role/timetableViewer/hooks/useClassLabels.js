import { useMemo } from "react";

export default function useClassLabels(classes, timetableEntries) {
  return useMemo(() => {
    const fromClasses = (classes || [])
      .map((c) => (c?.class_name ?? c?.name ?? `Class ${c?.id ?? ""}`).trim())
      .filter(Boolean);

    if (fromClasses.length > 0) {
      return Array.from(new Set(fromClasses));
    }

    const fromEntries = new Set(
      (timetableEntries || []).map((e) => e?.class_name ?? "Unknown"),
    );

    return Array.from(fromEntries);
  }, [classes, timetableEntries]);
}
