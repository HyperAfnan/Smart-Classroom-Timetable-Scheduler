"""
Pydantic response models for the Timetable Generator API.

These models are extracted from the original monolithic FastAPI application
to enable a modular project structure without changing the API surface.
"""

from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field

from ..schemas.student_timetable import StudentTimetable
from ..schemas.teacher_timetable import TeacherTimetable
from ..schemas.combined_timetable import CombinedTimetable


class TimetableResponse(BaseModel):
    """
    Full response payload for timetable generation requests.

    Notes:
    - Defaults are provided for list fields to tolerate routes that omit them
      in their return dicts while still validating against the response model.
    """

    success: bool
    fitness_score: float
    generation_count: int
    student_timetables: List[StudentTimetable] = Field(default_factory=list)
    teacher_timetables: List[TeacherTimetable] = Field(default_factory=list)
    combined_view: List[CombinedTimetable]


class StudentTimetableResponse(BaseModel):
    """
    Response payload tailored for student-focused routes.
    Includes student timetables and optionally teacher/combined views.
    """

    success: bool
    fitness_score: float
    generation_count: int
    student_timetables: List[StudentTimetable]


__all__ = [
    "TimetableResponse",
    "StudentTimetableResponse",
]
