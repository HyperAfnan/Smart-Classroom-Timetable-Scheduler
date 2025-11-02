import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/queryKeys";

export default function useClassWiseTimetable(classId) {
  const { data: timetableForClass } = useQuery({
    queryKey: queryKeys.timetableEntries.byClass(classId),
    enabled: false,
  });

  return timetableForClass || [];
}
