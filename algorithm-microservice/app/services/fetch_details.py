import asyncio
from typing import Any, cast
from fastapi.concurrency import run_in_threadpool
from app.core.supabase import supabase
from app.core.utils import get_logger

log = get_logger(__name__)


async def get_department_details(department_id: int) -> dict[str, Any]:
    """
    Fetch department details by ID from Supabase.
    Returns an empty dict if not found.
    """
    department = await run_in_threadpool(
        lambda: supabase.table("department")
        .select("*")
        .eq("id", department_id)
        .single()
        .execute()
    )

    dept_data = getattr(department, "data", None)
    return cast(dict[str, Any], dept_data) if isinstance(dept_data, dict) else {}


async def get_rooms_by_department(department_id: int) -> list[dict[str, Any]]:
    """
    Fetch all rooms under a department.
    """
    fetched_rooms = await run_in_threadpool(
        lambda: supabase.table("room")
        .select("*")
        .eq("department_id", department_id)
        .execute()
    )

    rooms_data = getattr(fetched_rooms, "data", [])
    return cast(
        list[dict[str, Any]], rooms_data if isinstance(rooms_data, list) else []
    )


async def get_teachers_by_department(department_id: int) -> list[dict[str, Any]]:
    """
    Fetch all teacher profiles under a department.
    """
    fetched_teachers = await run_in_threadpool(
        lambda: supabase.table("teacher_profile")
        .select("*")
        .eq("department_id", department_id)
        .order("id")
        .execute()
    )

    teachers_data = getattr(fetched_teachers, "data", [])
    return cast(
        list[dict[str, Any]], teachers_data if isinstance(teachers_data, list) else []
    )


async def get_classes_by_department(department_id: int) -> list[dict[str, Any]]:
    """
    Fetch all classes under a department.
    """
    fetched_classes = await run_in_threadpool(
        lambda: supabase.table("classes")
        .select("*")
        .eq("department_id", department_id)
        .execute()
    )

    classes_data = getattr(fetched_classes, "data", [])
    return cast(
        list[dict[str, Any]], classes_data if isinstance(classes_data, list) else []
    )


async def get_subjects_by_department(department_id: int) -> list[dict[str, Any]]:
    """
    Fetch all subjects under a department.
    """
    fetched_subjects = await run_in_threadpool(
        lambda: supabase.table("subjects")
        .select("*")
        .eq("department_id", department_id)
        .order("id")
        .execute()
    )

    subjects_data = getattr(fetched_subjects, "data", [])
    return cast(
        list[dict[str, Any]], subjects_data if isinstance(subjects_data, list) else []
    )


def build_subject_hours(subjects_list: list[dict[str, Any]]) -> dict[int, int]:
    """
    Construct the subject_hours mapping expected by the GA:
    {subject_index: hours_per_week}

    The index corresponds to the position of the subject in subjects_list,
    which should also align with the order used to produce subject_names.
    If hours_per_week is missing or not an int, it falls back to 0.
    """
    mapping: dict[int, int] = {}
    for idx, subj in enumerate(subjects_list):
        hrs_val = subj.get("hours_per_week", 0)
        try:
            hrs = int(hrs_val)
        except Exception:
            hrs = 0
        mapping[idx] = hrs
    return mapping


def build_subject_teachers(
    subjects_list: list[dict[str, Any]],
    teachers_list: list[dict[str, Any]],
    assignments_list: list[dict[str, Any]],
) -> dict[int, list[int]]:
    """
    Build subject_teachers mapping using subject IDs as keys and teacher IDs as values.
    Returns: {subject_id: [teacher_id, ...]}
    """

    print("=== DEBUG: Building initial mapping from subjects_list ===")
    mapping: dict[int, list[int]] = {subj["id"]: [] for subj in subjects_list if "id" in subj}
    print(f"Initial mapping keys (subject IDs): {list(mapping.keys())}")

    print("\n=== DEBUG: Processing assignments ===")
    for idx, row in enumerate(assignments_list):
        print(f"\nAssignment #{idx + 1}: {row}")

        subj = row.get("subject") or {}
        teacher = row.get("teacher") or {}
        sid = subj.get("id")
        tid = teacher.get("id")

        print(f"  Extracted subject ID: {sid}, teacher ID: {tid}")

        if sid in mapping and tid is not None:
            mapping[sid].append(tid)
            print(f"  ✅ Added teacher {tid} to subject {sid}")
        else:
            print(f"  ⚠️ Skipped — subject {sid} not in mapping or teacher ID missing")

    print("\n=== DEBUG: Sorting teacher IDs for each subject ===")
    for s_id in mapping:
        mapping[s_id].sort()
        print(f"  Subject {s_id}: Sorted teachers → {mapping[s_id]}")

    print("\n=== FINAL MAPPING RESULT ===")
    print(mapping)
    return mapping


async def get_teacher_subject_assignments_by_department(
    department_id: int,
) -> list[dict[str, Any]]:
    """
    Fetch teacher-subject assignment rows with expanded teacher and subject.
    Filters to the given department using nested teacher.department_id where available.
    """
    fetched = await run_in_threadpool(
        lambda: supabase.table("teacher_subjects")
        .select(
            "id, teacher:teacher_profile(id,name,email,department_id), subject:subjects(id,subject_name,department_id)"
        )
        .execute()
    )

    data = getattr(fetched, "data", [])
    items = cast(list[dict[str, Any]], data if isinstance(data, list) else [])
    filtered = [
        it
        for it in items
            if (it.get("teacher") or {}).get("department_id") == department_id
        or (it.get("subject") or {}).get("department_id") == department_id
    ]
    return filtered


async def get_subject_teachers_by_department(
    department_id: int,
) -> list[dict[str, Any]]:
    fetched_subjects_teachers = await run_in_threadpool(
        lambda: supabase.table("teacher_subjects")
        .select(
            """ id, subject:subjects(id, subject_name), teacher:teacher_profile ( id, name, email, department_id) """
        )
        .eq("teacher.department_id", department_id)
        .execute()
    )
    subjects_teachers_data = getattr(fetched_subjects_teachers, "data", [])
    subjects_teachers_data.sort(key=lambda x: x["subject"]["id"], reverse=True)
    return cast(
        list[dict[str, Any]],
        subjects_teachers_data if isinstance(subjects_teachers_data, list) else [],
    )


async def get_department_resources(department_id: int) -> dict[str, Any]:
    """
    Fetch department + teachers + rooms in one unified object.
    """
    (
        department_data,
        rooms_list,
        teachers_list,
        class_list,
        subjects_list,
        assignments_list,
    ) = await asyncio.gather(
        get_department_details(department_id),
        get_rooms_by_department(department_id),
        get_teachers_by_department(department_id),
        get_classes_by_department(department_id),
        get_subjects_by_department(department_id),
        get_teacher_subject_assignments_by_department(department_id),
    )

    return {
        "department": department_data,
        "rooms": rooms_list,
        "teachers": teachers_list,
        "total_rooms": len(rooms_list),
        "total_teachers": len(teachers_list),
        "room_names": [
            room["room_number"] for room in rooms_list if "room_number" in room
        ],
        "classes": class_list,
        "total_classes": len(class_list),
        "class_names": [cls["class_name"] for cls in class_list if "class_name" in cls],
        "total_subjects": len(subjects_list),
        "subjects": subjects_list,
        "subject_names": [
            subject["subject_name"]
            for subject in subjects_list
            if "subject_name" in subject
        ],
        "teacher_names": [t["name"] for t in teachers_list if "name" in t],
        "subject_hours": build_subject_hours(subjects_list),
        "subject_teachers": build_subject_teachers( subjects_list, teachers_list, assignments_list),
    }
