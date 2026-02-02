import { useQuery } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import queryKeys from "@/shared/queryKeys.js";

const EMPTY = Object.freeze([]);

async function fetchTimetableEntries(department_id) {
  // 1. Fetch Entires
  const entriesQ = query(
      collection(db, "timetable_entries"),
      where("departmentId", "==", department_id)
  );
  const entriesSnapshot = await getDocs(entriesQ);
  const entries = [];
  const timeSlotIds = new Set();
  
  entriesSnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({ id: doc.id, ...data });
      if (data.timeSlotId) timeSlotIds.add(data.timeSlotId);
  });

  // 2. Fetch TimeSlots (if any)
  if (timeSlotIds.size === 0) return entries;
  
  const slotsQ = query(
      collection(db, "time_slots"),
      where("departmentId", "==", department_id)
  );
  const slotsSnapshot = await getDocs(slotsQ);
  const slotsMap = {};
  slotsSnapshot.forEach((doc) => {
      slotsMap[doc.id] = { id: doc.id, ...doc.data() };
  });

  // 3. Join
  const joinedEntries = entries.map(entry => ({
      ...entry,
      time_slots: slotsMap[entry.timeSlotId] || null
  }));

  return joinedEntries;
}

export default function useTimetable(department_id, options = {}) {
  const timetableQueries = useQuery({
    queryKey: queryKeys.timetableEntries.detail(department_id),
    queryFn: () => fetchTimetableEntries(department_id),
    staleTime: 60_000_000,
    ...options,
  });
  return {
    timetable: timetableQueries.data ?? EMPTY,
    isLoading: timetableQueries.isLoading,
    isError: timetableQueries.isError,
    error: timetableQueries.error,
    refresh: timetableQueries.refetch,
    timetableQueries,
  };
}
