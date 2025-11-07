import  { useState } from "react";
import readXlsxFile from "read-excel-file";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUp, Loader2, AlertCircle } from "lucide-react";
import { requiredColumns } from "../constants.js";
import useTeacherMutations from "../hooks/useSubjectMutations.js";
import { toast } from "react-toastify";
import useSubjects from "../hooks/useSubjects.js";

export default function ExcelUploader() {
  const { createSubjectAsync, updateSubjectAsync } = useTeacherMutations();
  const { subjects } = useSubjects();
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
        h && typeof h === "string" ? h.toLowerCase() : "",
      );

      const missingColumns = requiredColumns.filter(
        (col) => !headerLower.includes(col.toLowerCase()),
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

      const subjectsToAdd = [];
      const subjectsToUpdate = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every((cell) => cell === null || cell === "")) continue;

        const subject = {
          subject_name: row[columnMap["subject_name"]] || "",
          subject_code: row[columnMap["subject_code"]] || "",
          credits: parseInt(row[columnMap["credits"]] || ""),
          department: row[columnMap["department"]] || "",
          semester: row[columnMap["semester"]] || "",
          type: row[columnMap["type"]] || "",
          hours_per_week: parseInt(row[columnMap["hours_per_week"]]) || 3,
        };

        const existing = subjects.find(
          (t) =>
            t.credits === subject.credits ||
            t.department === subject.department ||
            t.semester === subject.semester ||
            t.type === subject.type ||
            t.hours_per_week === subject.hours_per_week ||
            t.subject_code.toLowerCase() === subject.subject_code.toLowerCase(),
        );

        if (existing) {
          subjectsToUpdate.push({ id: existing.id, updates: subject });
        } else {
          subjectsToAdd.push(subject);
        }
      }

      if (subjectsToAdd.length === 0 && subjectsToUpdate.length === 0) {
        setUploadError("No valid subject data found in the file");
        setIsUploading(false);
        return;
      }

      let addedCount = 0;
      let updatedCount = 0;
      let errorMessages = [];

      for (const subject of subjectsToAdd) {
        try {
          await createSubjectAsync(subject);
          addedCount++;
        } catch (error) {
          errorMessages.push(
            `Add error for ${subject.subject_name}: ${error.message}`,
          );
        }
      }

      for (const { id, updates } of subjectsToUpdate) {
        try {
          await updateSubjectAsync({ id, updates });
          updatedCount++;
        } catch (error) {
          errorMessages.push(
            `Update error for ${updates.subject_name}: ${error.message}`,
          );
        }
      }

      if (errorMessages.length > 0) {
        setUploadError(errorMessages.join("\n"));
      } else {
        toast.success(
          `Successfully imported ${addedCount} new subjects and updated ${updatedCount} existing subjects.`,
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
          className="mt-4 bg-destructive/10 text-destructive border border-destructive/30 dark:bg-destructive/20 whitespace-pre-wrap"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
