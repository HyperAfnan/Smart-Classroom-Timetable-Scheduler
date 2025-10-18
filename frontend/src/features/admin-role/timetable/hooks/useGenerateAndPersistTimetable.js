/**
 * Orchestrated hook to generate a timetable from the backend and persist it
 * into the database as soon as it returns. Also exposes useful state and helpers.
 *
 * Responsibilities:
 * - Compose the generation (useTimetable) and persistence (useTimetableEntriesMutations) flows.
 * - Immediately upsert generated slots into `timetable_entries`.
 * - Provide status flags for generating & persisting.
 * - Return the last organized object and rows for UI fallback rendering.
 *
 * Typical usage:
 *   const {
 *     data,
 *     isLoading,
 *     isError,
 *     error,
 *     generating,
 *     persisting,
 *     isPending,
 *     lastOrganized,
 *     lastRows,
 *     generateAndPersistAsync,
 *     getTeacherName,
 *     getSubjectName,
 *     getRoomNumber,
 *   } = useGenerateAndPersistTimetable({ days, times, mode: "upsert" });
 *
 *   // Then in a callback:
 *   await generateAndPersistAsync({ filterClassId: selectedClass });
 *
 * Notes:
 * - Ensure `time_slots` fits your day index convention (Mon=0.. vs Mon=1..). The mapper includes a day+1 fallback.
 * - Ensure `timetable_entries` has a unique constraint on (class_id,time_slot_id) to support upserts.
 * - If your backend returns class indices instead of DB IDs, this hook auto-maps them using the fetched `classes` order.
 */

import { useCallback, useState } from "react";
import useTimetable from "./useTimetable";
import useTimetableEntriesMutations from "./useTimetableEntriesMutations";

export default function useGenerateAndPersistTimetable({
  days,
  times,
  endpointUrl,
  // insert mode: "upsert" (default) or "replace"
  mode = "upsert",
  // pass-through options to the underlying hooks if needed
  classesQueryOptions,
  teachersQueryOptions,
  subjectsQueryOptions,
  roomsQueryOptions,
  timeSlotsQueryOptions,
  generationOptions,
} = {}) {
  // Generation + base data
  const {
    data: { classes, teachers, subjects, rooms, timeSlots },
    isLoading,
    isError,
    error,
    refetchAll,
    assemblePayload,
    generateAsync,
    generationStatus,
    getTeacherName,
    getSubjectName,
    getRoomNumber,
  } = useTimetable({
    days,
    times,
    endpointUrl,
    classesQueryOptions,
    teachersQueryOptions,
    subjectsQueryOptions,
    roomsQueryOptions,
    timeSlotsQueryOptions,
    generationOptions,
  });

  // Persistence
  const {
    mapOrganizedToRows,
    insertEntries,
    insertEntriesAsync,
    clearClassEntries,
    clearClassEntriesAsync,
  } = useTimetableEntriesMutations();

  // Local state for UI fallback & diagnostics
  const [lastOrganized, setLastOrganized] = useState(null);
  const [lastRows, setLastRows] = useState([]);
  const [lastInsertResult, setLastInsertResult] = useState(null);
  const [lastError, setLastError] = useState(null);

  const persisting = insertEntries.isPending;
  const generating = generationStatus.isPending;
  const isPending = generating || persisting;

  /**
   * Create a mapping between generated organized keys and actual DB class IDs when
   * the backend returns class indices (e.g., "0", "1") instead of DB IDs.
   */
  const makeClassKeyToIdMap = useCallback(
    (organized) => {
      const keys = Object.keys(organized || {});
      if (!keys.length || !Array.isArray(classes) || classes.length === 0) {
        return undefined;
      }

      const mapping = {};

      // Helper to extract class_name from the first non-null slot under a given class key
      const extractClassName = (k) => {
        const dayObj = organized?.[k] || {};
        for (const dayName of Object.keys(dayObj)) {
          const timeObj = dayObj[dayName] || {};
          for (const t of Object.keys(timeObj)) {
            const slot = timeObj[t];
            if (slot && slot.class_name) return String(slot.class_name);
          }
        }
        return undefined;
      };

      // 1) If keys look like indices (0..N), map by index position to DB class IDs
      const dbIdSet = new Set(classes.map((c) => String(c.id)));
      const looksIndexed =
        keys.every((k) => /^\d+$/.test(k)) && !keys.some((k) => dbIdSet.has(k));
      if (looksIndexed) {
        keys.forEach((k) => {
          const id = classes[Number(k)]?.id;
          if (id != null) mapping[k] = id;
        });
      }

      // 2) Additionally, try mapping by class_name found inside slot payloads
      const byName = new Map(
        classes.map((c) => [String(c.class_name ?? c.name ?? ""), c.id]),
      );
      keys.forEach((k) => {
        if (mapping[k] != null) return;
        const nm = extractClassName(k);
        if (!nm) return;
        const id = byName.get(String(nm));
        if (id != null) mapping[k] = id;
      });

      return Object.keys(mapping).length ? mapping : undefined;
    },
    [classes],
  );

  /**
   * Optionally filter organized object to one classId for targeted generation/persist.
   */
  const filterOrganizedByClass = useCallback(
    (organized, classId, classKeyToId) => {
      if (!organized || classId == null) return organized;
      const target = String(classId);
      // direct match: organized has a key equal to classId
      if (Object.prototype.hasOwnProperty.call(organized, target)) {
        return { [target]: organized[target] };
      }
      // try index mapping when keys are indices
      if (classKeyToId) {
        const foundKey = Object.entries(classKeyToId).find(
          ([, id]) => String(id) === target,
        )?.[0];
        if (foundKey && organized[foundKey]) {
          return { [foundKey]: organized[foundKey] };
        }
      }
      // no match -> empty set (prevents inserting other classes unintentionally)
      return {};
    },
    [],
  );

  /**
   * Orchestrated flow:
   * 1) Generate timetable (calls backend)
   * 2) Persist results (upsert/replace)
   * 3) Return summary & update local state for UI fallback
   */
  const generateAndPersistAsync = useCallback(
    async ({
      // either provide a full payload or let the hook assemble it
      payload,
      // partial overrides (shallow-merge onto assembled payload) if you don't pass payload
      overrides,
      // override insert mode per call
      mode: callMode,
      // optionally limit to a single class during persistence
      filterClassId,
    } = {}) => {
      setLastError(null);

      // 1) Generate
      // Ensure freshest base data before generating/persisting
      const fresh = await refetchAll();
      const baseClasses = fresh?.classes?.length ? fresh.classes : classes;
      const baseTeachers = fresh?.teachers?.length ? fresh.teachers : teachers;
      const baseSubjects = fresh?.subjects?.length ? fresh.subjects : subjects;
      const baseRooms = fresh?.rooms?.length ? fresh.rooms : rooms;
      const baseTimeSlots = fresh?.timeSlots?.length
        ? fresh.timeSlots
        : timeSlots;

      const body =
        payload ??
        (overrides
          ? {
              ...assemblePayload({
                classes: baseClasses,
                teachers: baseTeachers,
                subjects: baseSubjects,
                rooms: baseRooms,
                timeSlots: baseTimeSlots,
              }),
              ...overrides,
            }
          : assemblePayload({
              classes: baseClasses,
              teachers: baseTeachers,
              subjects: baseSubjects,
              rooms: baseRooms,
              timeSlots: baseTimeSlots,
            }));

      const { organized, raw } = await generateAsync({ payload: body });

      // 2) Persist
      const classKeyToId = makeClassKeyToIdMap(organized);
      const organizedToUse = filterClassId
        ? filterOrganizedByClass(organized, filterClassId, classKeyToId)
        : organized;

      // Build normalized (trim/case-insensitive) name-to-ID lookup maps
      const norm = (s) =>
        String(s ?? "")
          .trim()
          .replace(/\s+/g, " ")
          .toLowerCase();
      const subjectNameToId = Object.fromEntries(
        (baseSubjects || [])
          .map((s) => [norm(s?.subject_name), s?.id])
          .filter(([k, v]) => k && v != null),
      );
      const teacherNameToEmpId = Object.fromEntries(
        (baseTeachers || [])
          .map((t) => [
            norm(t?.name),
            String(t?.emp_id ?? t?.id ?? t?.user_id ?? ""),
          ])
          .filter(([k, v]) => k && v),
      );
      const roomNameToId = Object.fromEntries(
        (baseRooms || [])
          .map((r) => [norm(r?.room_number ?? r?.name), r?.id])
          .filter(([k, v]) => k && v != null),
      );

      // Create a normalized copy of organized for mapping lookups
      const normalizeOrganizedNames = (org) => {
        const out = {};
        for (const [ck, daysObj] of Object.entries(org || {})) {
          out[ck] = {};
          for (const [dayName, timeObj] of Object.entries(daysObj || {})) {
            out[ck][dayName] = {};
            for (const [timeLabel, slot] of Object.entries(timeObj || {})) {
              if (!slot) {
                out[ck][dayName][timeLabel] = slot;
                continue;
              }
              out[ck][dayName][timeLabel] = {
                ...slot,
                ...(slot.subject_name != null && {
                  subject_name: norm(slot.subject_name),
                }),
                ...(slot.teacher_name != null && {
                  teacher_name: norm(slot.teacher_name),
                }),
                ...(slot.room_name != null && {
                  room_name: norm(slot.room_name),
                }),
              };
            }
          }
        }
        return out;
      };
      const organizedForMapping = normalizeOrganizedNames(organizedToUse);

      // Build validation sets to avoid FK violations
      const validSubjectIds = new Set(
        (baseSubjects || []).map((s) => String(s?.id)).filter(Boolean),
      );
      const validTeacherEmpIds = new Set(
        (baseTeachers || [])
          .map((t) => String(t?.emp_id ?? t?.id ?? t?.user_id ?? ""))
          .filter(Boolean),
      );
      const validRoomIds = new Set(
        (baseRooms || []).map((r) => String(r?.id)).filter(Boolean),
      );

      const rows = mapOrganizedToRows({
        organized: organizedForMapping,
        days,
        timeSlots: baseTimeSlots,
        classKeyToId,
        subjectNameToId,
        teacherNameToEmpId,
        roomNameToId,
        // Extra validation context (mapper may ignore; kept for future use)
        validSubjectIds,
        validTeacherEmpIds,
        validRoomIds,
      });

      // Filter rows by validated FK sets to prevent FK errors
      const filteredRows = (rows || []).filter(
        (r) =>
          validSubjectIds.has(String(r.subject_id)) &&
          validTeacherEmpIds.has(String(r.teacher_id)) &&
          validRoomIds.has(String(r.room_id)),
      );

      setLastOrganized(organizedToUse);
      setLastRows(filteredRows);

      // grace: allow no-op if no rows resolved
      if (!filteredRows.length) {
        // Console diagnostics to help identify why mapping produced 0 rows
        try {
          const keys = Object.keys(organizedToUse || {});
          const sampleKey = keys[0];
          const sampleDays = sampleKey
            ? Object.keys(organizedToUse[sampleKey] || {})
            : [];
          const firstDay = sampleDays[0];
          const sampleTimes = firstDay
            ? Object.keys(organizedToUse[sampleKey][firstDay] || {})
            : [];
          const sampleSlot =
            firstDay && sampleTimes[0]
              ? organizedToUse[sampleKey][firstDay][sampleTimes[0]]
              : null;
          // eslint-disable-next-line no-console
          console.warn(
            "No timetable rows generated from organized data. Likely time_slot mismatch (day or start_time/slot_index) or missing FKs. Diagnostics:",
            {
              classKeyToId,
              keys,
              sampleDays,
              sampleTimes: sampleTimes.slice(0, 6),
              sampleSlot,
              timeSlotsCount: Array.isArray(timeSlots) ? timeSlots.length : 0,
            },
          );
        } catch (e) {
          // ignore diagnostic errors
        }
        const result = {
          rowsInserted: 0,
          inserted: [],
          organized: organizedToUse,
          raw,
        };
        setLastInsertResult(result);
        return result;
      }

      const insertMode = callMode || mode || "upsert";
      const { data: inserted } = await insertEntriesAsync({
        rows: filteredRows,
        mode: insertMode,
      });

      const result = {
        rowsInserted: inserted?.length ?? rows.length,
        inserted,
        organized: organizedToUse,
        raw,
      };
      setLastInsertResult(result);
      return result;
    },
    [
      assemblePayload,
      classes,
      teachers,
      subjects,
      rooms,
      timeSlots,
      generateAsync,
      mapOrganizedToRows,
      insertEntriesAsync,
      days,
      mode,
      makeClassKeyToIdMap,
      filterOrganizedByClass,
    ],
  );

  return {
    // Base data/state
    data: { classes, teachers, subjects, rooms, timeSlots },
    isLoading,
    isError,
    error: lastError || error || null,

    // Status
    generating,
    persisting,
    isPending,

    // Last artifacts (for UI fallbacks)
    lastOrganized,
    lastRows,
    lastInsertResult,

    // Actions
    generateAndPersistAsync,

    // Low-level helpers & mutations exposed in case the UI needs them
    getTeacherName,
    getSubjectName,
    getRoomNumber,
    insertEntries,
    insertEntriesAsync,
    clearClassEntries,
    clearClassEntriesAsync,
  };
}
