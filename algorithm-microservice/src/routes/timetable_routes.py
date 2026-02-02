from __future__ import annotations

import traceback
from typing_extensions import TypedDict

from ..services.fetch_details import get_department_resources
from fastapi import APIRouter, HTTPException

from ..models.request_models import TimetableRequest
from ..models.response_models import StudentTimetableResponse, TimetableResponse
from ..services.generator import TimetableGenerator
from ..core.utils import get_logger

log = get_logger(__name__)

router = APIRouter()


@router.post("/generate-timetable/legecy", response_model=TimetableResponse)
async def generate_timetable_legacy(request: TimetableRequest):
    """
    Generate complete timetable views (student, teacher, combined) using GA.
    Mirrors the original monolith behavior for the legacy endpoint.
    """
    try:
        gen = TimetableGenerator(config=request)
        best, score = gen.run_ga()
        return TimetableResponse(
            success=True,
            fitness_score=float(score),
            generation_count=request.generations,
            student_timetables=gen.generate_student_view(best),
            teacher_timetables=gen.generate_teacher_view(best),
            combined_view=gen.generate_combined_view(best),
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-timetable/combined", response_model=TimetableResponse)
async def generate_timetable_combined(request: TimetableRequest):
    """
    Generate only the combined view using GA.
    Preserves original behavior where student/teacher views were omitted.
    """
    try:
        gen = TimetableGenerator(config=request)
        best, score = gen.run_ga()
        return TimetableResponse(
            success=True,
            fitness_score=float(score),
            generation_count=request.generations,
            # student_timetables intentionally omitted to preserve original behavior
            # teacher_timetables intentionally omitted to preserve original behavior
            combined_view=gen.generate_combined_view(best),
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-timetable/teacherwise", response_model=TimetableResponse)
async def generate_timetable_teacherwise(request: TimetableRequest):
    """
    Generate teacher-wise related output.
    In the original monolith this returned only combined_view (same as combined route).
    The behavior is preserved here for compatibility.
    """
    try:
        gen = TimetableGenerator(config=request)
        best, score = gen.run_ga()
        return TimetableResponse(
            success=True,
            fitness_score=float(score),
            generation_count=request.generations,
            # student_timetables intentionally omitted to preserve original behavior
            # teacher_timetables intentionally omitted to preserve original behavior
            combined_view=gen.generate_combined_view(best),
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/generate-timetable/studentwise/department/{department_id}",
    response_model=StudentTimetableResponse,
)
async def generate_timetable_across_department(
    department_id: str, request: TimetableRequest
):
    try:
        request.department_id = department_id
        resources = await get_department_resources(department_id)
        
        if resources["total_classes"] == 0:
             raise HTTPException(status_code=404, detail=f"No classes found for department {department_id}")
        if resources["total_rooms"] == 0:
             raise HTTPException(status_code=404, detail=f"No rooms found for department {department_id}")
        if resources["total_teachers"] == 0:
             raise HTTPException(status_code=404, detail=f"No teachers found for department {department_id}")
        if resources["total_subjects"] == 0:
             raise HTTPException(status_code=404, detail=f"No subjects found for department {department_id}")
             
        gen = TimetableGenerator(
            request,
            TOTAL_ROOMS=resources["total_rooms"],
            TOTAL_TEACHERS=resources["total_teachers"],
            ROOM_NAMES=resources["room_names"],
            NUM_CLASSES=resources["total_classes"],
            CLASS_NAMES=resources["class_names"],
            TOTAL_SUBJECTS=resources["total_subjects"],
            SUBJECT_NAMES=resources["subject_names"],
            SUBJECT_TYPES=resources["subject_types"],
            TEACHER_NAMES=resources["teacher_names"],
            SUBJECT_TEACHERS=resources["subject_teachers"],
            SUBJECT_HOURS=resources["subject_hours"],
        )

        best, score = gen.run_ga()
        return StudentTimetableResponse(
            success=True,
            fitness_score=float(score),
            generation_count=request.generations,
            student_timetables=gen.generate_student_view(best),
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/generate-timetable/studentwise/", response_model=StudentTimetableResponse
)
async def generate_timetable_studentwise(request: TimetableRequest):
    """
    Generate student-wise timetable view using GA.
    Preserves original behavior where student view is primary, with teacher and combined also included.
    """
    try:
        gen = TimetableGenerator(config=request)
        best, score = gen.run_ga()
        return StudentTimetableResponse(
            success=True,
            fitness_score=float(score),
            generation_count=request.generations,
            student_timetables=gen.generate_student_view(best),
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def root() -> dict[str, str]:
    """
    Root endpoint providing service metadata.
    """
    return {"message": "Timetable Generator API", "version": "1.0.0"}


@router.get("/example-request")
async def example_request() -> dict[str, object]:
    """
    Example request body matching the original monolith for quick testing.
    """
    return {
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
    }


class FlatSlot(TypedDict):
    class_id: int
    day: str
    start_time: str
    subject_id: int
    teacher_id: int
    room_id: int
    type: str


@router.post("/generate-timetable/flat")
async def generate_timetable_flat(request: TimetableRequest) -> list[FlatSlot]:
    """
    Generate timetable and return a flat list of slots with fields ready for the React table.
    Mirrors original monolith endpoint behavior.
    """
    try:
        gen = TimetableGenerator(config=request)
        best, _ = gen.run_ga()

        flat: list[FlatSlot] = []
        day_names: list[str] = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ]
        for c in range(gen.NUM_CLASSES):
            for d in range(gen.DAYS):
                for s in range(gen.SLOTS_PER_DAY):
                    subj_i, teacher_i, room_i = map(int, best[c, d, s])
                    if subj_i == -1:
                        continue
                    flat.append(
                        {
                            "class_id": c,
                            "day": day_names[d]
                            if d < len(day_names)
                            else f"Day-{d + 1}",
                            "start_time": f"{9 + s}:00",  # preserve original mapping
                            "subject_id": subj_i,
                            "teacher_id": teacher_i,
                            "room_id": room_i,
                            "type": (
                                "lab"
                                if subj_i in getattr(gen, "LAB_SUBJECTS", set())
                                else gen.SUBJECT_TYPES.get(subj_i, "lecture")
                            ),
                        }
                    )
        return flat
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


__all__ = ["router"]
