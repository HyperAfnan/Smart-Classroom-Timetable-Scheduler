import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

/**
 * A specialized button for testing the timetable generator API
 * with properly formatted payload that FastAPI can validate
 */
export const TestButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // This is the payload with explicit string keys for subject_hours and subject_teachers
      // which is the format FastAPI validation requires
      const payload = {
        num_classes: 3,
        days: 5,
        slots_per_day: 6,
        total_rooms: 6,
        total_teachers: 8,
        subject_hours: {"0": 4, "1": 3, "2": 3},
        subject_teachers: {"0": [0, 1], "1": [2, 3], "2": [4, 5]},
        class_names: ["CS-A1", "MATH-A1", "PHYS-A1"],
        subject_names: ["Computer Science", "Mathematics", "Physics"],
        teacher_names: [
          "John Smith",
          "Mary Johnson",
          "Robert Williams",
          "Sarah Brown",
          "Michael Jones",
          "Jennifer Davis",
          "David Miller",
          "Lisa Wilson"
        ],
        room_names: ["R101", "R102", "R103", "R104", "R105", "R106"],
        max_hours_per_day: 6,
        max_hours_per_week: 20,
        mutation_rate: 0.02,
        population_size: 60,
        generations: 80
      };

      console.log("Sending test payload with string keys:", payload);
      console.log("subject_hours type:", typeof payload.subject_hours);
      console.log("subject_hours keys:", Object.keys(payload.subject_hours));

      // Make the API request
      const response = await fetch("http://localhost:8000/generate-timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("API response:", data);
      setSuccess(true);

      // Call the success handler if provided
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(data);
      }
    } catch (err) {
      console.error("Test button error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Testing API...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Test Successful
          </>
        ) : (
          "Test with Properly Formatted Payload"
        )}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
          <AlertDescription className="text-green-700">
            API test successful! Timetable data has been loaded.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TestButton;
