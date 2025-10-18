import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import useTimetable from "./hooks/useTimetable";
import HeaderSection from "./components/HeaderSection";
import ControlsCard from "./components/ControlsCard";
import TimetableTable from "./components/TimetableTable";
import { days, times } from "./constants";
import { useTimetableEntriesByClass } from "./hooks/useTimetableEntries";
import useTimetableEntriesMutations from "./hooks/useTimetableEntriesMutations";

export default function Timetable() {
  const [selectedClass, setSelectedClass] = useState("");
  const [timetableData, setTimetableData] = useState({});
  const [error, setError] = useState("");

  const {
    data: { classes, teachers, subjects, rooms, timeSlots },
    isLoading,
    isError,
    error: loadError,
    assemblePayload,

    getTeacherName,
    getSubjectName,
    getRoomNumber,
    generateAsync,
    generationStatus,
  } = useTimetable({ days, times });

  const { mapOrganizedToRows, insertEntriesAsync, insertEntries } =
    useTimetableEntriesMutations();

  const {
    entries,
    isLoading: entriesLoading,
    refetch: refetchEntries,
  } = useTimetableEntriesByClass(selectedClass, {
    includeTimeSlot: true,
    queryOptions: { enabled: !!selectedClass },
  });

  const generating = generationStatus.isPending || insertEntries.isPending;

  const normalizeToHHMM = (val) => {
    if (!val) return val;
    let str = String(val);
    if (str.length >= 5 && str[2] === ":") str = str.slice(0, 5);
    if (/^\d:\d{2}$/.test(str)) return "0" + str;
    return str;
  };

  const generateTimetable = async () => {
    if (!selectedClass) {
      setError("Please select a class first");
      return;
    }
    setError("");
    try {
      const payload = assemblePayload({
        classes,
        teachers,
        subjects,
        rooms,
        timeSlots,
      });
      const { organized } = await generateAsync({ payload });

      // Map organized grid to DB rows and persist
      const organizedKeys = Object.keys(organized || {});
      const dbIdSet = new Set((classes || []).map((c) => String(c.id)));
      const looksIndexed =
        organizedKeys.length > 0 &&
        organizedKeys.every((k) => /^\d+$/.test(k)) &&
        !organizedKeys.some((k) => dbIdSet.has(k));
      const classKeyToId = looksIndexed
        ? Object.fromEntries(
            organizedKeys
              .map((k) => [k, classes[Number(k)]?.id])
              .filter(([, v]) => v != null),
          )
        : undefined;

      const rows = mapOrganizedToRows({
        organized,
        days,
        timeSlots,
        classKeyToId,
      });
      await insertEntriesAsync({ rows, mode: "upsert" });

      // Optionally update local state and refetch from DB
      setTimetableData(organized);
      await refetchEntries();
    } catch (err) {
      console.error("Timetable generation error:", err);
      setError(`Error generating timetable: ${err.message}`);
    }
  };

  const getSlotData = (day, time) => {
    // Prefer locally generated timetable first, then fall back to DB entries
    const dayIndex = days.indexOf(day);
    if (dayIndex === -1) return null;
    const hhmm = normalizeToHHMM(time);

    // 1) Try local organized data
    const selectedId = String(selectedClass);
    let classKey = selectedId;

    if (
      !timetableData ||
      typeof timetableData !== "object" ||
      !timetableData[selectedId]
    ) {
      const keys = Object.keys(timetableData || {});
      for (const k of keys) {
        if (/^\d+$/.test(k)) {
          const idx = Number(k);
          if (
            classes &&
            classes[idx] &&
            String(classes[idx].id) === selectedId
          ) {
            classKey = k;
            break;
          }
        }
      }
    }

    const dayObj = timetableData?.[classKey]?.[day];
    if (dayObj) {
      const localSlot = dayObj[hhmm] || dayObj[time];
      if (localSlot) return localSlot;
    }

    // 2) Fall back to DB entries (joined with time_slots)
    const match = (entries || []).find((e) => {
      const dbDay = e?.time_slots?.day;
      const dayMatches = dbDay === dayIndex || dbDay === dayIndex + 1;
      return (
        dayMatches &&
        normalizeToHHMM(e?.time_slots?.start_time) === hhmm &&
        String(e?.class_id) === String(selectedClass)
      );
    });
    return match || null;
  };

  if (isLoading)
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background flex items-center justify-center"
        style={{ minHeight: 400 }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex items-center gap-2 text-foreground">
          <Loader2
            className="animate-spin text-muted-foreground"
            style={{ width: 24, height: 24 }}
            aria-hidden="true"
          />
          <span>Loading timetable data...</span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-6">
        <HeaderSection
          title="Timetable Generator"
          subtitle="Generate and view individual class schedules"
        />

        {/* Controls */}
        <ControlsCard
          classes={classes}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          onGenerate={generateTimetable}
          generating={generating}
          errorMessage={
            error ||
            (isError && loadError
              ? String(loadError?.message || loadError)
              : "")
          }
        />

        {/* Timetable Display */}
        {selectedClass ? (
          <Card className="bg-card text-card-foreground border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Weekly Timetable –
                {
                  classes.find((c) => String(c.id) === selectedClass)
                    ?.class_name
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <TimetableTable
                  days={days}
                  times={times}
                  getSlotData={getSlotData}
                  getSubjectName={getSubjectName}
                  getTeacherName={getTeacherName}
                  getRoomNumber={getRoomNumber}
                  renderSlot={({ slot }) => (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-left">
                      <div className="font-semibold text-blue-900 text-sm">
                        {slot.subject_name || getSubjectName(slot.subject_id)}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {slot.teacher_name || getTeacherName(slot.teacher_id)}
                      </div>
                      <div className="text-xs text-blue-500 mt-1">
                        {slot.room_name ||
                          (getRoomNumber
                            ? getRoomNumber(slot.room_id)
                            : `Room: ${String(slot.room_id ?? "")}`)}
                      </div>
                      {slot.type ? (
                        <span className="inline-flex items-center rounded border border-blue-300 bg-blue-200 px-2 py-0.5 text-xs text-blue-800 mt-1">
                          {slot.type}
                        </span>
                      ) : null}
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card
            role="region"
            aria-label="Empty state"
            className="bg-card text-card-foreground border border-border shadow-sm"
          >
            <CardContent className="p-8 text-center">
              <Calendar
                className="w-16 h-16 text-muted-foreground mx-auto mb-4"
                aria-hidden="true"
              />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Class Selected
              </h3>
              <p className="text-muted-foreground mb-4">
                Please select a class to view or generate its timetable.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
