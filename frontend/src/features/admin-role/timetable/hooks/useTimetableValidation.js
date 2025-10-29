/**
 * Timetable pre-insert validation and logging utilities.
 *
 * This module provides:
 * - Conflict detection for teacher/room/class double-bookings per time slot
 * - Helpful logging that enriches conflicts with time slot details
 * - A single validateTimetableRows() function to run end-to-end checks pre-insert
 * - A React hook (useTimetableValidation) that memoizes helpers for convenient usage
 *
 * Usage (pure functions):
 *   import {
 *     validateTimetableRows,
 *     findConflicts,
 *     buildTimeSlotLookup,
 *     logConflicts,
 *     logDuplicateTeacherEmpIds,
 *   } from "./useTimetableValidation";
 *
 * Usage (hook):
 *   const { validate, findConflicts, logConflicts } = useTimetableValidation(timeSlots, teacherProfiles);
 *   validate(timetableRows); // throws if conflicts when throwOnConflict=true (default)
 */

/**
 * @typedef {Object} TimeSlot
 * @property {number|string} id
 * @property {string} [day]
 * @property {number} [slot]
 * @property {string} [start_time]
 * @property {string} [end_time]
 */

/**
 * @typedef {Object} TimetableRow
 * @property {string} class_name
 * @property {number|string} time_slot_id
 * @property {string} subject_name
 * @property {string|number} teacher_name  // Note: stores teacher emp_id in your schema
 * @property {string} room_id
 * @property {string} type                  // 'Theory' | 'Lab' | etc
 * @property {number|string} department_id
 */

/**
 * @typedef {Object} ConflictItem
 * @property {string} key
 * @property {TimetableRow[]} rows
 */

/**
 * @typedef {Object} Conflicts
 * @property {ConflictItem[]} teacherConflicts
 * @property {ConflictItem[]} roomConflicts
 * @property {ConflictItem[]} classConflicts
 */

import { useMemo, useRef } from "react";

/**
 * Build a fast lookup from time_slot_id to its metadata for logging and debugging.
 * @param {TimeSlot[]} timeSlots
 * @returns {Map<number|string, { day: string|null, slot: number|null, start_time: string|null, end_time: string|null }>}
 */
export function buildTimeSlotLookup(timeSlots) {
	const byId = new Map();
	for (const ts of Array.isArray(timeSlots) ? timeSlots : []) {
		if (!ts || ts.id === undefined || ts.id === null) continue;
		byId.set(ts.id, {
			day: ts.day ?? null,
			slot: typeof ts.slot === "number" ? ts.slot : (ts.slot ?? null),
			start_time: ts.start_time ?? null,
			end_time: ts.end_time ?? null,
		});
	}
	return byId;
}

/**
 * Find conflicts across teacher, room, and class composite constraints per time slot.
 * @param {TimetableRow[]} rows
 * @returns {Conflicts}
 */
export function findConflicts(rows) {
	const teacherMap = new Map();
	const roomMap = new Map();
	const classMap = new Map();

	/** @param {Map<string, TimetableRow[]>} map */
	const push = (map, key, row) => {
		if (!key) return;
		const arr = map.get(key);
		if (arr) arr.push(row);
		else map.set(key, [row]);
	};

	for (const r of Array.isArray(rows) ? rows : []) {
		// Composite keys (stringify to be safe with numeric IDs)
		const tKey =
			r?.teacher_name != null && r?.time_slot_id != null
				? `${String(r.teacher_name)}::${String(r.time_slot_id)}`
				: null;
		const rKey =
			r?.room_id && r?.time_slot_id != null
				? `${String(r.room_id)}::${String(r.time_slot_id)}`
				: null;
		const cKey =
			r?.class_name && r?.time_slot_id != null
				? `${String(r.class_name)}::${String(r.time_slot_id)}`
				: null;

		push(teacherMap, tKey, r);
		push(roomMap, rKey, r);
		push(classMap, cKey, r);
	}

	const toConflictList = (map) =>
		[...map.entries()]
			.filter(([, arr]) => (arr?.length ?? 0) > 1)
			.map(([key, rows]) => ({ key, rows }));

	return {
		teacherConflicts: toConflictList(teacherMap),
		roomConflicts: toConflictList(roomMap),
		classConflicts: toConflictList(classMap),
	};
}

/**
 * Describe a time slot for readable logs.
 * @param {number|string} time_slot_id
 * @param {Map<number|string, { day: string|null, slot: number|null, start_time: string|null, end_time: string|null }>} timeSlotById
 * @returns {string}
 */
export function describeTimeSlot(time_slot_id, timeSlotById) {
	const ts = timeSlotById?.get?.(time_slot_id);
	if (!ts) return `time_slot_id=${String(time_slot_id)}`;
	const time =
		ts.start_time && ts.end_time
			? `${ts.start_time}-${ts.end_time}`
			: (ts.start_time ??
				(ts.slot != null ? `slot#${ts.slot}` : "time=N/A"));
	return `${ts.day ?? "?"} (${time}) [id=${String(time_slot_id)}]`;
}

/**
 * Log conflicts with enriched information for debugging.
 * @param {Conflicts} conflicts
 * @param {Map<number|string, { day: string|null, slot: number|null, start_time: string|null, end_time: string|null }>} timeSlotById
 */
export function logConflicts(conflicts, timeSlotById) {
	if (!conflicts) return;

	const { teacherConflicts, roomConflicts, classConflicts } = conflicts;

	const logBucket = (label, list, keyLabel) => {
		if (!Array.isArray(list) || list.length === 0) return;
		// Group logs for readability in devtools
		// eslint-disable-next-line no-console
		console.group(
			`[Timetable Validation] ${label} conflicts: ${list.length}`,
		);
		for (const item of list) {
			const [name, tsIdStr] = String(item.key).split("::");
			const tsId = isNaN(Number(tsIdStr)) ? tsIdStr : Number(tsIdStr);
			// eslint-disable-next-line no-console
			console.warn(
				`${keyLabel}=${name} @ ${describeTimeSlot(tsId, timeSlotById)} → ${item.rows.length} entries`,
				item.rows.map((r) => ({
					class_name: r.class_name,
					subject_name: r.subject_name,
					room_id: r.room_id,
					type: r.type,
					teacher_name: r.teacher_name,
				})),
			);
		}
		// eslint-disable-next-line no-console
		console.groupEnd();
	};

	logBucket("Teacher", teacherConflicts, "teacher");
	logBucket("Room", roomConflicts, "room");
	logBucket("Class", classConflicts, "class");
}

/**
 * Warn if multiple teacher names map to the same employee ID.
 * This can introduce unexpected duplicates when rows store teacher_name as emp_id.
 * @param {{ name: string, emp_id: string|number }[]} teacher_profiles
 */
export function logDuplicateTeacherEmpIds(teacher_profiles) {
	const byEmp = new Map();
	for (const t of Array.isArray(teacher_profiles) ? teacher_profiles : []) {
		const emp = t?.emp_id;
		if (emp == null) continue;
		const list = byEmp.get(emp) || [];
		if (t?.name) list.push(String(t.name));
		byEmp.set(emp, list);
	}
	for (const [emp, names] of byEmp.entries()) {
		const unique = [...new Set(names)];
		if (unique.length > 1) {
			// eslint-disable-next-line no-console
			console.warn(
				`[Timetable Validation] Multiple teacher names map to the same emp_id=${String(emp)}:`,
				unique,
			);
		}
	}
}

/**
 * Validate timetable rows for pre-insert conflicts and optionally throw a descriptive error.
 *
 * @param {Object} args
 * @param {TimetableRow[]} args.rows
 * @param {TimeSlot[]} [args.timeSlots]
 * @param {boolean} [args.throwOnConflict=true]
 * @param {boolean} [args.log=true]
 * @param {{ name: string, emp_id: string|number }[]} [args.teacher_profiles]
 * @returns {{ conflicts: Conflicts, totalConflicts: number }}
 * @throws {Error} when throwOnConflict is true and conflicts found
 */
/**
 * Ensure all teacher names in rows exist within the provided teacherProfiles list.
 * Pure function (except for optional console logging).
 *
 * @param {TimetableRow[]} rows
 * @param {{ name: string, emp_id: string|number }[]} [teacherProfiles]
 * @param {{ throwOnMissing?: boolean, log?: boolean }} [options]
 * @returns {{ missingNames: string[], details: Array<{ teacher_name: string, class_name: string, time_slot_id: number|string|null }> }}
 * @throws {Error} when throwOnMissing is true and missing names are found
 */
export function ensureTeacherNamesExist(
	rows,
	teacherProfiles = [],
	{ throwOnMissing = true, log = true } = {},
) {
	const validNames = new Set(
		(Array.isArray(teacherProfiles) ? teacherProfiles : [])
			.map((p) => p?.name)
			.filter(Boolean)
			.map(String),
	);

	const missingSet = new Set();
	const details = [];

	for (const r of Array.isArray(rows) ? rows : []) {
		const name = r?.teacher_name;
		const key = name != null ? String(name) : "";
		if (!key || !validNames.has(key)) {
			if (key) missingSet.add(key);
			details.push({
				teacher_name: key,
				class_name: r?.class_name ?? "",
				time_slot_id: r?.time_slot_id ?? null,
			});
		}
	}

	const missingNames = [...missingSet];

	if (log && missingNames.length > 0) {
		console.group(
			`[Timetable Validation] Missing teacher_profile.name entries: ${missingNames.length}`,
		);
		console.warn("Missing teacher names:", missingNames);
		console.warn("Examples:", details.slice(0, 10));
		console.groupEnd();
	}

	if (throwOnMissing && missingNames.length > 0) {
		const sample = missingNames.slice(0, 3).join(", ");
		throw new Error(
			`Unknown teacher name(s) for department: ${missingNames.length} missing. Samples: ${sample}`,
		);
	}

	return { missingNames, details };
}

export function validateTimetableRows({
	rows,
	timeSlots = [],
	throwOnConflict = true,
	log = true,
	teacher_profiles = [],
}) {
	// Optional sanity check for teacher profiles
	if (log && Array.isArray(teacher_profiles) && teacher_profiles.length > 0) {
		logDuplicateTeacherEmpIds(teacher_profiles);
	}

	const timeSlotById = buildTimeSlotLookup(timeSlots);
	const conflicts = findConflicts(rows);
	const totalConflicts =
		(conflicts.teacherConflicts?.length || 0) +
		(conflicts.roomConflicts?.length || 0) +
		(conflicts.classConflicts?.length || 0);

	if (log && totalConflicts > 0) {
		logConflicts(conflicts, timeSlotById);
	}

	if (throwOnConflict && totalConflicts > 0) {
		const err = new Error(
			`Validation failed: ${conflicts.teacherConflicts.length} teacher, ${conflicts.roomConflicts.length} room, ${conflicts.classConflicts.length} class conflicts detected.`,
		);
		// @ts-ignore annotate details for upstream handling
		err.__timetableConflicts = conflicts;
		throw err;
	}

	return { conflicts, totalConflicts };
}

/**
 * React hook wrapper that memoizes the timeSlot lookup and provides a simple validate() API.
 *
 * @param {TimeSlot[]} timeSlots
 * @param {{ name: string, emp_id: string|number }[]} [teacher_profiles]
 * @param {{ log?: boolean, throwOnConflict?: boolean }} [defaults]
 * @returns {{
 *   validate: (rows: TimetableRow[], options?: { log?: boolean, throwOnConflict?: boolean }) => { conflicts: Conflicts, totalConflicts: number },
 *   findConflicts: (rows: TimetableRow[]) => Conflicts,
 *   logConflicts: (conflicts: Conflicts) => void,
 *   describeTimeSlot: (time_slot_id: number|string) => string,
 * }}
 */
export default function useTimetableValidation(
	timeSlots,
	teacher_profiles = [],
	defaults = { log: true, throwOnConflict: true },
) {
	const timeSlotById = useMemo(
		() => buildTimeSlotLookup(timeSlots),
		[timeSlots],
	);
	const defaultOptionsRef = useRef(defaults);
	defaultOptionsRef.current = defaults;

	return {
		validate: (rows, options = {}) =>
			validateTimetableRows({
				rows,
				timeSlots,
				teacher_profiles,
				log: options.log ?? defaultOptionsRef.current.log ?? true,
				throwOnConflict:
					options.throwOnConflict ??
					defaultOptionsRef.current.throwOnConflict ??
					true,
			}),
		findConflicts: (rows) => findConflicts(rows),
		logConflicts: (conflicts) => logConflicts(conflicts, timeSlotById),
		describeTimeSlot: (timeSlotId) =>
			describeTimeSlot(timeSlotId, timeSlotById),
		ensureTeacherNamesExist: (rows, options = {}) =>
			ensureTeacherNamesExist(rows, teacher_profiles, options),
	};
}
