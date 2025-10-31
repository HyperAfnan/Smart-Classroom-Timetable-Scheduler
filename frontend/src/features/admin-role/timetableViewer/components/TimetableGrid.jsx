import { useState, useCallback } from "react";
import useTimetableStructure from "../hooks/useTimetableStructure.js";
import TimetableHeader from "./TimetableHeader.jsx";
import TimetableBody from "./TimetableBody.jsx";
import useTimetableViewer from "../hooks/useTimetableViewer.js";
import useClassLabels from "../hooks/useClassLabels.js";
import { Table } from "@/components/ui/table";

/**
 * TimetableGrid
 *
 * Main container that composes:
 * - Data layer: useTimetableData to fetch classes, timeSlots, timetableEntries
 * - Logic layer: useTimetableStructure to compute days, slotsByDay, breakIndexByDay
 * - UI layer: TimetableHeader + TimetableBody for rendering
 *
 * Props:
 * - breakAfterTime?: string (e.g., "12:55")
 * - breakAfterSlotIndex?: number
 * - breakLabel?: string = "Break"
 */
export function TimetableGrid({
	breakAfterTime,
	breakAfterSlotIndex,
	breakLabel = "Break",
}) {
	const { classes, timeSlots, timetableEntries, isLoading, isError, error } =
		useTimetableViewer();

	const { days, slotsByDay, breakIndexByDay } = useTimetableStructure(
		timeSlots,
		{
			breakAfterTime,
			breakAfterSlotIndex,
			entriesForFallback: timetableEntries,
		},
	);

	const [selectedDay, setSelectedDay] = useState(null);
	const handleDayClick = useCallback(
		(day) => setSelectedDay((prev) => (prev === day ? null : day)),
		[],
	);
	const isActiveDay = useCallback(
		(day) => selectedDay === null || selectedDay === day,
		[selectedDay],
	);

	const classLabels = useClassLabels(classes, timetableEntries);
	return (
		<div className="border border-border rounded-2xl p-8 bg-card shadow-sm">
			{/* Title/Actions */}
			<div className="mb-6 flex items-center justify-between gap-4">
				<h1 className="text-foreground text-xl">Timetable</h1>
			</div>

			{isError ? (
				<div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
					{error?.message ||
						"Something went wrong while loading the timetable."}
				</div>
			) : isLoading ? (
				<div className="text-gray-600">Loading timetable...</div>
			) : (
				<div className="overflow-x-auto">
					<Table className="w-full border-collapse">
						<TimetableHeader
							days={days}
							slotsByDay={slotsByDay}
							breakIndexByDay={breakIndexByDay}
							selectedDay={selectedDay}
							onDayClick={handleDayClick}
							breakLabel={breakLabel}
						/>
						<TimetableBody
							days={days}
							slotsByDay={slotsByDay}
							breakIndexByDay={breakIndexByDay}
							classLabels={classLabels}
							timetableEntries={timetableEntries}
							selectedDay={selectedDay}
							isActiveDay={isActiveDay}
						/>
					</Table>
				</div>
			)}
		</div>
	);
}

export default TimetableGrid;
