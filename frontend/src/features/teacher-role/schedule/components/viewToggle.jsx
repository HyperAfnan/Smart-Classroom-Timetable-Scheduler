import React from "react";
// PropTypes import removed (no external dependency); rely on JSDoc or future TypeScript for type safety.

/**
 * ViewToggle Component
 *
 * Segmented control to switch between "week" and "day" schedule views.
 *
 * Props:
 *  - value: "week" | "day"
 *  - onChange: (next: string) => void
 *  - options?: array of { key: string, label: string } (default: week/day)
 *  - className?: string (container class override / extension)
 *  - disabled?: boolean
 *
 * Accessibility:
 *  - Uses role="tablist" / role="tab" semantics for better screen reader support
 *  - ArrowLeft / ArrowRight keyboard navigation
 *
 * Future Enhancements:
 *  - Add more granular views (e.g. "month")
 *  - Convert to generic segmented control and reuse across app
 *  - Support icons (prop renderers)
 */
const DEFAULT_OPTIONS = [
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
];

const ViewToggle = ({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  className = "",
  disabled = false,
}) => {
  const handleKeyDown = (e, idx) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (idx + dir + options.length) % options.length;
      const next = options[nextIndex];
      if (next) onChange(next.key);
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const current = options[idx];
      if (current) onChange(current.key);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Schedule view mode"
      className={`flex bg-gray-100 rounded-lg p-1 select-none ${className}`}
    >
      {options.map((opt, idx) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.key)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={[
              "relative px-4 py-2 rounded-md text-sm font-medium transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
              active
                ? "bg-white text-card-foreground shadow-sm"
                : " text-muted-foreground hover:text-card-foreground",
              disabled
                ? "opacity-50 cursor-not-allowed hover: text-muted-foreground"
                : "",
            ].join(" ")}
          >
            {opt.label}
            {active && (
              <span className="absolute inset-0 rounded-md ring-0 pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
};

/**
 * PropTypes removed to avoid adding dependency.
 * Expected props:
 *  - value: "week" | "day"
 *  - onChange: (next: string) => void
 *  - options?: Array<{ key: string, label: React.ReactNode }>
 *  - className?: string
 *  - disabled?: boolean
 */

export default ViewToggle;
