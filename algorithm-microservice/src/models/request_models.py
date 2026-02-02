"""
Pydantic request models for the Timetable Generator API.

These models are extracted from the original monolithic FastAPI application
to enable a modular project structure without changing the API surface.
"""

from __future__ import annotations

from typing import Dict, Optional

from pydantic import BaseModel, Field


class TimetableRequest(BaseModel):
    """
    Request payload for generating timetables using the genetic algorithm.
    Mirrors the fields used in the original monolith to preserve behavior.
    """

    days: int = Field(..., ge=1, le=7)
    slots_per_day: int = Field(..., ge=1, le=12)
    subject_types: Optional[Dict[int, str]] = None

    max_hours_per_day: int = 6
    max_hours_per_week: int = 20
    department_id: str = "UhmONhtTSYAyWlWQoUn0"

    population_size: int = 50
    generations: int = 100
    mutation_rate: float = 0.01

    class Config:
        schema_extra = {
            "example": {
                "days": 5,
                "slots_per_day": 6,
                "subject_types": {"0": "lecture", "1": "lab"},
                "population_size": 60,
                "generations": 80,
                "mutation_rate": 0.02,
            }
        }


__all__ = ["TimetableRequest"]
