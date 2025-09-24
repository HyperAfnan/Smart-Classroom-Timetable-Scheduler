import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import useTimetable from "./hooks/useTimetable";
import LoadingState from "./components/LoadingState";
import HeaderSection from "./components/HeaderSection";
import ControlsCard from "./components/ControlsCard";
import TimetableTable from "./components/TimetableTable";
import EmptyStateCard from "./components/EmptyStateCard";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["09:00", "10:00", "11:15", "12:15", "14:15", "15:15"];

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

  const generating = generationStatus.isPending;

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
      setTimetableData(organized);
    } catch (err) {
      console.error("Timetable generation error:", err);
      setError(`Error generating timetable: ${err.message}`);
    }
  };

  const getSlotData = (day, time) =>
    timetableData[selectedClass]?.[day]?.[time] || null;

  if (isLoading) {
    return <LoadingState />;
  }

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
              Weekly Timetable –{" "}
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
        <EmptyStateCard />
      )}
    </div>
  );
}
