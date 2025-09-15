import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  Clock,
  Zap,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/config/supabase.js";
import { subjectTeacherMap } from "@/config/subjectTeacherMap";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const times = ["09:00", "10:00", "11:15", "12:15", "14:15", "15:15"];

export default function Timetable() {
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState({});
  const [fitnessScore, setFitnessScore] = useState(null);
  const [generationCount, setGenerationCount] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const organizeTimetableData = useCallback((data) => {
    // Handle the student timetables format from backend
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
              organized[classId][day][times[slot.slot]] = {
                subject_id: slot.subject_id,
                teacher_id: slot.teacher_id,
                room_id: slot.room_id,
                class_id: slot.class_id,
                day: day,
                start_time: times[slot.slot],
                subject_name: slot.subject_name,
                teacher_name: slot.teacher_name,
                room_name: slot.room_name,
                type: "Lecture", // Default type
              };
            }
          });
        });
      });

      setTimetableData(organized);
    } else if (data.combined_view) {
      // Legacy format handling
      const organized = {};
      data.combined_view.forEach((slot) => {
        if (!organized[slot.class_id]) organized[slot.class_id] = {};
        if (!organized[slot.class_id][slot.day])
          organized[slot.class_id][slot.day] = {};
        organized[slot.class_id][slot.day][slot.start_time] = slot;
      });
      setTimetableData(organized);
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
      const { data: timeslotData } = await supabase
        .from("time_slots")
        .select("*");

      const teacher_names = teachersData.map((t) => t.name);

      const subject_hours = {};
      subjectsData.forEach((s, idx) => {
        subject_hours[idx] = s.hours_per_week;
      });

      const subject_teachers = {};
      subjectsData.forEach((s, idx) => {
        const mapped = subjectTeacherMap[s.subject_name] || [teacher_names[0]];
        subject_teachers[idx] = mapped
          .map((name) => teacher_names.indexOf(name))
          .filter((i) => i !== -1);
      });

      // Create payload object locally before using it
      const payloadData = {
        num_classes: classesData.length,
        days: new Set(timeslotData.map((s) => s.day)).size,
        slots_per_day: timeslotData.filter((s) => s.day === timeslotData[0].day)
          .length,
        total_rooms: roomsData.length,
        total_teachers: teacher_names.length,
        subject_hours,
        subject_teachers,
        subject_names: subjectsData.map((s) => s.subject_name),
        teacher_names,
        room_names: roomsData.map((r) => String(r.room_number)),
      };

      // Update state with all data
      setPayload(payloadData);
      setClasses(classesData);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setRooms(roomsData);

      const resp = await fetch("http://localhost:8000/generate-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
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

        // Store timeslots if using legacy format
        if (data.combined_view) {
          setTimeSlots(data.combined_view);
        }

        // Organize timetable data
        organizeTimetableData(data);
      } else {
        throw new Error("Timetable generation failed");
      }
    } catch (err) {
      console.error(err);
      setError("Error loading timetable data");
    } finally {
      setLoading(false);
    }
  }, [organizeTimetableData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateTimetable = async () => {
    if (!selectedClass) {
      setError("Please select a class first");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      // Make a copy of the current payload state
      const currentPayload = { ...payload };

      if (Object.keys(currentPayload).length === 0) {
        setError("Please wait for data to load");
        setGenerating(false);
        return;
      }

      const resp = await fetch("http://localhost:8000/generate-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentPayload, class_id: selectedClass }),
      });

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
    } catch (err) {
      console.error(err);
      setError("Error generating timetable");
    } finally {
      setGenerating(false);
    }
  };

  const getSlotData = (day, time) =>
    timetableData[selectedClass]?.[day]?.[time] || null;
  const getTeacherName = (id) =>
    teachers.find((t) => t.id === id)?.name || "Unknown";
  const getSubjectName = (id) =>
    subjects.find((s) => s.id === id)?.subject_name || "Unknown";
  const getRoomNumber = (id) =>
    rooms.find((r) => r.id === id)?.room_number || "Unknown";

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading timetable data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Timetable Generator
          </h1>
          <p className="text-slate-600 mt-1">
            Generate and view individual class schedules
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

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            Timetable Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {c.department} (Sem {c.semester})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={generateTimetable}
                disabled={generating || !selectedClass}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Timetable
                  </>
                )}
              </Button>
              <Button variant="outline" disabled={!selectedClass}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Timetable Display */}
      {selectedClass ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Timetable –{" "}
              {classes.find((c) => c.id === selectedClass)?.name}
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
                  <AnimatePresence>
                    {times.map((time, timeIndex) => (
                      <motion.tr
                        key={time}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <TableCell className="font-medium bg-slate-50">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {time}
                          </div>
                        </TableCell>
                        {days.map((day, dayIndex) => {
                          const slot = getSlotData(day, time);
                          return (
                            <TableCell key={day} className="p-2 text-center">
                              {slot ? (
                                <motion.div
                                  initial={{ scale: 0.95, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-left"
                                >
                                  <div className="font-semibold text-blue-900 text-sm">
                                    {slot.subject_name ||
                                      getSubjectName(slot.subject_id)}
                                  </div>
                                  <div className="text-xs text-blue-600 mt-1">
                                    {slot.teacher_name ||
                                      getTeacherName(slot.teacher_id)}
                                  </div>
                                  <div className="text-xs text-blue-500 mt-1">
                                    Room:{" "}
                                    {slot.room_name ||
                                      getRoomNumber(slot.room_id)}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-200 text-blue-800 border-blue-300 text-xs mt-1"
                                  >
                                    {slot.type || "Lecture"}
                                  </Badge>
                                </motion.div>
                              ) : (
                                <div className="p-3 rounded-lg border border-dashed border-slate-200 text-slate-400">
                                  Free
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
