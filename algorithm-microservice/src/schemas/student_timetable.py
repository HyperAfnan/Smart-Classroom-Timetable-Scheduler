"""
Student timetable schema.

This module defines the StudentTimetable model, which mirrors the structure
used in the original monolithic FastAPI application to ensure compatibility.
"""

from __future__ import annotations

from typing import List

from pydantic import BaseModel

from .slot_info import SlotInfo


class StudentTimetable(BaseModel):
    """
    Represents a single class's timetable across days and slots.

    Attributes:
        class_id: Zero-based identifier for the class.
        class_name: Human-readable name for the class.
        timetable: A 2D grid [day][slot] containing SlotInfo items for each period.
    """

    class_id: int
    class_name: str
    timetable: List[List[SlotInfo]]


__all__ = ["StudentTimetable"]
