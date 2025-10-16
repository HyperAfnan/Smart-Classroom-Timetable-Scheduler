"""
Timetable models facade.

This module exists to match the requested project structure while keeping a single
source of truth for the core Pydantic models. It re-exports the core timetable
schemas so other modules can import from:

    timetable_api.app.models.timetable_models

without needing to know the internal layout under `app.schemas`.

Re-exported symbols:
- SlotInfo
- StudentTimetable
- TeacherTimetable
- CombinedTimetable
"""

from __future__ import annotations

from ..schemas.slot_info import SlotInfo
from ..schemas.student_timetable import StudentTimetable
from ..schemas.teacher_timetable import TeacherTimetable
from ..schemas.combined_timetable import CombinedTimetable

__all__ = [
    "SlotInfo",
    "StudentTimetable",
    "TeacherTimetable",
    "CombinedTimetable",
]
