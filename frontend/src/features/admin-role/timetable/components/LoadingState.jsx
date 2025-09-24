import React from "react";
import { Loader2 } from "lucide-react";

/**
 * LoadingState
 * Reusable loading indicator for the timetable pages.
 *
 * Props:
 * - message?: string - message to display next to the spinner
 * - minHeight?: number | string - min height for the container (default 400)
 * - size?: number - icon size in pixels (default 24)
 * - className?: string - additional class names for the outer container
 */
export default function LoadingState({
  message = "Loading timetable data...",
  minHeight = 400,
  size = 24,
  className = "",
}) {
  return (
    <div
      className={`p-6 flex items-center justify-center ${className}`}
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-slate-700">
        <Loader2
          className="animate-spin text-slate-600"
          style={{ width: size, height: size }}
          aria-hidden="true"
        />
        <span>{message}</span>
      </div>
    </div>
  );
}
