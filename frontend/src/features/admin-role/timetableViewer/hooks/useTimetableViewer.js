import { useQuery } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where, orderBy, documentId } from "firebase/firestore";
import { queryKeys } from "@/shared/queryKeys";
import { useUser } from "@/features/auth/hooks/useAuth";

/**
 * Timetable Viewer data hook
 *
 * Provides functions that fetch and cache (via React Query) the data needed by the timetable viewer:
 * - classes
 * - time_slots
 * - timetable_entries (joined with time_slots)
 *
 */

async function fetchClasses(departmentId) {
  const q = query(
    collection(db, "classes"),
    where("departmentId", "==", departmentId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  const classes = [];
  snapshot.forEach((doc) => {
    classes.push({ id: doc.id, ...doc.data() });
  });
  return classes;
}

async function fetchTimeslots(departmentId) {
  const q = query(
    collection(db, "time_slots"),
    where("departmentId", "==", departmentId),
    orderBy("day", "asc"),
    orderBy("slot", "asc")
  );
  const snapshot = await getDocs(q);
  const slots = [];
  snapshot.forEach((doc) => {
    slots.push({ id: doc.id, ...doc.data() });
  });
  return slots;
}

async function fetchTimetableEntries(departmentId) {
  // 1. Fetch Entries
  const entriesQ = query(
    collection(db, "timetable_entries"),
    where("departmentId", "==", departmentId)
  );
  const entriesSnapshot = await getDocs(entriesQ);
  const entries = [];
  const timeSlotIds = new Set();
  
  entriesSnapshot.forEach((doc) => {
    const data = doc.data();
    entries.push({ id: doc.id, ...data });
    if (data.timeSlotId) timeSlotIds.add(data.timeSlotId);
  });

  // 2. Fetch TimeSlots (if any entries exist)
  if (timeSlotIds.size === 0) return entries;
  
  // Firestore 'in' query supports max 10 items, so we might need to batch or just fetch all slots for dept like above
  // Since we already have a fetchTimeSlots function that fetches all for dept, we could reuse that logic or cache
  // But strictly here, let's fetch all slots for the department to be safe and join, 
  // as entries might reference slots we want to know details of.
  
  const slotsQ = query(
    collection(db, "time_slots"),
     where("departmentId", "==", departmentId)
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

export default function useTimetableViewer() {
  const { user } = useUser();
  const departmentId = user?.departmentId;

  const classesQuery = useQuery({
    queryKey: queryKeys.classes.all,
    staleTime: 60_000, // 1 minute
    queryFn: () => fetchClasses(departmentId),
  });

  const timeSlotsQuery = useQuery({
    queryKey: queryKeys.timeSlots.all,
    staleTime: 60_000,
    queryFn: () => fetchTimeslots(departmentId),
  });

  const timetableQuery = useQuery({
    queryKey: [queryKeys.timetableEntries.all],
    queryFn: () => fetchTimetableEntries(departmentId),
    staleTime: 60_000,
  });

  return {
    isLoading:
      timetableQuery.isPending ||
      timeSlotsQuery.isPending ||
      classesQuery.isPending,
    isError:
      timetableQuery.isError || timeSlotsQuery.isError || classesQuery.isError,
    error: timetableQuery.error || timeSlotsQuery.error || classesQuery.error,
    timetableEntries: timetableQuery.data,
    timeSlots: timeSlotsQuery.data,
    classes: classesQuery.data,
  };
}
