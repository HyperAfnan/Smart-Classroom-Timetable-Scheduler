import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Loader2, RefreshCw, Download, AlertCircle } from "lucide-react";

/**
 * ControlsCard
 * Encapsulates class selection and actions (Generate / Export) for timetable.
 *
 * Props:
 * - classes: Array<{ id: string|number, name: string, department?: string, semester?: string|number }>
 * - selectedClass: string|number
 * - onSelectClass: (value: string) => void
 * - onGenerate: () => Promise<void> | void
 * - generating?: boolean
 * - onExport?: () => void
 * - errorMessage?: string
 * - title?: string
 * - disableGenerate?: boolean
 * - disableExport?: boolean
 */
export default function ControlsCard({
  classes = [],
  selectedClass,
  onSelectClass,
  onGenerate,
  generating = false,
  onExport,
  errorMessage = "",
  title = "Timetable Generator",
  disableGenerate = false,
  disableExport = false,
}) {
  const canGenerate = !generating && !!selectedClass && !disableGenerate;
  const canExport = !!selectedClass && !disableExport;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Select value={selectedClass ?? ""} onValueChange={onSelectClass}>
              <SelectTrigger aria-label="Select class">
                <SelectValue placeholder="Select a class..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.class_name}
                    {c.semester ? `(Sem ${c.semester})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onGenerate}
              disabled={!canGenerate}
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

            <Button variant="outline" disabled={!canExport} onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{String(errorMessage)}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
