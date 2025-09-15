import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LayoutGrid,
  Clock,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/config/supabase.js";
import { Badge } from "@/components/ui/badge";

const timeGrid = ["09:00", "10:00", "11:15", "12:15", "14:15", "15:15"];
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function MasterTimetable() {
  const [allData, setAllData] = useState({
    classes: [],
    teachers: [],
    subjects: [],
    rooms: [],
    timeSlots: [],
  });
  const [timetableByClass, setTimetableByClass] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fitnessScore, setFitnessScore] = useState(null);
  const [generationCount, setGenerationCount] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const organizeTimetableData = useCallback((data) => {
    if (data.student_timetables) {
      const organized = {};

      data.student_timetables.forEach((classData) => {
        const classId = classData.class_id.toString();
        organized[classId] = {};

        // Process each day's timetable
        classData.timetable.forEach((daySchedule, dayIndex) => {
          const day = days[dayIndex];
          organized[classId][day] = {};

          // Process each slot in the day
          daySchedule.forEach((slot) => {
            if (!slot.is_free) {
              organized[classId][day][timeGrid[slot.slot]] = {
                subject_id: slot.subject_id,
                teacher_id: slot.teacher_id,
                room_id: slot.room_id,
                class_id: slot.class_id,
                day: day,
                start_time: timeGrid[slot.slot],
                subject_name: slot.subject_name,
                teacher_name: slot.teacher_name,
                room_name: slot.room_name,
                type: "Lecture", // Default type
              };
            }
          });
        });
      });

      setTimetableByClass(organized);
    } else if (data.combined_view) {
      // Legacy format handling
      const organized = {};
      data.combined_view.forEach((slot) => {
        if (!organized[slot.class_id]) {
          organized[slot.class_id] = {};
        }
        if (!organized[slot.class_id][slot.day]) {
          organized[slot.class_id][slot.day] = {};
        }
        organized[slot.class_id][slot.day][slot.start_time] = slot;
      });
      setTimetableByClass(organized);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: classesData } = await supabase.from("classes").select("*");
      const { data: teachersData } = await supabase
        .from("teacher_profile")
        .select("*");
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*");
      const { data: roomsData } = await supabase.from("room").select("*");

      setAllData({
        classes: classesData || [],
        teachers: teachersData || [],
        subjects: subjectsData || [],
        rooms: roomsData || [],
        timeSlots: [],
      });

      // Create payload for the API request
      const teacher_names = teachersData.map((t) => t.name);

      const subject_hours = {};
      subjectsData.forEach((s, idx) => {
        subject_hours[idx] = s.hours_per_week;
      });

      const subject_teachers = {};
      subjectsData.forEach((s, idx) => {
        // This would normally use a mapping, just using the first teacher for example
        subject_teachers[idx] = [0]; // Default to first teacher
      });

      const payload = {
        num_classes: classesData.length,
        days: days.length,
        slots_per_day: timeGrid.length,
        total_rooms: roomsData.length,
        total_teachers: teachersData.length,
        subject_hours,
        subject_teachers,
        subject_names: subjectsData.map((s) => s.subject_name),
        teacher_names,
        room_names: roomsData.map((r) => String(r.room_number)),
      };

      // Make API call to fetch timetable
      const resp = await fetch("http://localhost:8000/generate-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error(`Backend error: ${resp.status}`);
      }

      const data = await resp.json();

      if (data.success) {
        // Store fitness score and generation count
        setFitnessScore(data.fitness_score);
        setGenerationCount(data.generation_count);

        // Store statistics if available
        if (data.statistics) {
          setStatistics(data.statistics);
        }

        // Organize timetable data
        organizeTimetableData(data);
      } else {
        throw new Error("Timetable generation failed");
      }
    } catch (error) {
      setError("Error loading data: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [organizeTimetableData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getHelperFunctions = (data) => ({
    getSlotData: (classId, day, time) => {
      return timetableByClass[classId]?.[day]?.[time] || null;
    },
    getTeacherName: (teacherId) => {
      return data.teachers.find((t) => t.id === teacherId)?.name || "N/A";
    },
    getSubjectName: (subjectId) => {
      return (
        data.subjects.find((s) => s.id === subjectId)?.subject_name || "N/A"
      );
    },
    getRoomNumber: (roomId) => {
      return data.rooms.find((r) => r.id === roomId)?.room_number || "N/A";
    },
  });

  const helpers = getHelperFunctions(allData);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading master timetable...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Master Timetable
          </h1>
          <p className="text-slate-600 mt-1">
            A combined view of all class schedules.
          </p>
        </div>

        {fitnessScore !== null && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="font-medium text-indigo-800">
                Generation Results
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-slate-600">Fitness Score:</span>{" "}
                <span className="font-semibold text-indigo-700">
                  {fitnessScore}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Generations:</span>{" "}
                <span className="font-semibold text-indigo-700">
                  {generationCount}
                </span>
              </div>
              {statistics && (
                <div>
                  <span className="text-slate-600">Slots Used:</span>{" "}
                  <span className="font-semibold text-indigo-700">
                    {statistics.occupied_slots}/{statistics.total_slots} (
                    {Math.round(
                      (statistics.occupied_slots / statistics.total_slots) *
                        100,
                    )}
                    %)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {allData.classes.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5 text-indigo-600" />
                  <span>
                    {classItem.name} - {classItem.department} (Semester{" "}
                    {classItem.semester})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">Time</TableHead>
                        {days.map((day) => (
                          <TableHead
                            key={day}
                            className="text-center min-w-[150px]"
                          >
                            {day}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeGrid.map((time) => {
                        const hasSlotThisRow = days.some((day) =>
                          helpers.getSlotData(classItem.id, day, time),
                        );
                        return (
                          <TableRow
                            key={time}
                            className={!hasSlotThisRow ? "opacity-60" : ""}
                          >
                            <TableCell className="font-medium bg-slate-50">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {time}
                              </div>
                            </TableCell>
                            {days.map((day) => {
                              const slot = helpers.getSlotData(
                                classItem.id,
                                day,
                                time,
                              );
                              return (
                                <TableCell
                                  key={day}
                                  className="p-2 text-center"
                                >
                                  {slot ? (
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-left">
                                      <div className="font-semibold text-blue-900 text-sm truncate">
                                        {slot.subject_name ||
                                          helpers.getSubjectName(
                                            slot.subject_id,
                                          )}
                                      </div>
                                      <div className="text-xs text-blue-600 mt-1 truncate">
                                        {slot.teacher_name ||
                                          helpers.getTeacherName(
                                            slot.teacher_id,
                                          )}
                                      </div>
                                      <div className="text-xs text-blue-500 mt-1">
                                        Room:{" "}
                                        {slot.room_name ||
                                          helpers.getRoomNumber(slot.room_id)}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-200 text-blue-800 border-blue-300 text-xs mt-1"
                                      >
                                        {slot.type || "Lecture"}
                                      </Badge>
                                    </div>
                                  ) : (
                                    <div className="p-3 h-full flex items-center justify-center rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                                      Free
                                    </div>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {allData.classes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <LayoutGrid className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No Classes Found
            </h3>
            <p className="text-slate-500 mb-4">
              Add some classes to see the master timetable.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
