"""
Combined timetable schema.

This module defines the CombinedTimetable model, which represents the
cross-class assignments for a specific day and slot. It mirrors the structure
used in the original monolithic FastAPI application to ensure compatibility.
"""

from __future__ import annotations

from typing import List

from pydantic import BaseModel

from .slot_info import SlotInfo


class CombinedTimetable(BaseModel):
    """
    Represents all class assignments for a particular day and slot.

    Attributes:
        day: Zero-based day index.
        slot: Zero-based slot index within the day.
        assignments: List of SlotInfo entries, one per occupied class during this slot.
    """

    day: int
    slot: int
    assignments: List[SlotInfo]


__all__ = ["CombinedTimetable"]
