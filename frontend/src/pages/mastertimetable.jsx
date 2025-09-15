import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    LayoutGrid,
    Clock, 
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const timeGrid = ["09:00", "10:00", "11:15", "12:15", "14:15", "15:15"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function MasterTimetable() {
    const [allData, setAllData] = useState({
        classes: [],
        teachers: [],
        subjects: [],
        rooms: [],
        timeSlots: []
    });
    const [timetableByClass, setTimetableByClass] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const organizeTimetableData = useCallback((slots) => {
        const organized = {};
        slots.forEach(slot => {
            if (!organized[slot.class_id]) {
                organized[slot.class_id] = {};
            }
            if (!organized[slot.class_id][slot.day]) {
                organized[slot.class_id][slot.day] = {};
            }
            organized[slot.class_id][slot.day][slot.start_time] = slot;
        });
        setTimetableByClass(organized);
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // setAllData({
            //     classes: Class,
            //     teachers: Teacher,
            //     subjects: Subject,
            //     rooms: Room,
            //     timeSlots: Timeslot
            // });
            
            // organizeTimetableData(Timeslot);
        } catch (error) {
            setError("Error loading data");
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
            return data.teachers.find(t => t.id === teacherId)?.name || "N/A";
        },
        getSubjectName: (subjectId) => {
            return data.subjects.find(s => s.id === subjectId)?.name || "N/A";
        },
        getRoomNumber: (roomId) => {
            return data.rooms.find(r => r.id === roomId)?.room_number || "N/A";
        }
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
         )
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Master Timetable</h1>
                    <p className="text-slate-600 mt-1">A combined view of all class schedules.</p>
                </div>
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
                                    <span>{classItem.name} - {classItem.department} (Semester {classItem.semester})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-24">Time</TableHead>
                                                {days.map(day => (
                                                    <TableHead key={day} className="text-center min-w-[150px]">
                                                        {day}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {timeGrid.map((time) => {
                                                const hasSlotThisRow = days.some(day => helpers.getSlotData(classItem.id, day, time));
                                                return (
                                                    <TableRow key={time} className={!hasSlotThisRow ? "opacity-60" : ""}>
                                                        <TableCell className="font-medium bg-slate-50">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3 text-slate-400" />
                                                                {time}
                                                            </div>
                                                        </TableCell>
                                                        {days.map(day => {
                                                            const slot = helpers.getSlotData(classItem.id, day, time);
                                                            return (
                                                                <TableCell key={day} className="p-2 text-center">
                                                                    {slot ? (
                                                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-left">
                                                                            <div className="font-semibold text-blue-900 text-sm truncate">
                                                                                {helpers.getSubjectName(slot.subject_id)}
                                                                            </div>
                                                                            <div className="text-xs text-blue-600 mt-1 truncate">
                                                                                {helpers.getTeacherName(slot.teacher_id)}
                                                                            </div>
                                                                            <div className="text-xs text-blue-500 mt-1">
                                                                                Room: {helpers.getRoomNumber(slot.room_id)}
                                                                            </div>
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
                                                )
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
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No Classes Found</h3>
                        <p className="text-slate-500 mb-4">
                            Add some classes to see the master timetable.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
