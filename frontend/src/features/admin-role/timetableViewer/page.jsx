import { useRef, useState, useMemo, useEffect } from "react";
import {
  CombinedTimetableGrid,
  ClassTimetableGrid,
} from "./components/TimetableGrid";
import { ClassSelector, TeacherSelector } from "./components/ViewSelector.jsx";
import useTimetableViewer from "./hooks/useTimetableViewer.js";
import { normalizeToHHMM } from "./utils/time.js";
import useTeachers from "../teachers/hooks/useTeachers.js";
import FullscreenButton from "./components/FullScreenButton.jsx";

export default function TimetableViewer() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const { timeSlots, classes, timetableEntries } = useTimetableViewer();
  const tableRef = useRef(null);
  const [portalContainer, setPortalContainer] = useState(null);
  useEffect(() => {
    setPortalContainer(tableRef.current);
  }, []);

  const { breakAfterTime, breakAfterSlotIndex } = useMemo(() => {
    const slots = Array.isArray(timeSlots) ? [...timeSlots] : [];

    const seen = new Set();
    const unique = [];
    for (const s of slots) {
      const start = normalizeToHHMM(s?.startTime || s?.start_time);
      const end = normalizeToHHMM(s?.endTime || s?.end_time);
      const key = `${start}|${end}`;
      if (start && end && !seen.has(key)) {
        seen.add(key);
        unique.push({ start, end });
      }
    }
    unique.sort((a, b) => String(a.start).localeCompare(String(b.start)));

    const count = unique.length;
    if (count === 0)
      return { breakAfterTime: undefined, breakAfterSlotIndex: undefined };

    const mid = Math.max(0, Math.floor((count - 1) / 2));
    return { breakAfterTime: unique[mid].start, breakAfterSlotIndex: mid };
  }, [timeSlots]);

  const { teachers } = useTeachers();

  const selectedClassName = useMemo(() => {
    const cls = (classes ?? []).find((c) => String(c.id) === selectedClass);
    return cls ? (cls.class_name || cls.className || cls.name) : undefined;
  }, [classes, selectedClass]);

  const classTeacherOptions = useMemo(() => {
    if (!selectedClassName) return [];
    const set = new Set();
    for (const e of Array.isArray(timetableEntries) ? timetableEntries : []) {
      const entryClassName = e?.className || e?.class_name;
      if (entryClassName === selectedClassName) {
        const name = String(e?.teacherName ?? e?.teacher_name ?? e?.teacher ?? "").trim();
        if (name) set.add(name);
      }
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ value: name, label: name }));
  }, [timetableEntries, selectedClassName]);

  const activeTeacherName = useMemo(() => {
    // In class-wise view, the selector uses teacher names as values
    if (selectedClassName) {
      return selectedTeacher || undefined;
    }
    // In combined view, use full teachers list (value is id)
    const t = (teachers ?? []).find((x) => String(x.id) === selectedTeacher);
    return t?.name ? String(t.name) : undefined;
  }, [selectedClassName, selectedTeacher, teachers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background p-8 ">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            Timetable Viewer
          </h1>
        </div>
        <div
          className="border border-border rounded-2xl p-8 bg-card shadow-sm"
          ref={tableRef}
        >
          <div className="flex items-center gap-4 justify-center ">
            <ClassSelector
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
              onSelectTeacher={setSelectedTeacher}
              portalContainer={portalContainer}
            />
            <TeacherSelector
              selectedTeacher={selectedTeacher}
              onSelectTeacher={setSelectedTeacher}
              options={selectedClass ? classTeacherOptions : undefined}
              portalContainer={portalContainer}
            />
            <FullscreenButton tableRef={tableRef} />
          </div>
          {!selectedClass ? (
            <CombinedTimetableGrid
              breakAfterTime={breakAfterTime}
              breakAfterSlotIndex={breakAfterSlotIndex}
              activeTeacherName={activeTeacherName}
            />
          ) : (
            <ClassTimetableGrid
              selectedClass={selectedClass}
              breakAfterTime={breakAfterTime}
              breakAfterSlotIndex={breakAfterSlotIndex}
              activeTeacherName={activeTeacherName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
