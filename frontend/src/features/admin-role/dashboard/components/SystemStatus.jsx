import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SystemStatus({ timeSlots }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" /> System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Database Connection</span>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Online
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Timetable Engine</span>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Ready
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Generated Schedules</span>
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
            {timeSlots} Active
          </Badge>
        </div>
        <Link to="/dashboard/timetable">
          <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-indigo-600">
            Generate New Timetable
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
