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
    includeTimeSlot: false,
    queryOptions: { enabled: !!selectedClass },
  });
   

  const generating = generationStatus.isPending || insertEntries.isPending;

  const normalizeToHHMM = (val) => {
    if (!val) return val;
    const str = String(val);
    return str.length >= 5 && str[2] === ":" ? str.slice(0, 5) : str;
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
      const rows = mapOrganizedToRows({ organized, days, timeSlots });
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
    // Prefer data from DB: entries joined with time_slots
    const dayIndex = days.indexOf(day);
    if (dayIndex === -1) return null;
    const hhmm = normalizeToHHMM(time);

    const match = (entries || []).find(
      (e) =>
        e?.time_slots?.day === dayIndex &&
        normalizeToHHMM(e?.time_slots?.start_time) === hhmm &&
        String(e?.class_id) === String(selectedClass),
    );
    return match || null;
  };

  if (isLoading)
    return (
      <div
        className="p-6 flex items-center justify-center"
        style={{ minHeight: 400 }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2
            className="animate-spin text-slate-600"
            style={{ width: 24, height: 24 }}
            aria-hidden="true"
          />
          <span>Loading timetable data...</span>
        </div>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
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
          (isError && loadError ? String(loadError?.message || loadError) : "")
        }
      />

      {/* Timetable Display */}
      {selectedClass ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Timetable –
              {classes.find((c) => String(c.id) === selectedClass)?.name}
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
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card role="region" aria-label="Empty state">
          <CardContent className="p-8 text-center">
            <Calendar
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              aria-hidden="true"
            />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No Class Selected
            </h3>
            <p className="text-slate-500 mb-4">
              Please select a class to view or generate its timetable.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
