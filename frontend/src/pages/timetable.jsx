import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assemblePayload, organizeTimetable, timetableKeys } from "./useTimetable";

/**
 * Timetable generation mutation hook.
 * Usage:
 *   const generationStatus = useTimetableMutations({
 *     endpointUrl,
 *     generationOptions,
 *     getCurrentData: () => ({ classes, teachers, subjects, rooms, timeSlots }),
 *   });
 */
export default function useTimetableMutations({
  endpointUrl = "http://localhost:8000/generate-timetable",
  generationOptions,
  getCurrentData,
} = {}) {
  const queryClient = useQueryClient();

  const generationStatus = useMutation({
    mutationKey: timetableKeys.generation,
    mutationFn: async (variables = {}) => {
      // variables can be: { payload?, overrides?, endpointUrl? }
      const {
        payload, // optional pre-built payload
        overrides, // optional partial overrides that will be shallow-merged into assembled payload
        endpoint = endpointUrl, // allow per-call override of endpoint
      } = variables;

      let body;
      if (payload && typeof payload === "object") {
        body = payload;
      } else {
        // Assemble from current cache or provided getter
        const data = getCurrentData ? getCurrentData() : {};
        const assembled = assemblePayload(data);
        body = overrides ? { ...assembled, ...overrides } : assembled;
      }

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        let message = `Backend error: ${resp.status}`;
        try {
          const errText = await resp.text();
          message = errText || message;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      const result = await resp.json();
      return {
        raw: result,
        organized: organizeTimetable(result),
      };
    },
    onSuccess: async (_, __, ___) => {
      // Invalidate any cache that depends on timetable after generation
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: timetableKeys.timeSlots }),
      ]);
      if (generationOptions?.onSuccess) {
        generationOptions.onSuccess(...arguments);
      }
    },
    onError: (err, variables, context) => {
      if (generationOptions?.onError) {
        generationOptions.onError(err, variables, context);
      }
    },
    ...generationOptions,
  });

  return generationStatus;
}
