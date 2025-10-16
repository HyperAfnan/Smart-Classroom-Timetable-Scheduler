"""
Teacher timetable schema.

This module defines the TeacherTimetable model, mirroring the structure
used in the original monolithic FastAPI application to ensure compatibility.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel

from .slot_info import SlotInfo


class TeacherTimetable(BaseModel):
    """
    Represents a teacher's timetable across days and slots.

    Attributes:
        teacher_id: Zero-based identifier for the teacher.
        teacher_name: Human-readable name for the teacher.
        total_hours: Total number of assigned teaching hours for the week.
        timetable: A 2D grid [day][slot] where each cell may be a SlotInfo or None.
    """

    teacher_id: int
    teacher_name: str
    total_hours: int
    timetable: List[List[Optional[SlotInfo]]]


__all__ = ["TeacherTimetable"]
