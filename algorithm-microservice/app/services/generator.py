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
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from ..models.request_models import TimetableRequest
from ..schemas.slot_info import SlotInfo
from ..schemas.student_timetable import StudentTimetable
from ..schemas.teacher_timetable import TeacherTimetable
from ..schemas.combined_timetable import CombinedTimetable


class TimetableGenerator:
    """
    Genetic Algorithm-powered timetable generator.

    This implementation mirrors the behavior and constraints from the original
    monolithic application to ensure drop-in compatibility.
    """

    def __init__(self, config: TimetableRequest):
        self.config = config

        # Core dimensions
        self.NUM_CLASSES = config.num_classes
        self.DAYS = config.days
        self.SLOTS_PER_DAY = config.slots_per_day

        # Resources
        self.TOTAL_ROOMS = config.total_rooms
        self.TOTAL_TEACHERS = config.total_teachers

        # Curriculum and constraints
        # Ensure integer keys (Pydantic may deserialize dicts with string keys)
        self.SUBJECT_HOURS: Dict[int, int] = {
            int(k): v for k, v in config.subject_hours.items()
        }
        self.NUM_SUBJECTS = max(self.SUBJECT_HOURS.keys()) + 1
        self.SUBJECT_TEACHERS: Dict[int, List[int]] = {
            int(k): v for k, v in config.subject_teachers.items()
        }
        self.MAX_HOURS_PER_DAY = config.max_hours_per_day
        self.MAX_HOURS_PER_WEEK = config.max_hours_per_week

        # Names/labels (fallbacks preserved)
        self.CLASS_NAMES = config.class_names or [
            f"Class-{i + 1}" for i in range(self.NUM_CLASSES)
        ]
        self.SUBJ_NAMES = config.subject_names or [
            f"Subject-{i}" for i in range(self.NUM_SUBJECTS)
        ]
        self.TEACHER_NAMES = config.teacher_names or [
            f"Teacher-{i}" for i in range(self.TOTAL_TEACHERS)
        ]
        self.ROOM_NAMES = config.room_names or [
            f"Room-{i}" for i in range(self.TOTAL_ROOMS)
        ]

        # GA settings
        self.POP_SIZE = config.population_size
        self.GENERATIONS = config.generations
        self.MUTATION_RATE = config.mutation_rate

    # ---------------------------
    # Generation helpers
    # ---------------------------
    def normalize_chromosome(self, chrom: Any) -> np.ndarray:
        """
        Normalize/validate a chromosome (timetable) to a consistent ndarray
        of shape (NUM_CLASSES, DAYS, SLOTS_PER_DAY, 3) with dtype=int, using -1
        as the sentinel for empty slots. Entries are [subject, teacher, room].
        """
        target = np.full(
            (self.NUM_CLASSES, self.DAYS, self.SLOTS_PER_DAY, 3), -1, dtype=int
        )
        chrom = np.array(chrom, copy=False)

        # Fast path if it's already correct shape and dtype
        if chrom.shape == target.shape and chrom.dtype != object:
            return chrom.astype(int)

        for c in range(self.NUM_CLASSES):
            for d in range(self.DAYS):
                for s in range(self.SLOTS_PER_DAY):
                    try:
                        entry = chrom[c][d][s]
                    except Exception:
                        entry = None

                    if entry is None or entry == -1:
                        continue

                    if isinstance(entry, (list, tuple, np.ndarray)):
                        if len(entry) == 3:
                            subj, teacher, room = map(int, entry)
                        elif len(entry) == 2:
                            subj, teacher = map(int, entry)
                            room = random.randrange(self.TOTAL_ROOMS)
                        else:
                            continue
                    else:
                        # Only subject provided; randomize permissible teacher/room
                        subj = int(entry)
                        teacher = random.randrange(self.TOTAL_TEACHERS)
                        room = random.randrange(self.TOTAL_ROOMS)

                    # Clamp/repair invalid indices
                    if subj < 0 or subj >= self.NUM_SUBJECTS:
                        subj = -1
                    if teacher < 0 or teacher >= self.TOTAL_TEACHERS:
                        teacher = random.randrange(self.TOTAL_TEACHERS)
                    if room < 0 or room >= self.TOTAL_ROOMS:
                        room = random.randrange(self.TOTAL_ROOMS)

                    if subj == -1:
                        continue

                    target[c, d, s] = [subj, teacher, room]

        return target

    def generate_random_timetable(self) -> np.ndarray:
        """
        Create a randomized timetable seeded by subject hour requirements per class.
        """
        tt = np.full(
            (self.NUM_CLASSES, self.DAYS, self.SLOTS_PER_DAY, 3), -1, dtype=int
        )
        for cls in range(self.NUM_CLASSES):
            subject_list: List[int] = []
            for subj, hrs in self.SUBJECT_HOURS.items():
                subject_list += [subj] * hrs

            # Trim to weekly capacity if needed
            total_slots = self.DAYS * self.SLOTS_PER_DAY
            subject_list = subject_list[:total_slots]
            random.shuffle(subject_list)

            idx = 0
            for d in range(self.DAYS):
                for s in range(self.SLOTS_PER_DAY):
                    if idx >= len(subject_list):
                        break
                    subj = subject_list[idx]
                    teacher = random.choice(
                        self.SUBJECT_TEACHERS.get(
                            subj, [random.randrange(self.TOTAL_TEACHERS)]
                        )
                    )
                    room = random.randrange(self.TOTAL_ROOMS)
                    tt[cls, d, s] = [subj, teacher, room]
                    idx += 1

        return tt

    # ---------------------------
    # Genetic Algorithm core
    # ---------------------------
    def fitness(self, chrom: Any) -> float:
        """
        Fitness function (higher is better). Penalizes:
        - Teacher double-booking within the same slot
        - Room double-booking within the same slot
        - Teacher teaching a subject they are not qualified for
        - Teacher exceeding daily or weekly hour limits
        - Mismatch between required and assigned subject hours per class
        """
        chrom = self.normalize_chromosome(chrom)
        penalty = 0

        # Teacher hour accumulators
        teacher_week = np.zeros(self.TOTAL_TEACHERS, dtype=int)
        teacher_day = np.zeros((self.TOTAL_TEACHERS, self.DAYS), dtype=int)

        for d in range(self.DAYS):
            for s in range(self.SLOTS_PER_DAY):
                t_seen, r_seen = set(), set()
                for c in range(self.NUM_CLASSES):
                    subj, teacher, room = chrom[c, d, s]
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

        # Exceeding teacher weekly/daily limits
        penalty += (
            int(np.sum(np.maximum(0, teacher_week - self.MAX_HOURS_PER_WEEK))) * 10
        )
        penalty += int(np.sum(np.maximum(0, teacher_day - self.MAX_HOURS_PER_DAY))) * 8

        # Subject hour mismatch per class
        for c in range(self.NUM_CLASSES):
            flat_subjects = chrom[c, :, :, 0].ravel()
            flat_subjects = flat_subjects[flat_subjects >= 0]  # filter free slots
            subj_counts = np.bincount(flat_subjects, minlength=self.NUM_SUBJECTS)
            for subj, hrs in self.SUBJECT_HOURS.items():
                have = subj_counts[subj] if subj < len(subj_counts) else 0
                penalty += abs(have - hrs) * 5

        return -float(penalty)

    def crossover(self, p1: np.ndarray, p2: np.ndarray) -> np.ndarray:
        """
        Single-point crossover along the class axis.
        """
        cut = random.randint(1, self.NUM_CLASSES - 1)
        child = p1.copy()
        child[cut:] = p2[cut:]
        return child

    def mutate(self, chrom: np.ndarray) -> np.ndarray:
        """
        Randomly mutate the timetable:
        - With 60% probability: replace a random slot with a new valid assignment.
        - Otherwise: swap two random slots.
        """
        out = chrom.copy()
        n = max(
            1,
            int(self.MUTATION_RATE * self.NUM_CLASSES * self.DAYS * self.SLOTS_PER_DAY),
        )

        for _ in range(n):
            c = random.randrange(self.NUM_CLASSES)
            d = random.randrange(self.DAYS)
            s = random.randrange(self.SLOTS_PER_DAY)

            if random.random() < 0.6:
                subj = random.choice(list(self.SUBJECT_HOURS.keys()))
                teacher = random.choice(
                    self.SUBJECT_TEACHERS.get(
                        subj, [random.randrange(self.TOTAL_TEACHERS)]
                    )
                )
                room = random.randrange(self.TOTAL_ROOMS)
                out[c, d, s] = [subj, teacher, room]
            else:
                c2 = random.randrange(self.NUM_CLASSES)
                d2 = random.randrange(self.DAYS)
                s2 = random.randrange(self.SLOTS_PER_DAY)
                out[c, d, s], out[c2, d2, s2] = (
                    out[c2, d2, s2].copy(),
                    out[c, d, s].copy(),
                )

        return out

    def run_ga(self) -> Tuple[np.ndarray, float]:
        """
        Execute the genetic algorithm and return the best timetable and its fitness.
        """
        pop: List[np.ndarray] = [
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
            new: List[np.ndarray] = [scored[0][1].copy(), scored[1][1].copy()]

            # Fill rest via crossover + mutation
            while len(new) < self.POP_SIZE:
                parents = random.sample(sel, 2)
                child = self.crossover(*parents)
                new.append(self.mutate(child))

            pop = new

        best = max(pop, key=self.fitness)
        return best, float(self.fitness(best))

    # ---------------------------
    # Views
    # ---------------------------
    def generate_student_view(self, tt: np.ndarray) -> List[StudentTimetable]:
        """
        Build the student (class-wise) view from a timetable array.
        """
        data: List[StudentTimetable] = []
        for c in range(self.NUM_CLASSES):
            days: List[List[SlotInfo]] = []
            for d in range(self.DAYS):
                slots: List[SlotInfo] = []
                for s in range(self.SLOTS_PER_DAY):
                    subj, t, r = tt[c, d, s]
                    if subj == -1:
                        slots.append(SlotInfo(day=d, slot=s, is_free=True))
                    else:
                        slots.append(
                            SlotInfo(
                                subject_id=int(subj),
                                subject_name=self.SUBJ_NAMES[subj],
                                teacher_id=int(t),
                                teacher_name=self.TEACHER_NAMES[t],
                                room_id=int(r),
                                room_name=self.ROOM_NAMES[r],
                                class_id=c,
                                class_name=self.CLASS_NAMES[c],
                                day=d,
                                slot=s,
                            )
                        )
                days.append(slots)
            data.append(
                StudentTimetable(
                    class_id=c, class_name=self.CLASS_NAMES[c], timetable=days
                )
            )
        return data

    def generate_teacher_view(self, tt: np.ndarray) -> List[TeacherTimetable]:
        """
        Build the teacher-wise view from a timetable array.
        """
        data: List[TeacherTimetable] = []
        for t in range(self.TOTAL_TEACHERS):
            sched: List[List[Optional[SlotInfo]]] = [
                [None for _ in range(self.SLOTS_PER_DAY)] for _ in range(self.DAYS)
            ]
            hours = 0
            for c in range(self.NUM_CLASSES):
                for d in range(self.DAYS):
                    for s in range(self.SLOTS_PER_DAY):
                        subj, teacher, r = tt[c, d, s]
                        if teacher == t and subj != -1:
                            sched[d][s] = SlotInfo(
                                subject_id=int(subj),
                                subject_name=self.SUBJ_NAMES[subj],
                                teacher_id=t,
                                teacher_name=self.TEACHER_NAMES[t],
                                room_id=r,
                                room_name=self.ROOM_NAMES[r],
                                class_id=c,
                                class_name=self.CLASS_NAMES[c],
                                day=d,
                                slot=s,
                            )
                            hours += 1
            data.append(
                TeacherTimetable(
                    teacher_id=t,
                    teacher_name=self.TEACHER_NAMES[t],
                    total_hours=hours,
                    timetable=sched,
                )
            )
        return data

    def generate_combined_view(self, tt: np.ndarray) -> List[CombinedTimetable]:
        """
        Build the combined (slot-wise across all classes) view from a timetable array.
        """
        res: List[CombinedTimetable] = []
        for d in range(self.DAYS):
            for s in range(self.SLOTS_PER_DAY):
                assigns: List[SlotInfo] = []
                for c in range(self.NUM_CLASSES):
                    subj, t, r = tt[c, d, s]
                    if subj != -1:
                        assigns.append(
                            SlotInfo(
                                subject_id=subj,
                                subject_name=self.SUBJ_NAMES[subj],
                                teacher_id=t,
                                teacher_name=self.TEACHER_NAMES[t],
                                room_id=r,
                                room_name=self.ROOM_NAMES[r],
                                class_id=c,
                                class_name=self.CLASS_NAMES[c],
                                day=d,
                                slot=s,
                            )
                        )
                res.append(CombinedTimetable(day=d, slot=s, assignments=assigns))
        return res

    def calculate_statistics(self, tt: np.ndarray) -> Dict[str, Any]:
        """
        Calculate basic utilization statistics for a timetable.
        """
        stats: Dict[str, Any] = {
            "total_slots": self.NUM_CLASSES * self.DAYS * self.SLOTS_PER_DAY,
            "occupied_slots": 0,
            "free_slots": 0,
        }
        occ = int(np.count_nonzero(tt[:, :, :, 0] != -1))
        stats["occupied_slots"] = occ
        stats["free_slots"] = int(stats["total_slots"] - occ)
        return stats


__all__ = ["TimetableGenerator"]
