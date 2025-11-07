"""
Genetic Algorithm-based Timetable generator service.

This module extracts the core logic from the monolithic FastAPI app's
TimetableGenerator into a reusable service class without changing behavior.

Public API:
- class TimetableGenerator
    - run_ga() -> tuple[np.ndarray, float]
    - generate_student_view(tt) -> List[StudentTimetable]
    - generate_teacher_view(tt) -> List[TeacherTimetable]
    - generate_combined_view(tt) -> List[CombinedTimetable]
    - calculate_statistics(tt) -> dict[str, Any]
"""

from __future__ import annotations

import random
from typing import cast

import numpy as np
from app.core.utils import get_logger
from numpy.typing import NDArray

from ..models.request_models import TimetableRequest
from ..schemas.combined_timetable import CombinedTimetable
from ..schemas.slot_info import SlotInfo
from ..schemas.student_timetable import StudentTimetable
from ..schemas.teacher_timetable import TeacherTimetable

log = get_logger(__name__)


class TimetableGenerator:
    """
    Genetic Algorithm-powered timetable generator.

    This implementation mirrors the behavior and constraints from the original
    monolithic application to ensure drop-in compatibility.
    """

    def __init__(
        self,
        config: TimetableRequest,
        TOTAL_ROOMS: int | None = None,
        TOTAL_TEACHERS: int | None = None,
        TOTAL_SUBJECTS: int | None = None,
        NUM_CLASSES: int | None = None,
        ROOM_NAMES: list[str] | None = None,
        CLASS_NAMES: list[str] | None = None,
        SUBJECT_NAMES: list[str] | None = None,
        SUBJECT_TYPES: dict[int, str] | None = None,
        SUBJECT_TEACHERS: dict[int, list[int]] | None = None,
        SUBJECT_HOURS: dict[int, int] | None = None,
        TEACHER_NAMES: list[str] | None = None,
    ):
        self.config: TimetableRequest = config

        # Subject types (lab/lecture) -> derive LAB_SUBJECTS
        st = SUBJECT_TYPES or getattr(self.config, "subject_types", None) or {}
        self.SUBJECT_TYPES: dict[int, str] = (
            {int(k): str(v) for k, v in st.items()} if isinstance(st, dict) else {}
        )
        self.LAB_SUBJECTS: set[int] = {
            k
            for k, v in self.SUBJECT_TYPES.items()
            if isinstance(v, str) and v.lower() == "lab"
        }

        # Core dimensions
        inferred_num_classes = getattr(config, "num_classes", None)
        if inferred_num_classes is None and CLASS_NAMES:
            inferred_num_classes = len(CLASS_NAMES)
        self.NUM_CLASSES: int = (
            int(NUM_CLASSES)
            if NUM_CLASSES is not None
            else int(inferred_num_classes or 1)
        )
        self.DAYS: int = config.days
        self.SLOTS_PER_DAY: int = config.slots_per_day

        # Curriculum and constraints
        cfg_subject_hours = getattr(config, "subject_hours", None) or {}
        if isinstance(cfg_subject_hours, dict):
            try:
                cfg_subject_hours = {
                    int(k): int(v) for k, v in cfg_subject_hours.items()
                }
            except Exception:
                cfg_subject_hours = {}
        else:
            cfg_subject_hours = {}
        self.SUBJECT_HOURS: dict[int, int] = SUBJECT_HOURS or cfg_subject_hours or {}
        inferred_num_subjects = (
            len(SUBJECT_NAMES) if SUBJECT_NAMES else len(self.SUBJECT_HOURS)
        )
        self.NUM_SUBJECTS: int = (
            int(TOTAL_SUBJECTS)
            if TOTAL_SUBJECTS is not None
            else int(inferred_num_subjects)
        )
        self.SUBJECT_TEACHERS: dict[int, list[int]] = (
            SUBJECT_TEACHERS or getattr(config, "subject_teachers", {}) or {}
        )
        self.MAX_HOURS_PER_DAY: int = config.max_hours_per_day
        self.MAX_HOURS_PER_WEEK: int = config.max_hours_per_week

        # Initialize placeholders (important!)
        inferred_teachers = None
        if TEACHER_NAMES:
            inferred_teachers = len(TEACHER_NAMES)
        elif hasattr(config, "total_teachers"):
            inferred_teachers = getattr(config, "total_teachers", None)
        self.TOTAL_TEACHERS: int = (
            int(TOTAL_TEACHERS)
            if TOTAL_TEACHERS is not None
            else int(inferred_teachers or 1)
        )
        inferred_rooms = None
        if ROOM_NAMES:
            inferred_rooms = len(ROOM_NAMES)
        elif hasattr(config, "total_rooms"):
            inferred_rooms = getattr(config, "total_rooms", None)
        self.TOTAL_ROOMS: int = (
            int(TOTAL_ROOMS) if TOTAL_ROOMS is not None else int(inferred_rooms or 1)
        )

        # Names/labels for classes and subjects
        self.CLASS_NAMES: list[str] = CLASS_NAMES or []
        self.SUBJ_NAMES: list[str] = SUBJECT_NAMES or []

        # Ensure subject and class name lists are long enough
        if len(self.CLASS_NAMES) < self.NUM_CLASSES:
            self.CLASS_NAMES.extend(
                [
                    f"Class-{i + 1}"
                    for i in range(len(self.CLASS_NAMES), self.NUM_CLASSES)
                ]
            )
        if len(self.SUBJ_NAMES) < self.NUM_SUBJECTS:
            self.SUBJ_NAMES.extend(
                [f"Subject-{i}" for i in range(len(self.SUBJ_NAMES), self.NUM_SUBJECTS)]
            )

        # GA settings
        self.POP_SIZE: int = config.population_size
        self.GENERATIONS: int = config.generations
        self.MUTATION_RATE: float = config.mutation_rate

        # Department fetching
        self.department_id: int | None = config.department_id

        self.TEACHER_NAMES: list[str] = TEACHER_NAMES or []
        self.ROOM_NAMES: list[str] = ROOM_NAMES or []
        self.seed = 42
        self.rng = np.random.default_rng(self.seed)

        # Ensure our name lists match fetched totals
        if len(self.TEACHER_NAMES) < self.TOTAL_TEACHERS:
            self.TEACHER_NAMES.extend(
                [
                    f"Teacher-{i}"
                    for i in range(len(self.TEACHER_NAMES), self.TOTAL_TEACHERS)
                ]
            )
        if len(self.ROOM_NAMES) < self.TOTAL_ROOMS:
            self.ROOM_NAMES.extend(
                [f"Room-{i}" for i in range(len(self.ROOM_NAMES), self.TOTAL_ROOMS)]
            )

    # ---------------------------
    # Generation helpers
    # ---------------------------
    def normalize_chromosome(self, chrom: object) -> NDArray[np.int_]:
        """
        Normalize/validate a chromosome (timetable) to a consistent ndarray
        of shape (NUM_CLASSES, DAYS, SLOTS_PER_DAY, 3) with dtype=int,
        using -1 as the sentinel for empty slots. Entries are [subject, teacher, room].
        """
        target = np.full(
            (self.NUM_CLASSES, self.DAYS, self.SLOTS_PER_DAY, 3), -1, dtype=int
        )
        chrom = np.array(chrom, copy=False)

        # Fast path if it's already correct shape and dtype
        if chrom.shape == target.shape:
            try:
                return chrom.astype(int)
            except (ValueError, TypeError):
                log.info("Chromosome has correct shape but invalid types; normalizing.")

        for c in range(self.NUM_CLASSES):
            for d in range(self.DAYS):
                for s in range(self.SLOTS_PER_DAY):
                    try:
                        entry = chrom[c][d][s]
                    except Exception as e:
                        entry = None
                        log.info(f"Invalid access at ({c},{d},{s}): {e}")

                    if entry is None or entry == -1:
                        continue

                    if isinstance(entry, (list, tuple, np.ndarray)):
                        try:
                            if len(entry) == 3:
                                subj, teacher, room = map(int, entry)
                            elif len(entry) == 2:
                                subj, teacher = map(int, entry)
                                room = self.rng.integers(self.TOTAL_ROOMS)
                            else:
                                continue
                        except (ValueError, TypeError):
                            log.info(f"Invalid entry format at ({c},{d},{s}): {entry}")
                            continue
                    else:
                        # Only subject provided; randomize permissible teacher/room
                        try:
                            subj = int(entry)
                        except Exception:
                            subj = -1
                        teacher = self.rng.integers(self.TOTAL_TEACHERS)
                        room = self.rng.integers(self.TOTAL_ROOMS)

                    # Clamp/repair invalid indices
                    if subj < 0 or subj >= self.NUM_SUBJECTS:
                        subj = -1
                    if teacher < 0 or teacher >= self.TOTAL_TEACHERS:
                        teacher = self.rng.integers(self.TOTAL_TEACHERS)
                    if room < 0 or room >= self.TOTAL_ROOMS:
                        room = self.rng.integers(self.TOTAL_ROOMS)

                    if subj == -1:
                        log.info(f"Invalid subject at ({c},{d},{s}); skipping")
                        continue

                    target[c, d, s] = [subj, teacher, room]

        return target

    def generate_random_timetable(self) -> NDArray[np.int_]:
        """
        Create a randomized timetable seeded by subject hour requirements per class.
        Ensures reproducible randomness via self.seed (if provided).

        Updated to place lab subjects as paired double-slots first (same subject, teacher, room, adjacent slots),
        followed by single-slot placements for lectures and any leftover singles.
        """
        tt = np.full(
            (self.NUM_CLASSES, self.DAYS, self.SLOTS_PER_DAY, 3), -1, dtype=int
        )

        # Use LAB_SUBJECTS if available; default to empty set for backward compatibility
        lab_subjects: set[int] = set(getattr(self, "LAB_SUBJECTS", set()))

        for cls in range(self.NUM_CLASSES):
            # Split required workload into lab pairs and lecture singles
            lab_pairs: list[int] = []
            lecture_singles: list[int] = []
            for subj, hrs in self.SUBJECT_HOURS.items():
                if subj in lab_subjects:
                    # Each lab pair consumes 2 consecutive slots
                    pairs = hrs // 2
                    if pairs > 0:
                        lab_pairs += [subj] * pairs
                    # Any odd remainder becomes a single (best-effort placement)
                    rem = hrs % 2
                    if rem:
                        lecture_singles += [subj] * rem
                else:
                    lecture_singles += [subj] * hrs

            total_required_slots = len(lecture_singles) + 2 * len(lab_pairs)
            total_slots = self.DAYS * self.SLOTS_PER_DAY
            if total_required_slots < total_slots:
                log.info(
                    f"Class {cls} has fewer subjects ({total_required_slots}) than available slots ({total_slots}); remaining left empty."
                )
            elif total_required_slots > total_slots:
                log.info(
                    f"Class {cls} has more subjects ({total_required_slots}) than available slots ({total_slots}); truncating/placing best-effort."
                )

            # Shuffle deterministically with the class generator
            self.rng.shuffle(lab_pairs)
            self.rng.shuffle(lecture_singles)

            def choose_teacher_room(subj_id: int) -> tuple[int, int]:
                teachers = self.SUBJECT_TEACHERS.get(subj_id)
                if teachers:
                    teacher = int(self.rng.choice(teachers))
                else:
                    teacher = int(self.rng.integers(self.TOTAL_TEACHERS))
                room = int(self.rng.integers(self.TOTAL_ROOMS))
                return teacher, room

            # 1) Place lab pairs first as adjacent slots within a day
            for subj in lab_pairs:
                placed = False
                attempts = 0
                max_attempts = 200
                while attempts < max_attempts and not placed:
                    if self.SLOTS_PER_DAY < 2:
                        # Cannot place pairs if day has less than 2 slots
                        break
                    d = int(self.rng.integers(self.DAYS))
                    s = int(self.rng.integers(self.SLOTS_PER_DAY - 1))
                    # Both adjacent slots must be free
                    if tt[cls, d, s, 0] == -1 and tt[cls, d, s + 1, 0] == -1:
                        if 0 <= subj < self.NUM_SUBJECTS:
                            teacher, room = choose_teacher_room(subj)
                            tt[cls, d, s] = [subj, teacher, room]
                            tt[cls, d, s + 1] = [subj, teacher, room]
                            placed = True
                        else:
                            break
                    attempts += 1
                # If not placed after attempts, leave unplaced; fitness will penalize shortfall

            # 2) Place lecture singles (and any leftover singles) into remaining free slots
            idx = 0
            for d in range(self.DAYS):
                for s in range(self.SLOTS_PER_DAY):
                    if idx >= len(lecture_singles):
                        break
                    if tt[cls, d, s, 0] != -1:
                        continue

                    subj = lecture_singles[idx]

                    if subj < 0 or subj >= self.NUM_SUBJECTS:
                        log.debug(
                            f"Invalid subject ID {subj} for class {cls}; skipping"
                        )
                        idx += 1
                        continue

                    teacher, room = choose_teacher_room(subj)
                    tt[cls, d, s] = [subj, teacher, room]
                    idx += 1

        return tt

    # ---------------------------
    # Genetic Algorithm core
    # ---------------------------
    def fitness(self, chrom: object) -> float:
        """
        Fitness function (higher is better). Penalizes:
        - Teacher double-booking within the same slot
        - Room double-booking within the same slot
        - Teacher teaching a subject they are not qualified for
        - Teacher exceeding daily or weekly hour limits
        - Non-adjacent lab slots (labs must be scheduled as adjacent double slots)
        - Mismatch between required and assigned subject hours per class
        """
        chrom = self.normalize_chromosome(chrom)
        penalty = 0

        # Teacher hour accumulators
        teacher_week = np.zeros(self.TOTAL_TEACHERS, dtype=int)
        teacher_day = np.zeros((self.TOTAL_TEACHERS, self.DAYS), dtype=int)

        for d in range(self.DAYS):
            for s in range(self.SLOTS_PER_DAY):
                t_seen: set[int] = set()
                r_seen: set[int] = set()
                for c in range(self.NUM_CLASSES):
                    subj, teacher, room = map(int, chrom[c, d, s])
                    if subj == -1:
                        continue

                    # Teacher double-booked at the same slot
                    if teacher in t_seen:
                        penalty += 50
                    else:
                        t_seen.add(teacher)

                    # Room double-booked at the same slot
                    if room in r_seen:
                        penalty += 50
                    else:
                        r_seen.add(room)

                    # Increment loads
                    teacher_week[teacher] += 1
                    teacher_day[teacher, d] += 1

                    # Teacher qualification for subject
                    if teacher not in self.SUBJECT_TEACHERS.get(subj, []):
                        penalty += 20

        # Lab adjacency penalty: penalize any unpaired lab slot within a day for each class
        if getattr(self, "LAB_SUBJECTS", None):
            for c in range(self.NUM_CLASSES):
                for d in range(self.DAYS):
                    s_idx = 0
                    while s_idx < self.SLOTS_PER_DAY:
                        subj_id = int(chrom[c, d, s_idx, 0])
                        if subj_id in self.LAB_SUBJECTS:
                            run_len = 0
                            while (
                                s_idx + run_len < self.SLOTS_PER_DAY
                                and int(chrom[c, d, s_idx + run_len, 0]) == subj_id
                            ):
                                run_len += 1
                            if run_len % 2 == 1:
                                penalty += 100
                            s_idx += run_len
                        else:
                            s_idx += 1
        # Exceeding teacher weekly/daily limits
        penalty += (
            int(np.sum(np.maximum(0, teacher_week - self.MAX_HOURS_PER_WEEK))) * 10
        )
        penalty += int(np.sum(np.maximum(0, teacher_day - self.MAX_HOURS_PER_DAY))) * 8

        # Subject hour mismatch per class
        for c in range(self.NUM_CLASSES):
            flat_subjects = cast(NDArray[np.int_], chrom[c, :, :, 0]).ravel()
            flat_subjects = flat_subjects[flat_subjects >= 0]  # filter free slots
            subj_counts = np.bincount(flat_subjects, minlength=self.NUM_SUBJECTS)
            for subj, hrs in self.SUBJECT_HOURS.items():
                have = subj_counts[subj] if subj < len(subj_counts) else 0
                penalty += abs(have - hrs) * 5

        return -float(penalty)

    def crossover(self, p1: NDArray[np.int_], p2: NDArray[np.int_]) -> NDArray[np.int_]:
        """
        Single-point crossover along the class axis.
        """
        cut = random.randint(1, self.NUM_CLASSES - 1)
        child = cast(NDArray[np.int_], p1.copy())
        child[cut:] = p2[cut:]
        return child

    def mutate(self, chrom: NDArray[np.int_]) -> NDArray[np.int_]:
        """
        Randomly mutate the timetable:
        - With 60% probability: replace a random slot with a new valid assignment.
        - Otherwise: swap two random slots.
        Pair-aware for lab subjects: labs are inserted/swapped as 2-slot blocks and we avoid breaking existing lab pairs.
        """
        out = cast(NDArray[np.int_], chrom.copy())
        n = max(
            1,
            int(self.MUTATION_RATE * self.NUM_CLASSES * self.DAYS * self.SLOTS_PER_DAY),
        )

        lab_subjects: set[int] = set(getattr(self, "LAB_SUBJECTS", set()))

        def choose_teacher_room(subj_id: int) -> tuple[int, int]:
            teachers = self.SUBJECT_TEACHERS.get(subj_id)
            if teachers:
                teacher = random.choice(teachers)
            else:
                teacher = random.randrange(self.TOTAL_TEACHERS)
            room = random.randrange(self.TOTAL_ROOMS)
            return int(teacher), int(room)

        def is_lab_pair_slot(c: int, d: int, s: int) -> bool:
            subj = int(out[c, d, s, 0])
            if subj not in lab_subjects:
                return False
            # Check adjacency with same subject within the day
            if s > 0 and int(out[c, d, s - 1, 0]) == subj:
                return True
            if s + 1 < self.SLOTS_PER_DAY and int(out[c, d, s + 1, 0]) == subj:
                return True
            return False

        def get_pair_start(c: int, d: int, s: int) -> int:
            subj = int(out[c, d, s, 0])
            if s > 0 and int(out[c, d, s - 1, 0]) == subj:
                return s - 1
            return s

        for _ in range(n):
            c = random.randrange(self.NUM_CLASSES)
            d = random.randrange(self.DAYS)
            s = random.randrange(self.SLOTS_PER_DAY)

            if random.random() < 0.6:
                subj = random.choice(list(self.SUBJECT_HOURS.keys()))
                if subj in lab_subjects:
                    # Place as adjacent pair without breaking existing lab pairs
                    if self.SLOTS_PER_DAY >= 2:
                        # preparing candidate pairs
                        candidates: list[tuple[int, int]] = []
                        # Prefer around s
                        if s < self.SLOTS_PER_DAY - 1:
                            candidates.append((d, s))
                        if s > 0:
                            candidates.append((d, s - 1))
                        # Scan rest of the day
                        for ss in range(self.SLOTS_PER_DAY - 1):
                            candidates.append((d, ss))
                        for dd, ss in dict.fromkeys(candidates):
                            if (
                                int(out[c, dd, ss, 0]) == -1
                                and int(out[c, dd, ss + 1, 0]) == -1
                            ):
                                teacher, room = choose_teacher_room(subj)
                                out[c, dd, ss] = [subj, teacher, room]
                                out[c, dd, ss + 1] = [subj, teacher, room]
                                # pair placed
                                break
                        # If not placed, skip to avoid breaking pairs
                else:
                    # single-slot subject; avoid overwriting a lab pair slot
                    if not is_lab_pair_slot(c, d, s):
                        teacher, room = choose_teacher_room(subj)
                        out[c, d, s] = [subj, teacher, room]
            else:
                # Swap mutation; avoid breaking lab pairs
                c2 = random.randrange(self.NUM_CLASSES)
                d2 = random.randrange(self.DAYS)
                s2 = random.randrange(self.SLOTS_PER_DAY)

                subj1 = int(out[c, d, s, 0])
                subj2 = int(out[c2, d2, s2, 0])

                is_lab1 = subj1 in lab_subjects and is_lab_pair_slot(c, d, s)
                is_lab2 = subj2 in lab_subjects and is_lab_pair_slot(c2, d2, s2)

                if is_lab1 and is_lab2:
                    # Swap 2-slot lab blocks atomically
                    s_start1 = get_pair_start(c, d, s)
                    s_start2 = get_pair_start(c2, d2, s2)
                    if (
                        s_start1 < self.SLOTS_PER_DAY - 1
                        and s_start2 < self.SLOTS_PER_DAY - 1
                    ):
                        tmp0 = out[c, d, s_start1].copy()
                        tmp1 = out[c, d, s_start1 + 1].copy()
                        out[c, d, s_start1] = out[c2, d2, s_start2].copy()
                        out[c, d, s_start1 + 1] = out[c2, d2, s_start2 + 1].copy()
                        out[c2, d2, s_start2] = tmp0
                        out[c2, d2, s_start2 + 1] = tmp1
                elif not is_lab1 and not is_lab2:
                    # Swap single slots
                    out[c, d, s], out[c2, d2, s2] = (
                        out[c2, d2, s2].copy(),
                        out[c, d, s].copy(),
                    )
                else:
                    # One lab pair and one non-lab; skip to avoid breaking pairs
                    pass

        return out

    def run_ga(self) -> tuple[NDArray[np.int_], float]:
        """
        Execute the genetic algorithm and return the best timetable and its fitness.
        """
        log.info(
            "Starting GA with pop_size=%d, generations=%d",
            self.POP_SIZE,
            self.GENERATIONS,
        )
        log.info("department_id=%s", self.department_id)
        pop: list[NDArray[np.int_]] = [
            self.generate_random_timetable() for _ in range(self.POP_SIZE)
        ]

        for _ in range(self.GENERATIONS):
            scored = sorted(
                [(self.fitness(x), x) for x in pop],
                key=lambda t: t[0],
                reverse=True,
            )
            # Selection: top third (at least 2 parents)
            sel = [x for _, x in scored[: max(2, self.POP_SIZE // 3)]]

            # Elitism: carry forward best two
            new: list[NDArray[np.int_]] = [scored[0][1].copy(), scored[1][1].copy()]

            # Fill rest via crossover + mutation
            while len(new) < self.POP_SIZE:
                parents = random.sample(sel, 2)
                child = self.crossover(*parents)
                new.append(self.mutate(child))

            pop = new

        best = cast(NDArray[np.int_], max(pop, key=self.fitness))
        return best, float(self.fitness(best))

    # ---------------------------
    # Views
    # ---------------------------
    def generate_student_view(self, tt: NDArray[np.int_]) -> list[StudentTimetable]:
        """
        Build the student (class-wise) view from a timetable array.
        """
        data: list[StudentTimetable] = []
        for c in range(self.NUM_CLASSES):
            days: list[list[SlotInfo]] = []
            for d in range(self.DAYS):
                slots: list[SlotInfo] = []
                for s in range(self.SLOTS_PER_DAY):
                    subj, t, r = map(int, tt[c, d, s])
                    if subj == -1:
                        slots.append(SlotInfo(day=d, slot=s, is_free=True))
                    else:
                        slots.append(
                            SlotInfo(
                                subject_id=int(subj),
                                subject_name=self.SUBJ_NAMES[subj],
                                teacher_id=int(t),
                                teacher_name=self.TEACHER_NAMES[t]
                                if 0 <= t < len(self.TEACHER_NAMES)
                                else f"Teacher-{t}",
                                room_id=int(r),
                                room_name=self.ROOM_NAMES[r]
                                if 0 <= r < len(self.ROOM_NAMES)
                                else f"Room-{r}",
                                class_id=c,
                                class_name=self.CLASS_NAMES[c],
                                day=d,
                                slot=s,
                                session_type=(
                                    "lab"
                                    if int(subj) in getattr(self, "LAB_SUBJECTS", set())
                                    else self.SUBJECT_TYPES.get(int(subj), "lecture")
                                ),
                            )
                        )
                days.append(slots)
            data.append(
                StudentTimetable(
                    class_id=c, class_name=self.CLASS_NAMES[c], timetable=days
                )
            )
        return data

    def generate_teacher_view(self, tt: NDArray[np.int_]) -> list[TeacherTimetable]:
        """
        Build the teacher-wise view from a timetable array.
        """
        data: list[TeacherTimetable] = []
        for t in range(self.TOTAL_TEACHERS):
            sched: list[list[SlotInfo | None]] = [
                [None for _ in range(self.SLOTS_PER_DAY)] for _ in range(self.DAYS)
            ]
            hours = 0
            for c in range(self.NUM_CLASSES):
                for d in range(self.DAYS):
                    for s in range(self.SLOTS_PER_DAY):
                        subj, teacher, r = map(int, tt[c, d, s])
                        if teacher == t and subj != -1:
                            sched[d][s] = SlotInfo(
                                subject_id=int(subj),
                                subject_name=self.SUBJ_NAMES[subj],
                                teacher_id=t,
                                teacher_name=self.TEACHER_NAMES[t]
                                if 0 <= t < len(self.TEACHER_NAMES)
                                else f"Teacher-{t}",
                                room_id=r,
                                room_name=self.ROOM_NAMES[r]
                                if 0 <= r < len(self.ROOM_NAMES)
                                else f"Room-{r}",
                                class_id=c,
                                class_name=self.CLASS_NAMES[c],
                                day=d,
                                slot=s,
                                session_type=(
                                    "lab"
                                    if int(subj) in getattr(self, "LAB_SUBJECTS", set())
                                    else self.SUBJECT_TYPES.get(int(subj), "lecture")
                                ),
                            )
                            hours += 1
            data.append(
                TeacherTimetable(
                    teacher_id=t,
                    teacher_name=self.TEACHER_NAMES[t]
                    if 0 <= t < len(self.TEACHER_NAMES)
                    else f"Teacher-{t}",
                    total_hours=hours,
                    timetable=sched,
                )
            )
        return data

    def generate_combined_view(self, tt: NDArray[np.int_]) -> list[CombinedTimetable]:
        """
        Build the combined (slot-wise across all classes) view from a timetable array.
        """
        res: list[CombinedTimetable] = []
        for d in range(self.DAYS):
            for s in range(self.SLOTS_PER_DAY):
                assigns: list[SlotInfo] = []
                for c in range(self.NUM_CLASSES):
                    subj, t, r = map(int, tt[c, d, s])
                    if subj != -1:
                        assigns.append(
                            SlotInfo(
                                subject_id=subj,
                                subject_name=self.SUBJ_NAMES[subj],
                                teacher_id=t,
                                teacher_name=self.TEACHER_NAMES[t]
                                if 0 <= t < len(self.TEACHER_NAMES)
                                else f"Teacher-{t}",
                                room_id=r,
                                room_name=self.ROOM_NAMES[r]
                                if 0 <= r < len(self.ROOM_NAMES)
                                else f"Room-{r}",
                                class_id=c,
                                class_name=self.CLASS_NAMES[c],
                                day=d,
                                slot=s,
                                session_type=(
                                    "lab"
                                    if int(subj) in getattr(self, "LAB_SUBJECTS", set())
                                    else self.SUBJECT_TYPES.get(int(subj), "lecture")
                                ),
                            )
                        )
                res.append(CombinedTimetable(day=d, slot=s, assignments=assigns))
        return res

    def calculate_statistics(self, tt: NDArray[np.int_]) -> dict[str, int]:
        """
        Calculate basic utilization statistics for a timetable.
        """
        stats: dict[str, int] = {
            "total_slots": self.NUM_CLASSES * self.DAYS * self.SLOTS_PER_DAY,
            "occupied_slots": 0,
            "free_slots": 0,
        }
        occ = int(np.count_nonzero(tt[:, :, :, 0] != -1))
        stats["occupied_slots"] = occ
        stats["free_slots"] = int(stats["total_slots"] - occ)
        return stats


__all__ = ["TimetableGenerator"]
