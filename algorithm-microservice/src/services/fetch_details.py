import asyncio
from typing import Any, cast
from fastapi.concurrency import run_in_threadpool
from src.core.firebase import db
from src.core.utils import get_logger, map_keys_to_snake_case

log = get_logger(__name__)


async def get_department_details(department_id: str) -> dict[str, Any]:
    """
    Fetch department details by ID from Firestore.
    Returns an empty dict if not found.
    """
    try:
        doc = await run_in_threadpool(
            lambda: db.collection("departments").document(str(department_id)).get()
        )
        if doc.exists:
            data = doc.to_dict()
            if data:
                data["id"] = doc.id
                return map_keys_to_snake_case(data)
        return {}
    except Exception as e:
        log.error(f"Error fetching department {department_id}: {e}")
        return {}


async def get_rooms_by_department(department_id: str) -> list[dict[str, Any]]:
    """
    Fetch all rooms under a department.
    """
    try:
        # Note: Firestore filter matches string ID
        docs = await run_in_threadpool(
            lambda: db.collection("rooms").where("departmentId", "==", str(department_id)).stream()
        )
        rooms = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            rooms.append(map_keys_to_snake_case(d))
        return rooms
    except Exception as e:
        log.error(f"Error fetching rooms for dept {department_id}: {e}")
        return []


async def get_teachers_by_department(department_id: str) -> list[dict[str, Any]]:
    """
    Fetch all teacher profiles under a department.
    """
    try:
        docs = await run_in_threadpool(
            lambda: db.collection("teacher_profile").where("departmentId", "==", str(department_id)).stream()
        )
        # Sort by ID manually since we can't easily order by specific field without index
        # Or depend on Firestore default order
        teachers = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            teachers.append(map_keys_to_snake_case(d))
        
        # Original code ordered by ID. We'll sort by ID string.
        teachers.sort(key=lambda x: x.get("id", ""))
        return teachers
    except Exception as e:
        log.error(f"Error fetching teachers for dept {department_id}: {e}")
        return []


async def get_classes_by_department(department_id: str) -> list[dict[str, Any]]:
    """
    Fetch all classes under a department.
    """
    try:
        docs = await run_in_threadpool(
            lambda: db.collection("classes").where("departmentId", "==", str(department_id)).stream()
        )
        classes = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            classes.append(map_keys_to_snake_case(d))
        return classes
    except Exception as e:
        log.error(f"Error fetching classes for dept {department_id}: {e}")
        return []


async def get_subjects_by_department(department_id: str) -> list[dict[str, Any]]:
    """
    Fetch all subjects under a department.
    """
    try:
        docs = await run_in_threadpool(
            lambda: db.collection("subjects").where("department", "==", str(department_id)).stream()
        )
        subjects = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            subjects.append(map_keys_to_snake_case(d))
        
        subjects.sort(key=lambda x: x.get("id", ""))
        return subjects
    except Exception as e:
        log.error(f"Error fetching subjects for dept {department_id}: {e}")
        return []


def build_subject_hours(subjects_list: list[dict[str, Any]]) -> dict[int, int]:
    """
    Construct the subject_hours mapping expected by the GA:
    {subject_index: hours_per_week}

    The index corresponds to the position of the subject in subjects_list.
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
    Build subject_teachers mapping using subject indices as keys and
    teacher indices (aligned with teachers_list) as values.
    Returns: {subject_index: [teacher_index, ...]}
    """
    subj_id_to_index = {
        subj["id"]: idx for idx, subj in enumerate(subjects_list) if "id" in subj
    }
    teacher_id_to_index = {
        t["id"]: idx for idx, t in enumerate(teachers_list) if "id" in t
    }
    mapping: dict[int, list[int]] = {idx: [] for idx in subj_id_to_index.values()}
    for row in assignments_list:
        # Row here from get_teacher_subject_assignments expects nested objects
        subj = row.get("subject") or {}
        teacher = row.get("teacher") or {}
        sid = subj.get("id")
        tid = teacher.get("id")
        
        si = subj_id_to_index.get(sid)
        ti = teacher_id_to_index.get(tid)
        
        if si is not None and ti is not None:
            mapping.setdefault(si, []).append(ti)
            
    # Deduplicate and sort teachers per subject
    return {si: sorted(set(tis)) for si, tis in mapping.items()}


async def get_teacher_subject_assignments_by_department(
    department_id: str,
) -> list[dict[str, Any]]:
    """
    Fetch teacher-subject assignment rows with expanded teacher and subject.
    Manually joins teacher_subjects with teacher_profile and subjects.
    Filters to the given department.
    """
    try:
        # 1. Fetch all assignments
        # Note: If this collection is huge, this is inefficient.
        # But for limited scope, we fetch all and filter in memory.
        # Ideally, we would query: where("teacherId" IN [list of dept teachers])
        # But dealing with two disparate filtering conditions (teacher OR subject in dept) is hard in NoSQL.
        
        assignments_docs = await run_in_threadpool(
            lambda: db.collection("teacher_subjects").stream()
        )
        
        all_assignments = []
        for doc in assignments_docs:
            d = doc.to_dict()
            d["id"] = doc.id
            all_assignments.append(map_keys_to_snake_case(d))
            
        # 2. We need to expand 'teacher' and 'subject' for each assignment
        # Optimization: Fetch all teachers and subjects for the department first?
        # But assignments might link to teachers OUTSIDE the department (shared resources).
        # Safe approach: Collect all referenced IDs and fetch them (batch get).
        
        teacher_ids = set()
        subject_ids = set()
        
        for asn in all_assignments:
            if asn.get("teacher_id"):
                teacher_ids.add(asn["teacher_id"])
            if asn.get("subject_id"):
                subject_ids.add(asn["subject_id"])
                
        # Batch fetch helpers (could be moved to utils or optimized)
        async def fetch_ids(collection: str, ids: list[str]) -> dict[str, dict]:
            if not ids:
                return {}
            # Firestore supports getAll but limited to 10(?) or maybe more in Python SDK.
            # safe to loop or chunk.
            # actually db.get_all(refs)
            refs = [db.collection(collection).document(str(i)) for i in ids]
            
            # chunking requests to avoid limits if any
            results = {}
            # simple loop for now to avoid complexity of chunking logic in migration draft
            # run_in_threadpool wrapper for synchronous getAll? 
            # or loop individual gets (slow but safe)
            # Let's try fetching by ID in parallel if possible, or just looping
            
            # Optimization: Just fetch ALL teachers and ALL subjects? 
            # If "teacher_profile" is not huge, fetching all is faster than N reads.
            # Let's assume fetching strict list is better.
            
            # Using run_in_threadpool for batch get
            snapshots = await run_in_threadpool(lambda: db.get_all(refs))
            for snap in snapshots:
                if snap.exists:
                    d = snap.to_dict()
                    d["id"] = snap.id
                    results[snap.id] = map_keys_to_snake_case(d)
            return results

        teachers_map = await fetch_ids("teacher_profile", list(teacher_ids))
        subjects_map = await fetch_ids("subjects", list(subject_ids))
        
        # 3. Assemble and Filter
        filtered_items = []
        for asn in all_assignments:
            tid = asn.get("teacher_id")
            sid = asn.get("subject_id")
            
            teacher_obj = teachers_map.get(tid, {})
            subject_obj = subjects_map.get(sid, {})
            
            # Skip if critical links missing
            if not teacher_obj or not subject_obj:
                continue
                
            # Filter condition: Teacher in Dept OR Subject in Dept
            # Note: We are comparing string IDs.
            t_dept = str(teacher_obj.get("departmentId", ""))
            s_dept = str(subject_obj.get("departmentId", ""))
            target_dept = str(department_id)
            
            if t_dept == target_dept or s_dept == target_dept:
                # Construct the nested object expected by algorithm
                # "id, teacher:teacher_profile(...), subject:subjects(...)"
                item = {
                    "id": asn.get("id"),
                    "teacher": teacher_obj,
                    "subject": subject_obj
                }
                filtered_items.append(item)
                
        return filtered_items

    except Exception as e:
        log.error(f"Error fetching assignments for dept {department_id}: {e}")
        return []


async def get_subject_teachers_by_department(
    department_id: str,
) -> list[dict[str, Any]]:
    """
    Detailed lists of teacher subjects assignments for detailed view?
    Basically same as above but sorted and maybe different fields.
    Original query: .eq("teacher.department_id", department_id)
    """
    # Reuse the logic above but strictly filter by teacher department?
    # Original: teacher_subjects joined with teacher and subject, filtered where teacher.department_id = dept.
    
    # We can just call get_teacher_subject_assignments_by_department (which does OR) 
    # and filter strictly for teacher department.
    
    items = await get_teacher_subject_assignments_by_department(department_id)
    
    # Strict filter: teacher.department_id == department_id
    strict_items = [
        it for it in items 
        if str((it.get("teacher") or {}).get("department_id", "")) == str(department_id)
    ]
    
    # Sort by subject ID desc
    strict_items.sort(key=lambda x: (x.get("subject") or {}).get("id", ""), reverse=True)
    
    return strict_items


async def get_department_resources(department_id: str) -> dict[str, Any]:
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
        "subject_teachers": build_subject_teachers(
            subjects_list, teachers_list, assignments_list
        ),
        "subject_types": {
            idx: (
                "lab"
                if ((subj.get("type") or "").strip().lower() == "lab")
                else "lecture"
            )
            for idx, subj in enumerate(subjects_list)
        },
    }
