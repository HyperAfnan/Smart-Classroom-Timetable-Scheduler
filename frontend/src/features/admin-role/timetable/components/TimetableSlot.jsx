import { Badge } from "@/components/ui/badge";

export default function TimetableSlot({ slot }) {
  if (!slot) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-left h-full dark:bg-secondary dark:bg-none dark:border-border shadow-sm hover:shadow-md transition-all">
      <div className="font-semibold text-blue-900 text-sm dark:text-foreground">
        {String(slot?.subjectName ?? "")}
      </div>
      <div className="text-xs text-blue-600 mt-1 dark:text-muted-foreground">
        {String(slot?.teacherName ?? "")}
      </div>
      <div className="text-xs text-blue-500 mt-1 dark:text-muted-foreground">
        Room: {String(slot?.roomNumber ?? "")}
      </div>
      {slot?.type ? (
        <Badge
          variant="secondary"
          className="text-xs mt-1 bg-blue-200 text-blue-800 border-blue-300 dark:bg-secondary dark:text-secondary-foreground dark:border-border px-1.5 py-0.5 leading-none"
        >
          {slot.type}
        </Badge>
      ) : null}
    </div>
  );
}
