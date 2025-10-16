"""
Statistics service for the Timetable API.

This module is intentionally lightweight and decoupled from FastAPI so it can be
reused by services and tests without introducing any side effects. It provides
helper methods to compute high-level statistics from the timetable ndarray
returned by the GA generator.

Expected timetable shape:
    (NUM_CLASSES, DAYS, SLOTS_PER_DAY, 3)
Where the innermost vector holds:
    [subject_id, teacher_id, room_id]
and a subject_id of -1 indicates a free slot.

None of these helpers mutate inputs. They are safe to call multiple times.

Example:
    import numpy as np
    from timetable_api.app.services.statistics import TimetableStatisticsService

    tt = np.full((3, 5, 6, 3), -1, dtype=int)
    stats = TimetableStatisticsService.compute_basic(tt)
    print(stats)  # {'total_slots': 90, 'occupied_slots': 0, 'free_slots': 90}
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np


class TimetableStatisticsService:
    """
    Compute statistics on GA-produced timetables.

    All methods treat any cell where subject_id == -1 as unoccupied.
    """

    @staticmethod
    def compute_basic(tt: np.ndarray) -> Dict[str, int]:
        """
        Basic utilization numbers:
        - total_slots: NUM_CLASSES * DAYS * SLOTS_PER_DAY
        - occupied_slots: count of slots with subject_id != -1
        - free_slots: total_slots - occupied_slots
        """
        if tt.ndim != 4 or tt.shape[-1] < 1:
            raise ValueError(
                "Invalid timetable shape. Expected (C, D, S, 3) with subject at index 0."
            )

        num_classes, days, slots_per_day, _ = tt.shape
        total_slots = int(num_classes * days * slots_per_day)
        occupied_slots = int(np.count_nonzero(tt[:, :, :, 0] != -1))
        free_slots = int(total_slots - occupied_slots)

        return {
            "total_slots": total_slots,
            "occupied_slots": occupied_slots,
            "free_slots": free_slots,
        }

    @staticmethod
    def teacher_workload(
        tt: np.ndarray, total_teachers: Optional[int] = None
    ) -> List[int]:
        """
        Compute total assigned hours per teacher across the timetable.

        Args:
            tt: Timetable array (C, D, S, 3).
            total_teachers: If provided, the result is padded/truncated to this size.
                            Otherwise, it is inferred from the max teacher_id present.

        Returns:
            List of length `total_teachers` (or inferred size) with per-teacher hours.
        """
        if tt.ndim != 4 or tt.shape[-1] < 2:
            raise ValueError(
                "Invalid timetable shape. Expected (C, D, S, 3) with teacher at index 1."
            )

        subjects = tt[:, :, :, 0]
        teachers = tt[:, :, :, 1]

        # Mask free slots
        mask = subjects != -1
        assigned_teachers = teachers[mask]
        if assigned_teachers.size == 0:
            size = total_teachers if total_teachers is not None else 0
            return [0] * int(size)

        inferred_size = int(assigned_teachers.max()) + 1
        size = int(total_teachers) if total_teachers is not None else inferred_size
        counts = np.bincount(assigned_teachers, minlength=size)
        return counts.tolist()

    @staticmethod
    def subject_distribution(
        tt: np.ndarray, num_subjects: Optional[int] = None
    ) -> List[int]:
        """
        Count assigned hours per subject across all classes/days/slots.

        Args:
            tt: Timetable array (C, D, S, 3).
            num_subjects: If provided, pad/truncate output to this length; otherwise inferred.

        Returns:
            List of length `num_subjects` (or inferred) with per-subject counts.
        """
        if tt.ndim != 4 or tt.shape[-1] < 1:
            raise ValueError(
                "Invalid timetable shape. Expected (C, D, S, 3) with subject at index 0."
            )

        subjects = tt[:, :, :, 0].ravel()
        subjects = subjects[subjects >= 0]  # ignore free slots

        if subjects.size == 0:
            size = num_subjects if num_subjects is not None else 0
            return [0] * int(size)

        inferred = int(subjects.max()) + 1
        size = int(num_subjects) if num_subjects is not None else inferred
        counts = np.bincount(subjects, minlength=size)
        return counts.tolist()

    @staticmethod
    def room_utilization(
        tt: np.ndarray, total_rooms: Optional[int] = None
    ) -> List[int]:
        """
        Count assigned hours per room across the timetable.

        Args:
            tt: Timetable array (C, D, S, 3).
            total_rooms: If provided, pad/truncate output; otherwise inferred.

        Returns:
            List of length `total_rooms` (or inferred) with per-room counts.
        """
        if tt.ndim != 4 or tt.shape[-1] < 3:
            raise ValueError(
                "Invalid timetable shape. Expected (C, D, S, 3) with room at index 2."
            )

        subjects = tt[:, :, :, 0]
        rooms = tt[:, :, :, 2]

        mask = subjects != -1
        used_rooms = rooms[mask]
        if used_rooms.size == 0:
            size = total_rooms if total_rooms is not None else 0
            return [0] * int(size)

        inferred = int(used_rooms.max()) + 1
        size = int(total_rooms) if total_rooms is not None else inferred
        counts = np.bincount(used_rooms, minlength=size)
        return counts.tolist()

    @staticmethod
    def summarize(
        tt: np.ndarray,
        *,
        total_teachers: Optional[int] = None,
        num_subjects: Optional[int] = None,
        total_rooms: Optional[int] = None,
        include_breakdowns: bool = True,
    ) -> Dict[str, Any]:
        """
        Produce a combined summary dict suitable for API responses or logs.

        Args:
            tt: Timetable array (C, D, S, 3).
            total_teachers: Optional fixed size for teacher workloads.
            num_subjects: Optional fixed size for subject distribution.
            total_rooms: Optional fixed size for room utilization.
            include_breakdowns: Whether to include per-teacher/subject/room lists.

        Returns:
            Dictionary containing `basic` stats and optionally `breakdowns`.
        """
        summary: Dict[str, Any] = {
            "basic": TimetableStatisticsService.compute_basic(tt),
        }

        if include_breakdowns:
            summary["breakdowns"] = {
                "teacher_workload": TimetableStatisticsService.teacher_workload(
                    tt, total_teachers=total_teachers
                ),
                "subject_distribution": TimetableStatisticsService.subject_distribution(
                    tt, num_subjects=num_subjects
                ),
                "room_utilization": TimetableStatisticsService.room_utilization(
                    tt, total_rooms=total_rooms
                ),
            }

        return summary


__all__ = ["TimetableStatisticsService"]
