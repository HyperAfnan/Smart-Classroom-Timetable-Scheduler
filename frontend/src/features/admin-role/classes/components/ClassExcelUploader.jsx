import React, { useState } from "react";
import readXlsxFile from "read-excel-file";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUp, Loader2, AlertCircle } from "lucide-react";
import { CLASS_REQUIRED_COLUMNS } from "../constants";
import useClasses from "../hooks/useClasses";
import { toast } from "react-toastify";

/**
 * ClassExcelUploader
 *
 * Features:
 * - Validates presence of required columns (case-insensitive):
 *     class_name, department, semester, section, students, academic_year
 * - Accepts extra/unknown columns (ignored)
 * - Parses integers for semester & students
 * - Determines whether to create or update based on a composite identity:
 *     class_name + department + semester + section (case-insensitive for class_name & section)
 * - Aggregates successes & errors and provides user feedback
 *
 * Usage:
 *   <ClassExcelUploader />
 */
export default function ClassExcelUploader() {
  const { classes, createClassAsync, updateClassAsync } = useClasses();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const rows = await readXlsxFile(file);
      if (!rows.length) {
        setUploadError("The file is empty.");
        setIsUploading(false);
        return;
      }

      const headers = rows[0];
      const headerLower = headers.map((h) =>
        typeof h === "string" ? h.trim().toLowerCase() : "",
      );

      // Validate required headers
      const missing = CLASS_REQUIRED_COLUMNS.filter(
        (col) => !headerLower.includes(col.toLowerCase()),
      );
      if (missing.length) {
        setUploadError(`Missing required columns: ${missing.join(", ")}`);
        setIsUploading(false);
        return;
      }

      // Map header -> index
      const colIndex = {};
      headerLower.forEach((h, i) => {
        if (h) colIndex[h] = i;
      });

      const toCreate = [];
      const toUpdate = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.every((cell) => cell === null || cell === "")) continue;

        const rawClassName = row[colIndex["class_name"]];
        const rawDept = row[colIndex["department"]];
        const rawSemester = row[colIndex["semester"]];
        const rawSection = row[colIndex["section"]];
        const rawStudents = row[colIndex["students"]];
        const rawYear = row[colIndex["academic_year"]];

        // Basic required field presence check
        if (
          rawClassName == null ||
          rawDept == null ||
          rawSemester == null ||
          rawSection == null ||
          rawStudents == null ||
          rawYear == null
        ) {
          continue;
        }

        const semester = parseInt(rawSemester, 10);
        const students = parseInt(rawStudents, 10);

        if (
          Number.isNaN(semester) ||
          semester < 1 ||
          semester > 12 || // allow a bit wider range in case institution uses extended pattern
          Number.isNaN(students) ||
          students <= 0
        ) {
          continue; // skip invalid numeric row
        }

        const class_name = String(rawClassName).trim();
        const department = String(rawDept).trim();
        const section = String(rawSection).trim();
        const academic_year = String(rawYear).trim();

        if (!class_name || !department || !section || !academic_year) continue;

        const payload = {
          class_name,
          department,
          semester,
          section,
          students,
          academic_year,
        };

        // Identify existing by composite (case-insensitive for class_name & section)
        const existing = classes.find(
          (c) =>
            c.class_name?.toLowerCase() === class_name.toLowerCase() &&
            c.department === department &&
            c.semester === semester &&
            (c.section || "").toLowerCase() === section.toLowerCase(),
        );

        if (existing) {
          toUpdate.push({ id: existing.id, updates: payload });
        } else {
          toCreate.push(payload);
        }
      }

      if (toCreate.length === 0 && toUpdate.length === 0) {
        setUploadError("No valid class rows found to import.");
        setIsUploading(false);
        return;
      }

      let createdCount = 0;
      let updatedCount = 0;
      const errorMessages = [];

      // Sequential processing for clarity (could batch with Promise.allSettled if needed)
      for (const c of toCreate) {
        try {
          await createClassAsync(c);
          createdCount++;
        } catch (err) {
          errorMessages.push(
            `Create error for ${c.class_name} (${c.department} Sem ${c.semester} Sec ${c.section}): ${
              err?.message || err
            }`,
          );
        }
      }

      for (const { id, updates } of toUpdate) {
        try {
          await updateClassAsync({ id, updates });
          updatedCount++;
        } catch (err) {
          errorMessages.push(
            `Update error for ${updates.class_name} (${updates.department} Sem ${updates.semester} Sec ${updates.section}): ${
              err?.message || err
            }`,
          );
        }
      }

      if (errorMessages.length) {
        setUploadError(errorMessages.join("\n"));
      }

      if (createdCount || updatedCount) {
        toast.success(
          `Import complete: ${createdCount} created, ${updatedCount} updated.`,
        );
      }

      // Allow re-upload of same file
      e.target.value = null;
    } catch (err) {
      setUploadError(`Error processing file: ${err?.message || String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        onClick={() =>
          document.getElementById("classesExcelFileInput")?.click()
        }
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
        id="classesExcelFileInput"
        type="file"
        className="hidden"
        accept=".xlsx"
        onChange={handleExcelUpload}
        disabled={isUploading}
      />
      {uploadError && (
        <Alert variant="destructive" className="mt-4 whitespace-pre-wrap">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
