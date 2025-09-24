import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

/**
 * EmptyStateCard
 * A reusable empty state card for when no class is selected.
 *
 * Props:
 * - title?: string - The headline text (default: "No Class Selected")
 * - description?: string - Supporting description text
 * - Icon?: React.ComponentType - Optional icon component (default: Calendar)
 * - className?: string - Additional classes for the Card
 * - iconClassName?: string - Classes for the icon
 * - children?: React.ReactNode - Optional actions or extra content beneath the description
 */
export default function EmptyStateCard({
  title = "No Class Selected",
  description = "Please select a class to view or generate its timetable.",
  Icon = Calendar,
  className = "",
  iconClassName = "w-16 h-16 text-slate-300 mx-auto mb-4",
  children,
}) {
  return (
    <Card className={className} role="region" aria-label="Empty state">
      <CardContent className="p-8 text-center">
        {Icon ? <Icon className={iconClassName} aria-hidden="true" /> : null}
        {title ? (
          <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
        ) : null}
        {description ? (
          <p className="text-slate-500 mb-4">{description}</p>
        ) : null}
        {children ? (
          <div className="flex justify-center">{children}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
