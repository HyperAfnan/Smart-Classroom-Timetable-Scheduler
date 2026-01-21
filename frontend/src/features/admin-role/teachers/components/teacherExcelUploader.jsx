import React, { useState } from "react";
import readXlsxFile from "read-excel-file";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUp, Loader2, AlertCircle } from "lucide-react";
import { requiredColumns } from "../constants.js";
import useTeachers from "../hooks/useTeachers.js";
import useTeacherMutations from "../hooks/useTeacherMutations.js";
import { toast } from "react-toastify";

export default function ExcelUploader({}) {
  const { createTeacherAsync, updateTeacherAsync } = useTeacherMutations();
  const { teachers } = useTeachers();
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const rows = await readXlsxFile(file);
      const headers = rows[0];
      const headerLower = headers.map((h) =>
        h && typeof h === "string" ? h?.toLowerCase() : "",
      );

      const missingColumns = requiredColumns.filter(
        (col) => !headerLower?.includes(col?.toLowerCase()),
      );

      if (missingColumns.length > 0) {
        setUploadError(`Missing columns: ${missingColumns.join(", ")}`);
        setIsUploading(false);
        return;
      }

      const columnMap = {};
      headerLower.forEach((header, index) => {
        columnMap[header] = index;
      });

      const teachersToAdd = [];
      const teachersToUpdate = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every((cell) => cell === null || cell === "")) continue;

        const teacher = {
          name: row[columnMap["name"]] || "",
          email: row[columnMap["email"]] || "",
          empId: String(row[columnMap["empId"]] || ""),
          department: row[columnMap["department"]] || "",
          designation: row[columnMap["designation"]] || "",
          maxHours: parseInt(row[columnMap["maxHours"]]) || 20,
          subjects: [],
        };

        if (!teacher?.name || !teacher?.email || !teacher?.empId) continue;

        const existing = teachers.find(
          (t) =>
            t?.empId === teacher?.empId ||
            t?.email?.toLowerCase() === teacher?.email?.toLowerCase(),
        );

        if (existing) {
          teachersToUpdate.push({ id: existing.id, updates: teacher });
        } else {
          teachersToAdd.push(teacher);
        }
      }

      if (teachersToAdd.length === 0 && teachersToUpdate.length === 0) {
        setUploadError("No valid teacher data found in the file");
        setIsUploading(false);
        return;
      }

      let addedCount = 0;
      let updatedCount = 0;
      let errorMessages = [];

      for (const teacher of teachersToAdd) {
        try {
          await createTeacherAsync(teacher);
          addedCount++;
        } catch (error) {
          errorMessages.push(`Add error for ${teacher.name}: ${error.message}`);
        }
      }

      for (const { id, updates } of teachersToUpdate) {
        try {
          await updateTeacherAsync({ id, updates });
          updatedCount++;
        } catch (error) {
          errorMessages.push(
            `Update error for ${updates.name}: ${error.message}`,
          );
        }
      }

      if (errorMessages.length > 0) {
        setUploadError(errorMessages.join("\n"));
      } else {
        toast.success(
          `Successfully imported ${addedCount} new teachers and updated ${updatedCount} existing teachers.`,
        );
        e.target.value = null;
      }
    } catch (error) {
      setUploadError(`Error processing file: ${error.message}`);
    }

    setIsUploading(false);
  };

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => document.getElementById("excelFileInput").click()}
        className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <FileUp className="w-4 h-4 mr-2" />
            Import Excel
          </>
        )}
      </Button>
      <input
        id="excelFileInput"
        type="file"
        className="hidden"
        accept=".xlsx"
        onChange={handleExcelUpload}
        disabled={isUploading}
      />

      {uploadError && (
        <Alert
          variant="destructive"
          className="mt-4 bg-destructive/10 text-destructive border border-destructive/30 dark:bg-destructive/20"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
