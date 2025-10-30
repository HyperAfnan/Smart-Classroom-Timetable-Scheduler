import React, { useEffect, useMemo, useState, useCallback } from "react";
import useTimetableViewer from "@/features/admin-role/timetableViewer/hooks/useTimetableViewer.js";
import { TimetableCell } from "./TimetableCell";
import { DAY_ORDER } from "../constants";

/**
 * TimetableGrid
 *
 * Props:
 * - departmentId: string | number (required)
 *
 * Integrates useTimetableViewer to fetch:
 * - classes (for row labels; falls back to entries-derived list if empty)
 * - time_slots (for day headers and per-day slot ordering)
 * - timetable_entries (joined with time_slots to fill cells)
 *
 * Simplifications:
 * - Merged day/slot derivation into a single useMemo returning days, slotsByDay, and breakIndexByDay
 * - Replaced nested object entry index with a composite-key Map for O(1) lookups
 * - Inlined tiny helpers like isDayActive and timeLabel
 */
export function TimetableGrid({
	departmentId,
	breakAfterTime,
	breakAfterSlotIndex,
	breakLabel = "Break",
}) {
	const { fetchAll } = useTimetableViewer();

	const [classes, setClasses] = useState([]);
	const [timeSlots, setTimeSlots] = useState([]);
	const [timetableEntries, setTimetableEntries] = useState([]);
	const [selectedDay, setSelectedDay] = useState(null);

	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState(null);

	// Normalize time values to "HH:MM" for consistent keys
	const normalizeToHHMM = useCallback((val) => {
		if (!val) return val;
		let str = String(val);
		if (str.length >= 5 && str[2] === ":") str = str.slice(0, 5);
		if (/^\d:\d{2}$/.test(str)) return "0" + str;
		return str;
	}, []);

	const refresh = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		try {
			const { classes, timeSlots, timetableEntries } =
				await fetchAll(departmentId);
			setClasses(classes || []);
			setTimeSlots(timeSlots || []);
			setTimetableEntries(timetableEntries || []);
		} catch (err) {
			setLoadError(
				err instanceof Error
					? err
					: new Error("Failed to load timetable data"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [fetchAll]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const handleDayClick = (day) => {
		setSelectedDay((prev) => (prev === day ? null : day));
	};

	// Build per-day grouped slots and compute a per-day break index (no extra column)
	const { days, slotsByDay, breakIndexByDay } = useMemo(() => {
		// Group slots by day
		const grouped = {};
		for (const ts of timeSlots || []) {
			const d = ts?.day;
			if (!d) continue;
			if (!grouped[d]) grouped[d] = [];
			grouped[d].push(ts);
		}

		// Determine ordered days based on DAY_ORDER
		const orderedDays = Object.keys(grouped).sort(
			(a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b),
		);

		// Sort slots within each day: by numeric slot, then by start_time, else by id
		for (const d of orderedDays) {
			grouped[d].sort((a, b) => {
				const aHas = typeof a.slot === "number";
				const bHas = typeof b.slot === "number";
				if (aHas && bHas) return a.slot - b.slot;
				if (aHas && !bHas) return -1;
				if (!aHas && bHas) return 1;
				if (a.start_time && b.start_time) {
					return a.start_time.localeCompare(b.start_time);
				}
				return String(a.id).localeCompare(String(b.id));
			});
		}

		// Determine a break index per day (mark an existing slot as break)
		const breakIndexByDay = {};
		for (const d of orderedDays) {
			const slots = grouped[d] || [];
			let idxToMark = null;

			// Priority 1: mark slot whose start_time matches breakAfterTime
			if (breakAfterTime) {
				const target = normalizeToHHMM(breakAfterTime);
				const foundIdx = slots.findIndex(
					(s) => normalizeToHHMM(s?.start_time) === target,
				);
				if (foundIdx !== -1) {
					idxToMark = foundIdx;
				}
			}

			// Priority 2: mark by provided slot index
			if (
				idxToMark == null &&
				typeof breakAfterSlotIndex === "number" &&
				breakAfterSlotIndex >= 0
			) {
				idxToMark = Math.min(
					Math.max(0, breakAfterSlotIndex),
					Math.max(0, slots.length - 1),
				);
			}

			// Priority 3: fallback to midpoint
			if (idxToMark == null) {
				idxToMark = Math.floor((grouped[d]?.length ?? 0) / 2);
			}

			breakIndexByDay[d] = idxToMark;
		}

		return { days: orderedDays, slotsByDay: grouped, breakIndexByDay };
	}, [timeSlots, breakAfterTime, breakAfterSlotIndex, normalizeToHHMM]);

	// Index entries by start time (primary) and by numeric slot (fallback)
	const entryByTime = useMemo(() => {
		const m = new Map();
		for (const e of timetableEntries || []) {
			const cls = e?.class_name ?? "Unknown";
			const day = e?.time_slots?.day;
			const start = normalizeToHHMM(e?.time_slots?.start_time);
			if (!day || !start) continue;
			m.set(`${cls}|${day}|${start}`, e);
		}
		return m;
	}, [timetableEntries, normalizeToHHMM]);

	const entryBySlot = useMemo(() => {
		const m = new Map();
		for (const e of timetableEntries || []) {
			const cls = e?.class_name ?? "Unknown";
			const day = e?.time_slots?.day;
			const slotNum =
				typeof e?.time_slots?.slot === "number" ? e.time_slots.slot : null;
			if (!day || slotNum == null) continue;
			m.set(`${cls}|${day}|${slotNum}`, e);
		}
		return m;
	}, [timetableEntries]);

	// Class labels: prefer fetched classes, fallback to entries-derived class_name list
	const classLabels = useMemo(() => {
		const fromClasses = (classes || [])
			.map((c) =>
				(c?.class_name ?? c?.name ?? `Class ${c?.id ?? ""}`).trim(),
			)
			.filter(Boolean);
		if (fromClasses.length > 0) {
			return Array.from(new Set(fromClasses));
		}
		const fromEntries = new Set(
			(timetableEntries || []).map((e) => e?.class_name ?? "Unknown"),
		);
		return Array.from(fromEntries);
	}, [classes, timetableEntries]);

	const hasData = days.length > 0 && classLabels.length > 0;

	return (
		<div className="border border-gray-300 rounded-2xl p-8 bg-white shadow-sm">
			{/* Header / Actions */}
			<div className="mb-6 flex items-center justify-between gap-4">
				<h1 className="text-gray-800 text-xl">Timetable</h1>
				<div className="flex items-center gap-2">
					<button
						onClick={refresh}
						disabled={isLoading}
						className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{isLoading ? "Refreshing..." : "Refresh"}
					</button>
				</div>
			</div>

			{loadError && (
				<div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
					{loadError.message ||
						"Something went wrong while loading the timetable."}
				</div>
			)}

			{isLoading && !hasData ? (
				<div className="text-gray-600">Loading timetable...</div>
			) : !hasData ? (
				<div className="text-gray-600">No timetable data available.</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full border-collapse">
						<thead>
							{/* Day headers row */}
							<tr>
								<th className="border border-gray-300 p-2 min-w-[80px] bg-gray-100"></th>
								{days.map((day) => {
									const colSpan = (slotsByDay[day] || []).length || 1;
									const active =
										selectedDay === null || selectedDay === day;
									return (
										<th
											key={day}
											colSpan={colSpan}
											onClick={() => handleDayClick(day)}
											className={`border border-gray-300 p-3 text-center cursor-pointer transition-all duration-300 ${
												active
													? "bg-gradient-to-br from-[#FF8BA0] to-[#FF6B87] hover:from-[#FF9BAF] hover:to-[#FF7B97]"
													: "bg-gradient-to-br from-gray-300 to-gray-400 opacity-40"
											}`}
										>
											<span
												className={
													active ? "text-white" : "text-gray-500"
												}
											>
												{day.toLowerCase()}
											</span>
										</th>
									);
								})}
							</tr>

							{/* Time slots row */}
							<tr>
								<th className="border border-gray-300 p-2 bg-gray-100"></th>
								{days.flatMap((day) => {
									const slots = slotsByDay[day] || [];
									const breakIndex = breakIndexByDay[day] ?? -1;
									const active =
										selectedDay === null || selectedDay === day;
									return slots.map((ts, idx) => {
										const isBreak = idx === breakIndex;
										return (
											<th
												key={`${day}-${idx}`}
												className={`border border-gray-300 p-2 text-xs min-w-[100px] transition-all duration-300 ${
													active
														? isBreak
															? "bg-[#FFF4E6]"
															: "bg-[#E8F4FD]"
														: "bg-gray-200 opacity-40"
												}`}
											>
												<div className="flex flex-col items-center gap-1">
													<span
														className={
															active
																? isBreak
																	? "text-[#D97706]/70 text-[10px]"
																	: "text-[#0284C7]/70 text-[10px]"
																: "text-gray-400/70 text-[10px]"
														}
													>
														{isBreak
															? (breakLabel ?? "Break")
															: ts?.start_time && ts?.end_time
																? `${normalizeToHHMM(ts.start_time)}-${normalizeToHHMM(ts.end_time)}`
																: typeof ts?.slot === "number"
																	? `Slot ${ts.slot + 1}`
																	: "Time"}
													</span>
												</div>
											</th>
										);
									});
								})}
							</tr>
						</thead>

						<tbody>
							{classLabels.map((className) => (
								<tr key={className}>
									{/* Class label cell */}
									<td className="border border-gray-300 p-3 text-center bg-[#F5F5F5]">
										<span className="text-gray-700">{className}</span>
									</td>

									{/* Lecture cells */}
									{days.flatMap((day) => {
										const slots = slotsByDay[day] || [];
										const breakIndex = breakIndexByDay[day] ?? -1;
										const active =
											selectedDay === null || selectedDay === day;
										return slots.map((ts, idx) => {
											const isBreak = idx === breakIndex;

											if (isBreak) {
												return (
													<td
														key={`${className}-${day}-${idx}`}
														className={`border border-gray-300 text-xs h-[90px] transition-all duration-300 ${
															active
																? "bg-[#FFFBF5]"
																: "bg-gray-100 opacity-40"
														}`}
													>
														<TimetableCell
															lecture={null}
															isBreak={true}
														/>
													</td>
												);
											}

											// Determine matching time/slot for lookup (shift after break)
											const matchHHMM =
												breakIndex !== -1 && idx > breakIndex
													? normalizeToHHMM(
															slots[idx - 1]?.start_time,
														)
													: normalizeToHHMM(ts?.start_time);
											const matchSlot =
												breakIndex !== -1 && idx > breakIndex
													? slots[idx - 1]?.slot
													: ts?.slot;
											const entry =
												(matchHHMM
													? entryByTime.get(
															`${className}|${day}|${matchHHMM}`,
														)
													: null) ??
												(typeof matchSlot === "number"
													? entryBySlot.get(
															`${className}|${day}|${matchSlot}`,
														)
													: null) ??
												null;

											return (
												<td
													key={`${className}-${day}-${idx}`}
													className={`border border-gray-300 text-xs h-[90px] transition-all duration-300 ${
														active
															? "bg-[#FAFBFC]"
															: "bg-gray-100 opacity-40"
													}`}
												>
													<TimetableCell
														lecture={
															entry
																? {
																		subject:
																			entry.subject_name ??
																			entry.subject ??
																			"—",
																		teacher:
																			entry.teacher_name ??
																			entry.teacher ??
																			"—",
																		room:
																			entry.room_name ??
																			entry.room ??
																			String(
																				entry.room_id ??
																					"—",
																			),
																		type:
																			entry.type ??
																			"Lecture",
																	}
																: null
														}
														isBreak={false}
													/>
												</td>
											);
										});
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
