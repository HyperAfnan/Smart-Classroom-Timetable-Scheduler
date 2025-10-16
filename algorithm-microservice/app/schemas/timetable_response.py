"""
Compatibility timetable response schemas.

This module is kept for backward compatibility with import paths that
previously referenced `app.schemas.timetable_response`. The concrete
Pydantic models now live in `app.models.response_models`. We re-export
those here so existing code keeps working without changes.

Note:
- The response models no longer include the `statistics` field, as it is
  not required by the frontend.
"""

from __future__ import annotations

# Re-export response models as schemas for compatibility
from ..models.response_models import (  # noqa: F401
    StudentTimetableResponse as _StudentTimetableResponse,
    TimetableResponse as _TimetableResponse,
)

# Public aliases preserving the original schema names
TimetableResponse = _TimetableResponse
StudentTimetableResponse = _StudentTimetableResponse

__all__ = ["TimetableResponse", "StudentTimetableResponse"]
