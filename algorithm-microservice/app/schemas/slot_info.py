"""
Timetable schema models extracted from the original monolithic FastAPI app.

This module defines the core Pydantic models used across routes and services:
- SlotInfo
- StudentTimetable
- TeacherTimetable
- CombinedTimetable
- TimetableResponse

These classes mirror the original structures to avoid any behavior or API changes.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class SlotInfo(BaseModel):
    subject_id: Optional[int] = None
    subject_name: Optional[str] = None
    teacher_id: Optional[int] = None
    teacher_name: Optional[str] = None
    room_id: Optional[int] = None
    room_name: Optional[str] = None
    class_id: Optional[int] = None
    class_name: Optional[str] = None
    day: int
    slot: int
    is_free: bool = False


class StudentTimetable(BaseModel):
    class_id: int
    class_name: str
    timetable: List[List[SlotInfo]]


class TeacherTimetable(BaseModel):
    teacher_id: int
    teacher_name: str
    total_hours: int
    timetable: List[List[Optional[SlotInfo]]]


class CombinedTimetable(BaseModel):
    day: int
    slot: int
    assignments: List[SlotInfo]


class TimetableResponse(BaseModel):
    success: bool
    fitness_score: float
    generation_count: int
    student_timetables: List[StudentTimetable]
    teacher_timetables: List[TeacherTimetable]
    combined_view: List[CombinedTimetable]


__all__ = [
    "SlotInfo",
    "StudentTimetable",
    "TeacherTimetable",
    "CombinedTimetable",
    "TimetableResponse",
]
