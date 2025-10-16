"""
Pydantic request models for the Timetable Generator API.

These models are extracted from the original monolithic FastAPI application
to enable a modular project structure without changing the API surface.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class TimetableRequest(BaseModel):
    """
    Request payload for generating timetables using the genetic algorithm.
    Mirrors the fields used in the original monolith to preserve behavior.
    """

    num_classes: int = Field(..., ge=1, le=100)
    days: int = Field(..., ge=1, le=7)
    slots_per_day: int = Field(..., ge=1, le=12)

    total_rooms: int = Field(..., ge=1, le=100)
    total_teachers: int = Field(..., ge=1, le=200)

    subject_hours: Dict[int, int]
    subject_teachers: Dict[int, List[int]]
    max_hours_per_day: int = 6
    max_hours_per_week: int = 20

    class_names: Optional[List[str]] = None
    subject_names: Optional[List[str]] = None
    teacher_names: Optional[List[str]] = None
    room_names: Optional[List[str]] = None

    population_size: int = 60
    generations: int = 80
    mutation_rate: float = 0.02

    class Config:
        schema_extra = {
            "example": {
                "num_classes": 3,
                "days": 5,
                "slots_per_day": 6,
                "total_rooms": 6,
                "total_teachers": 8,
                "subject_hours": {"0": 4, "1": 3, "2": 3},
                "subject_teachers": {"0": [0, 1], "1": [2, 3], "2": [4, 5]},
                "class_names": ["Class A", "Class B", "Class C"],
                "subject_names": ["Math", "English", "Science"],
                "teacher_names": ["T0", "T1", "T2", "T3", "T4", "T5", "T6", "T7"],
                "room_names": ["R0", "R1", "R2", "R3", "R4", "R5"],
                "population_size": 60,
                "generations": 80,
                "mutation_rate": 0.02,
            }
        }


__all__ = ["TimetableRequest"]
