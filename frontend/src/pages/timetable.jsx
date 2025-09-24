import React, { useState, useEffect, useCallback } from "react";
// This is the updated version with string keys for subject_hours and subject_teachers
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/config/supabase.js";
import { subjectTeacherMap } from "@/config/subjectTeacherMap";
import { testPayload } from "@/config/testPayload.js";
import ApiTester from "@/components/debug/ApiTester";
import TestButton from "@/components/debug/TestButton";

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
  // We store timetable data in organized format directly
  const [timeSlotData, setTimeSlots] = useState([]);
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState({});

  // Helper function to validate the payload
  const validatePayload = (payload) => {
    const errors = [];
    const required = [
      "num_classes",
      "days",
      "slots_per_day",
      "total_rooms",
      "total_teachers",
      "subject_hours",
      "subject_teachers",
    ];

    required.forEach((field) => {
      if (payload[field] === undefined || payload[field] === null) {
        errors.push(`Missing ${field}`);
      }
    });

    // Check if subject_hours and subject_teachers are objects with string keys
    if (
      typeof payload.subject_hours !== "object" ||
      Object.keys(payload.subject_hours).length === 0
    ) {
      errors.push("subject_hours must be a non-empty object");
    } else {
      // Check for string keys
      const hasNonStringKeys = Object.keys(payload.subject_hours).some(
        (k) => typeof k !== "string",
      );
      if (hasNonStringKeys) {
        errors.push("subject_hours must have string keys (not numeric keys)");
      }
    }

    if (
      typeof payload.subject_teachers !== "object" ||
      Object.keys(payload.subject_teachers).length === 0
    ) {
      errors.push("subject_teachers must be a non-empty object");
    } else {
      // Check for string keys
      const hasNonStringKeys = Object.keys(payload.subject_teachers).some(
        (k) => typeof k !== "string",
      );
      if (hasNonStringKeys) {
        errors.push(
          "subject_teachers must have string keys (not numeric keys)",
        );
      }

      // Check that each value is an array
      const hasNonArrayValues = Object.values(payload.subject_teachers).some(
        (v) => !Array.isArray(v),
      );
      if (hasNonArrayValues) {
        errors.push("Each value in subject_teachers must be an array");
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const organizeTimetableData = useCallback((data) => {
    const organized = {};

    // Handle data from student_timetables format (response from backend API)
    if (data && data.student_timetables) {
      data.student_timetables.forEach((classData) => {
        const classId = classData.class_id;
        if (!organized[classId]) organized[classId] = {};

        classData.timetable.forEach((daySlots, dayIndex) => {
          const day = days[dayIndex];
          if (!organized[classId][day]) organized[classId][day] = {};

          daySlots.forEach((slot, slotIndex) => {
            const time = times[slotIndex];
            if (!slot.is_free) {
              organized[classId][day][time] = {
                subject_id: slot.subject_id,
                teacher_id: slot.teacher_id,
                room_id: slot.room_id,
                class_id: classId,
                day: day,
                start_time: time,
                type: "theory",
              };
            }
          });
        });
      });
    }
    // Handle combined_view format
    else if (data && data.combined_view) {
      data.combined_view.forEach((item) => {
        const day = days[item.day];
        const time = times[item.slot];

        item.assignments.forEach((assign) => {
          const classId = assign.class_id;
          if (!organized[classId]) organized[classId] = {};
          if (!organized[classId][day]) organized[classId][day] = {};

          organized[classId][day][time] = {
            subject_id: assign.subject_id,
            teacher_id: assign.teacher_id,
            room_id: assign.room_id,
            class_id: classId,
            day: day,
            start_time: time,
            type: "theory",
          };
        });
      });
    }
    // Handle flat array format
    else if (Array.isArray(data)) {
      data.forEach((slot) => {
        if (!organized[slot.class_id]) organized[slot.class_id] = {};
        if (!organized[slot.class_id][slot.day])
          organized[slot.class_id][slot.day] = {};
        organized[slot.class_id][slot.day][slot.start_time] = slot;
      });
    }

    setTimetableData(organized);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Loading data from Supabase...");

      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("*");
      if (classesError) console.error("Classes error:", classesError);
      console.log("Classes data:", classesData);

      const { data: teachersData, error: teachersError } = await supabase
        .from("teacher_profile")
        .select("*");
      if (teachersError) console.error("Teachers error:", teachersError);
      console.log("Teachers data:", teachersData);

      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*");
      if (subjectsError) console.error("Subjects error:", subjectsError);
      console.log("Subjects data:", subjectsData);

      const { data: roomsData, error: roomsError } = await supabase
        .from("room")
        .select("*");
      if (roomsError) console.error("Rooms error:", roomsError);
      console.log("Rooms data:", roomsData);

      const { data: timeslotData, error: timeslotError } = await supabase
        .from("time_slots")
        .select("*");
      if (timeslotError) console.error("Timeslot error:", timeslotError);
      console.log("Timeslot data:", timeslotData);

      // Create data to match what the API expects - with string keys for FastAPI
      const teacher_names = teachersData.map((t) => t.name);
      console.log("Teacher names:", teacher_names);

      // For each subject, we need to define the hours per week
      // Using placeholder data - in production you'd use actual hours from database
      const subject_hours = {};
      subjectsData.forEach((s, idx) => {
        // Default to 3-4 hours per week if not specified
        const hours = s.hours_per_week || (idx % 2 === 0 ? 3 : 4);
        // Ensure keys are strings for FastAPI validation
        subject_hours["" + idx] = parseInt(hours, 10);
      });
      console.log("Subject hours object:", subject_hours);

      // Create subject_teachers mapping - which teachers can teach which subjects
      // Create subject_teachers as a plain object with string keys
      const subject_teachers = {};
      subjectsData.forEach((s, idx) => {
        // Get teachers from department if available or use mapping
        const departmentTeachers = teachersData
          .filter((t) => t.department === s.department)
          .map((t) => teachersData.indexOf(t));

        const mapped =
          departmentTeachers.length > 0
            ? departmentTeachers
            : (subjectTeacherMap[s.subject_name] || [0, 1]).map((name) =>
                typeof name === "string" ? teacher_names.indexOf(name) : name,
              );

        // Ensure keys are strings and values are arrays of integers
        const key = "" + idx; // Force string key using concatenation
        subject_teachers[key] = mapped
          .filter((i) => i !== -1)
          .map((i) => parseInt(i, 10));

        // Make sure we have at least one teacher per subject
        if (subject_teachers[key].length === 0) {
          subject_teachers[key] = [0];
        }
      });
      console.log("Subject teachers object:", subject_teachers);

      // Extract the unique days from timeslotData or use 5 days as default
      const uniqueDays =
        timeslotData && timeslotData.length > 0
          ? [...new Set(timeslotData.map((s) => s.day))]
          : [1, 2, 3, 4, 5]; // Monday to Friday
      console.log("Unique days:", uniqueDays);

      // Calculate slots per day
      const slotsPerDay =
        timeslotData && timeslotData.length > 0
          ? timeslotData.filter((s) => s.day === timeslotData[0].day).length
          : 6; // Default to 6 slots per day
      console.log("Slots per day:", slotsPerDay);

      // Create class names from the data - use department and section information
      const class_names = classesData.map(
        (c) =>
          c.class_name ||
          `${c.department || "Class"}-${c.section || "A"}${c.semester || ""}`,
      );

      // Create the payload with explicit type conversions
      const newPayload = {
        num_classes: parseInt(classesData.length, 10) || 3,
        days: uniqueDays.length || 5,
        slots_per_day: slotsPerDay || 6,
        total_rooms: parseInt(roomsData.length, 10) || 5,
        total_teachers: parseInt(teachersData.length, 10) || 8,
        subject_hours:
          Object.keys(subject_hours).length > 0
            ? subject_hours
            : { 0: 4, 1: 3, 2: 3, 3: 4 },
        subject_teachers:
          Object.keys(subject_teachers).length > 0
            ? subject_teachers
            : { 0: [0, 1], 1: [2, 3], 2: [4, 5], 3: [6, 7] },
        subject_names: subjectsData.map((s) => s.subject_name || "Subject"),
        teacher_names:
          teacher_names.length > 0 ? teacher_names : ["Teacher 1", "Teacher 2"],
        class_names:
          class_names.length > 0
            ? class_names
            : ["Class A", "Class B", "Class C"],
        room_names: roomsData.map((r) => String(r.room_number || r.id)),
      };

      console.log("Subject hours:", subject_hours);
      console.log("Subject teachers:", subject_teachers);
      setPayload(newPayload);

      setClasses(classesData);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setRooms(roomsData);

      // Use the imported test payload with string keys
      console.log("Using imported test payload:", testPayload);

      console.log("Sending payload:", newPayload);
      console.log("Test payload for comparison:", testPayload);

      // Verify the payload has all required fields
      const requiredFields = [
        "num_classes",
        "days",
        "slots_per_day",
        "total_rooms",
        "total_teachers",
        "subject_hours",
        "subject_teachers",
      ];
      const missingFields = requiredFields.filter(
        (field) => !newPayload[field],
      );
      if (missingFields.length > 0) {
        console.error("Missing required fields in payload:", missingFields);
      }

      // Force string keys for subject_hours and subject_teachers before stringifying
      const stringKeyPayload = {
        ...newPayload,
        subject_hours: Object.fromEntries(
          Object.entries(newPayload.subject_hours).map(([k, v]) => ["" + k, v]),
        ),
        subject_teachers: Object.fromEntries(
          Object.entries(newPayload.subject_teachers).map(([k, v]) => [
            "" + k,
            v,
          ]),
        ),
      };
      const payloadJSON = JSON.stringify(stringKeyPayload);
      console.log("Stringified payload with string keys:", payloadJSON);

      // Always use the constructed payload for normal operation
      console.log("Final API payload as JSON string:", payloadJSON);

      // Log the parsed JSON to verify structure
      try {
        const parsedPayload = JSON.parse(payloadJSON);
        console.log("Parsed payload structure check:", {
          subject_hours_type: typeof parsedPayload.subject_hours,
          subject_hours_keys: Object.keys(parsedPayload.subject_hours),
          subject_teachers_type: typeof parsedPayload.subject_teachers,
          subject_teachers_keys: Object.keys(parsedPayload.subject_teachers),
        });
      } catch (e) {
        console.error("JSON parse error:", e);
      }

      const resp = await fetch("http://localhost:8000/generate-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadJSON,
      });

      if (!resp.ok) {
        const errorData = await resp.text();
        console.error("API Error:", errorData);
        throw new Error(`Backend error: ${resp.status} - ${errorData}`);
      }

      const result = await resp.json();
      console.log("Received timetable data:", result);
      setTimeSlots(result.student_timetables || []);
      organizeTimetableData(result);
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
      // Make sure we're using the complete payload with all required fields
      console.log("Sending timetable generation request:", payload);

      // Verify the payload has all required fields
      const requiredFields = [
        "num_classes",
        "days",
        "slots_per_day",
        "total_rooms",
        "total_teachers",
        "subject_hours",
        "subject_teachers",
      ];
      const missingFields = requiredFields.filter((field) => !payload[field]);
      if (missingFields.length > 0) {
        console.error("Missing required fields in payload:", missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Convert payload to JSON and log it
      const payloadJSON = JSON.stringify(payload);
      console.log("Stringified payload:", payloadJSON);

      // Add console log to see what's being sent
      console.log("Request payload being sent:", payload);
      console.log("Request payload JSON:", payloadJSON);

      const response = await fetch("http://localhost:8000/generate-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadJSON,
      });

      // Handle non-200 responses
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("API Error Details:", errorData);
          if (errorData.detail) {
            errorMessage = Array.isArray(errorData.detail)
              ? errorData.detail
                  .map((err) => `${err.loc.join(".")} - ${err.msg}`)
                  .join(", ")
              : errorData.detail;
          }
        } catch (_) {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Received generated timetable:", data);
      setTimeSlots(data.student_timetables || []);
      organizeTimetableData(data);
    } catch (err) {
      console.error("Timetable generation error:", err);
      setError(`Error generating timetable: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const getSlotData = (day, time) =>
    timetableData[selectedClass]?.[day]?.[time] || null;
  const getTeacherName = (id) => {
    if (id === undefined || id === null) return "Unknown";
    const teacher = teachers.find((t) => t.id === id);
    return teacher ? teacher.name : `Teacher ${id}`;
  };
  const getSubjectName = (id) => {
    if (id === undefined || id === null) return "Unknown";
    const subject = subjects.find((s) => s.id === id);
    return subject ? subject.subject_name : `Subject ${id}`;
  };
  const getRoomNumber = (id) => {
    if (id === undefined || id === null) return "Unknown";
    const room = rooms.find((r) => r.id === id);
    return room ? room.room_number : `Room ${id}`;
  };

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
                    {times.map((time) => (
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
                        {days.map((day) => {
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
                                    {getSubjectName(slot.subject_id)}
                                  </div>
                                  <div className="text-xs text-blue-600 mt-1">
                                    {getTeacherName(slot.teacher_id)}
                                  </div>
                                  <div className="text-xs text-blue-500 mt-1">
                                    Room: {getRoomNumber(slot.room_id)}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-200 text-blue-800 border-blue-300 text-xs mt-1"
                                  >
                                    {slot.type}
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

      {/* API Tester for debugging */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Test API Call</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Specialized test button with properly formatted payload */}
            <TestButton
              onSuccess={(data) => {
                organizeTimetableData(data);
                setSelectedClass("0");
              }}
            />

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Other Test Options</h3>

              <Button
                className="w-full mb-2"
                variant="outline"
                onClick={async () => {
                  try {
                    setError("");
                    setGenerating(true);

                    // First, fetch the example request from the API endpoint
                    const exampleResp = await fetch(
                      "http://localhost:8000/example-request",
                    );

                    if (!exampleResp.ok) {
                      throw new Error(
                        `Could not fetch example: ${exampleResp.status}`,
                      );
                    }

                    const examplePayload = await exampleResp.json();
                    console.log("Example payload from API:", examplePayload);

                    // Now use the example payload to generate timetable
                    const resp = await fetch(
                      "http://localhost:8000/generate-timetable",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(examplePayload),
                      },
                    );

                    if (!resp.ok) {
                      const errorText = await resp.text();
                      console.error("API Example test error:", errorText);
                      setError(
                        `API Example test failed: ${resp.status} - ${errorText}`,
                      );
                    } else {
                      const result = await resp.json();
                      console.log("API Example test success:", result);
                      organizeTimetableData(result);
                      setSelectedClass("0"); // Select the first class
                      alert("API Example test successful!");
                    }
                  } catch (err) {
                    console.error("API Example test error:", err);
                    setError(`API Example test error: ${err.message}`);
                  } finally {
                    setGenerating(false);
                  }
                }}
              >
                Test with API's Example Payload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <details className="mt-8 border border-slate-200 rounded-lg">
        <summary className="p-3 font-medium cursor-pointer bg-slate-50">
          API Debugging Tool
        </summary>
        <div className="p-4">
          <ApiTester />
        </div>
      </details>
    </div>
  );
}
