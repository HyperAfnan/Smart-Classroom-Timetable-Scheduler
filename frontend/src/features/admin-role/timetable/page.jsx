import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
// import useGenerateAndPersistTimetable from "./hooks/useGenerateAndPersistTimetable";
import HeaderSection from "./components/HeaderSection";
import ControlsCard from "./components/ControlsCard";
import TimetableTable from "./components/TimetableTable";
import { days, times } from "./constants";
import useClasses from "../classes/hooks/useClasses.js";
import useTimetableMutation from "./hooks/useTimetableMutation.js";
import { useSelector } from "react-redux";
import useTimetable from "./hooks/useTimetable.js";
// import { useTimetableEntriesByClass } from "./hooks/useTimetableEntries";

export default function Timetable() {
  const [selectedClass, setSelectedClass] = useState("");
  const [timetableData, setTimetableData] = useState({});
  const { createTimetableEntryAsync, isCreateError, creating, createError } =
    useTimetableMutation(
      useSelector((state) => state.auth.user?.department_id),
    );
  const { getSubjectName, getTeacherName, getRoomNumber } = useTimetable();
  const [error, setError] = useState("");
  const { classes, isLoading } = useClasses({
    queryOptions: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  });

  // const {
  //   data: { classes },
  //   isLoading,
  //   isError,
  //   error: loadError,
  //   generating,
  //   lastOrganized,
  //   generateAndPersistAsync,
  //   getTeacherName,
  //   getSubjectName,
  //   getRoomNumber,
  // } = useGenerateAndPersistTimetable({ days, times });

  // const {
  //   entries,
  //   refetch: refetchEntries,
  // } = useTimetableEntriesByClass(selectedClass, {
  //   includeTimeSlot: true,
  //   queryOptions: { enabled: !!selectedClass },
  // });
  //

  const normalizeToHHMM = (val) => {
    if (!val) return val;
    let str = String(val);
    if (str.length >= 5 && str[2] === ":") str = str.slice(0, 5);
    if (/^\d:\d{2}$/.test(str)) return "0" + str;
    return str;
  };

  // NOTE:: called on button click
  const generateTimetable = async () => {
    if (!selectedClass) {
      setError("Please select a class first");
      return;
    }
    setError("");
    try {
      const organized = await createTimetableEntryAsync();
      console.log(organized);
      setTimetableData(organized || {});
    } catch (err) {
      console.error("Timetable generation error:", err);
      setError(`Error generating timetable: ${err.message}`);
    }
  };

  const getSlotData = (day, time) => {
    const dayIndex = days.indexOf(day);
    if (dayIndex === -1) return null;
    const hhmm = normalizeToHHMM(time);

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

    const match = [].find((e) => {
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
      <div className="max-w-8xl mx-auto px-16 m-0 py-8 md:py-12 space-y-6">
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
          generating={creating}
          errorMessage={
            error ||
            (isCreateError && createError
              ? String(createError?.message || createError)
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
                  breakAfterTime="12:00"
                  breakLabel="Break"
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
