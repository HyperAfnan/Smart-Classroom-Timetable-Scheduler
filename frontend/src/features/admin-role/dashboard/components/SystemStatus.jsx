import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SystemStatus({ timeSlots }) {
  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />{" "}
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Database Connection
          </span>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Online
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Timetable Engine
          </span>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Ready
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Generated Schedules
          </span>
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border"
          >
            {timeSlots} Active
          </Badge>
        </div>
        <Link to="/dashboard/timetablegen">
          <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm hover:from-indigo-600 hover:to-violet-700 dark:from-indigo-600 dark:to-violet-700 dark:hover:from-indigo-500 dark:hover:to-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 dark:ring-offset-background transition-colors">
            Generate New Timetable
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
