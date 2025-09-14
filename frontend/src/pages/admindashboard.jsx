import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Users, 
    MapPin, 
    BookOpen, 
    GraduationCap, 
    Calendar,
    Clock,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/config/supabase";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        teachers: 0,
        rooms: 0,
        subjects: 0,
        classes: 0,
        timeSlots: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [{ count: teachers = 0 }, { count: rooms = 0 }, { count: subjects = 0 }, { count: classes = 0 }, { count: timeSlots = 0 }] = await Promise.all([
                supabase.from("teacher_profile").select("*", { count: "exact", head: true }),
                supabase.from("room").select("*", { count: "exact", head: true }),
                supabase.from("subjects").select("*", { count: "exact", head: true }),
                supabase.from("classes").select("*", { count: "exact", head: true }),
                supabase.from("time_slots").select("*", { count: "exact", head: true }),
            ]);
            setStats({
                teachers,
                rooms,
                subjects,
                classes,
                timeSlots
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Teachers",
            value: stats.teachers,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-700",
            link: "/dashboard/teachers"
        },
        {
            title: "Active Rooms",
            value: stats.rooms,
            icon: MapPin,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-700",
            link: "/dashboard/rooms"
        },
        {
            title: "Subjects",
            value: stats.subjects,
            icon: BookOpen,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            textColor: "text-purple-700",
            link: "/dashboard/subjects"
        },
        {
            title: "Classes",
            value: stats.classes,
            icon: GraduationCap,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            textColor: "text-orange-700",
            link: "/dashboard/classes"
        }
    ];

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">University Timetable Management System</p>
                </div>
                <div className="flex gap-3">
                    <Link to={("/dashboard/timetable")}>
                        <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white">
                            <Calendar className="w-4 h-4 mr-2" />
                            View Timetable
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link to={stat.link}>
                            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                                        <span className="text-xs text-green-600 font-medium">Active</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link to={"/dashboard/teachers"}>
                            <Button variant="outline" className="w-full justify-start hover:bg-blue-50">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Teacher
                            </Button>
                        </Link>
                        <Link to={"/dashboard/subjects"}>
                            <Button variant="outline" className="w-full justify-start hover:bg-purple-50">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Subject
                            </Button>
                        </Link>
                        <Link to={"/dashboard/rooms"}>
                            <Button variant="outline" className="w-full justify-start hover:bg-green-50">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Room
                            </Button>
                        </Link>
                        <Link to={"/dashboard/classes"}>
                            <Button variant="outline" className="w-full justify-start hover:bg-orange-50">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Class
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Database Connection</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Online
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Timetable Engine</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Ready
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Generated Schedules</span>
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                {stats.timeSlots} Active
                            </Badge>
                        </div>
                        <Link to={"/dashboard/timetable"}>
                            <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-indigo-600">
                                Generate New Timetable
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
