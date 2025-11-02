import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useTimetableViewer from "../hooks/useTimetableViewer.js";
import useTeachers from "../../teachers/hooks/useTeachers.js";
import { Badge } from "@/components/ui/badge.jsx";
import { X } from "lucide-react";

export function ClassSelector({
  selectedClass,
  onSelectClass,
  onSelectTeacher,
  portalContainer,
}) {
  const { classes, isLoading } = useTimetableViewer();
  return (
    <div className="mb-4 w-full max-w-sm mx-auto justify-center flex items-center">
      {!selectedClass ? (
        <Select
          value={selectedClass}
          onValueChange={(val) => {
            onSelectClass(val);
            onSelectTeacher("");
          }}
        >
          <SelectTrigger
            aria-label="Select class"
            className="bg-background text-foreground border-border"
            disabled={isLoading}
          >
            <SelectValue placeholder="Select a class..." />
          </SelectTrigger>
          <SelectContent
            container={portalContainer}
            className="bg-popover text-popover-foreground border border-border shadow-md"
          >
            {classes?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.class_name}
                {c.semester ? `(Sem ${c.semester})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Badge
          className="p-2 text-center text-sm"
          onClick={() => onSelectClass("")}
          style={{ cursor: "pointer" }}
        >
          <span className="">
            {classes?.find((c) => String(c.id) === selectedClass)?.class_name}
          </span>
          <X className="ml-2 h-4 w-4" />
        </Badge>
      )}
    </div>
  );
}

export function TeacherSelector({
  selectedTeacher,
  onSelectTeacher,
  options,
  portalContainer,
}) {
  const { teachers, isLoading } = useTeachers();

  const items =
    Array.isArray(options) && options.length
      ? options
      : (teachers ?? []).map((t) => ({
          value: String(t.id),
          label: t.name,
        }));

  const disabled =
    Array.isArray(options) && options.length ? false : Boolean(isLoading);

  return (
    <div className="mb-4 w-full max-w-sm mx-auto justify-center flex items-center">
      {!selectedTeacher ? (
        <Select value={selectedTeacher ?? ""} onValueChange={onSelectTeacher}>
          <SelectTrigger
            aria-label="Select teacher"
            className="bg-background text-foreground border-border"
            disabled={disabled}
          >
            <SelectValue placeholder="Select a teacher..." />
          </SelectTrigger>
          <SelectContent
            container={portalContainer}
            className="bg-popover text-popover-foreground border border-border shadow-md"
          >
            {items.length ? (
              items.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label ?? String(opt.value)}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="__no_teachers__">
                No teachers available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      ) : (
        <Badge
          className="p-2 text-center text-sm"
          onClick={() => onSelectTeacher("")}
          style={{ cursor: "pointer" }}
        >
          <span className="">
            {items.find((t) => String(t.value) === selectedTeacher)?.label ||
              selectedTeacher}
          </span>
          <X className="ml-2 h-4 w-4" />
        </Badge>
      )}
    </div>
  );
}
