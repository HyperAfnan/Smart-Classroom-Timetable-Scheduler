from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import numpy as np
import random
from datetime import datetime
import traceback

app = FastAPI(title="Timetable Generator API")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------
# Pydantic Models
# ---------------------------
class TimetableRequest(BaseModel):
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


class SlotInfo(BaseModel):
    subject_id: Optional[int] = None
    subject_name: Optional[str] = None
    teacher_id: Optional[int] = None
    teacher_name: Optional[str] = None
    room_id: Optional[int] = None
    room_name: Optional[str] = None
    class_id: Optional[int] = None
    class_name: Optional[str] = None
    day: int
    slot: int
    is_free: bool = False


class StudentTimetable(BaseModel):
    class_id: int
    class_name: str
    timetable: List[List[SlotInfo]]


class TeacherTimetable(BaseModel):
    teacher_id: int
    teacher_name: str
    total_hours: int
    timetable: List[List[Optional[SlotInfo]]]


class CombinedTimetable(BaseModel):
    day: int
    slot: int
    assignments: List[SlotInfo]


class TimetableResponse(BaseModel):
    success: bool
    fitness_score: float
    generation_count: int
    student_timetables: List[StudentTimetable]
    teacher_timetables: List[TeacherTimetable]
    combined_view: List[CombinedTimetable]
    statistics: Dict[str, Any]


# ---------------------------
# Timetable Generator
# ---------------------------
class TimetableGenerator:
    def __init__(self, config: TimetableRequest):
        self.config = config
        self.NUM_CLASSES = config.num_classes
        self.DAYS = config.days
        self.SLOTS_PER_DAY = config.slots_per_day
        self.TOTAL_ROOMS = config.total_rooms
        self.TOTAL_TEACHERS = config.total_teachers
        self.SUBJECT_HOURS = {int(k): v for k, v in config.subject_hours.items()}
        self.NUM_SUBJECTS = max(self.SUBJECT_HOURS.keys()) + 1
        self.SUBJECT_TEACHERS = {int(k): v for k, v in config.subject_teachers.items()}
        self.MAX_HOURS_PER_DAY = config.max_hours_per_day
        self.MAX_HOURS_PER_WEEK = config.max_hours_per_week
        self.CLASS_NAMES = config.class_names or [f"Class-{i+1}" for i in range(self.NUM_CLASSES)]
        self.SUBJ_NAMES = config.subject_names or [f"Subject-{i}" for i in range(self.NUM_SUBJECTS)]
        self.TEACHER_NAMES = config.teacher_names or [f"Teacher-{i}" for i in range(self.TOTAL_TEACHERS)]
        self.ROOM_NAMES = config.room_names or [f"Room-{i}" for i in range(self.TOTAL_ROOMS)]
        self.POP_SIZE = config.population_size
        self.GENERATIONS = config.generations
        self.MUTATION_RATE = config.mutation_rate

    # --- generation helpers ---
    def normalize_chromosome(self, chrom):
        target = np.full((self.NUM_CLASSES, self.DAYS, self.SLOTS_PER_DAY, 3), -1, dtype=int)
        chrom = np.array(chrom, copy=False)
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
                        subj = int(entry)
                        teacher = random.randrange(self.TOTAL_TEACHERS)
                        room = random.randrange(self.TOTAL_ROOMS)
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

    def generate_random_timetable(self):
        tt = np.full((self.NUM_CLASSES, self.DAYS, self.SLOTS_PER_DAY, 3), -1, dtype=int)
        for cls in range(self.NUM_CLASSES):
            subject_list = []
            for subj, hrs in self.SUBJECT_HOURS.items():
                subject_list += [subj] * hrs
            total_slots = self.DAYS * self.SLOTS_PER_DAY
            subject_list = subject_list[:total_slots]
            random.shuffle(subject_list)
            idx = 0
            for d in range(self.DAYS):
                for s in range(self.SLOTS_PER_DAY):
                    if idx >= len(subject_list):
                        break
                    subj = subject_list[idx]
                    teacher = random.choice(self.SUBJECT_TEACHERS.get(subj, [random.randrange(self.TOTAL_TEACHERS)]))
                    room = random.randrange(self.TOTAL_ROOMS)
                    tt[cls, d, s] = [subj, teacher, room]
                    idx += 1
        return tt

    # --- GA core ---
    def fitness(self, chrom):
        chrom = self.normalize_chromosome(chrom)
        penalty = 0
        teacher_week = np.zeros(self.TOTAL_TEACHERS, dtype=int)
        teacher_day = np.zeros((self.TOTAL_TEACHERS, self.DAYS), dtype=int)
        for d in range(self.DAYS):
            for s in range(self.SLOTS_PER_DAY):
                t_seen, r_seen = set(), set()
                for c in range(self.NUM_CLASSES):
                    subj, teacher, room = chrom[c, d, s]
                    if subj == -1:
                        continue
                    if teacher in t_seen:
                        penalty += 50
                    else:
                        t_seen.add(teacher)
                    if room in r_seen:
                        penalty += 50
                    else:
                        r_seen.add(room)
                    teacher_week[teacher] += 1
                    teacher_day[teacher, d] += 1
                    if teacher not in self.SUBJECT_TEACHERS.get(subj, []):
                        penalty += 20
        penalty += np.sum(np.maximum(0, teacher_week - self.MAX_HOURS_PER_WEEK)) * 10
        penalty += np.sum(np.maximum(0, teacher_day - self.MAX_HOURS_PER_DAY)) * 8
        for c in range(self.NUM_CLASSES):
            subj_counts = np.bincount(chrom[c, :, :, 0].ravel()[chrom[c, :, :, 0].ravel() >= 0],
                                      minlength=self.NUM_SUBJECTS)
            for subj, hrs in self.SUBJECT_HOURS.items():
                have = subj_counts[subj] if subj < len(subj_counts) else 0
                penalty += abs(have - hrs) * 5
        return -penalty

    def crossover(self, p1, p2):
        cut = random.randint(1, self.NUM_CLASSES - 1)
        child = p1.copy()
        child[cut:] = p2[cut:]
        return child

    def mutate(self, chrom):
        out = chrom.copy()
        n = max(1, int(self.MUTATION_RATE * self.NUM_CLASSES * self.DAYS * self.SLOTS_PER_DAY))
        for _ in range(n):
            c, d, s = random.randrange(self.NUM_CLASSES), random.randrange(self.DAYS), random.randrange(self.SLOTS_PER_DAY)
            if random.random() < 0.6:
                subj = random.choice(list(self.SUBJECT_HOURS.keys()))
                teacher = random.choice(self.SUBJECT_TEACHERS.get(subj, [random.randrange(self.TOTAL_TEACHERS)]))
                room = random.randrange(self.TOTAL_ROOMS)
                out[c, d, s] = [subj, teacher, room]
            else:
                c2, d2, s2 = random.randrange(self.NUM_CLASSES), random.randrange(self.DAYS), random.randrange(self.SLOTS_PER_DAY)
                out[c, d, s], out[c2, d2, s2] = out[c2, d2, s2], out[c, d, s]
        return out

    def run_ga(self):
        pop = [self.generate_random_timetable() for _ in range(self.POP_SIZE)]
        for _ in range(self.GENERATIONS):
            scored = sorted([(self.fitness(x), x) for x in pop], key=lambda t: t[0], reverse=True)
            sel = [x for _, x in scored[:max(2, self.POP_SIZE // 3)]]
            new = [scored[0][1].copy(), scored[1][1].copy()]
            while len(new) < self.POP_SIZE:
                c = self.crossover(*random.sample(sel, 2))
                new.append(self.mutate(c))
            pop = new
        best = max(pop, key=self.fitness)
        return best, self.fitness(best)

    # --- Views ---
    def generate_student_view(self, tt):
        data = []
        for c in range(self.NUM_CLASSES):
            days = []
            for d in range(self.DAYS):
                slots = []
                for s in range(self.SLOTS_PER_DAY):
                    subj, t, r = tt[c, d, s]
                    if subj == -1:
                        slots.append(SlotInfo(day=d, slot=s, is_free=True))
                    else:
                        slots.append(SlotInfo(
                            subject_id=int(subj),
                            subject_name=self.SUBJ_NAMES[subj],
                            teacher_id=int(t),
                            teacher_name=self.TEACHER_NAMES[t],
                            room_id=int(r),
                            room_name=self.ROOM_NAMES[r],
                            class_id=c,
                            class_name=self.CLASS_NAMES[c],
                            day=d, slot=s
                        ))
                days.append(slots)
            data.append(StudentTimetable(class_id=c, class_name=self.CLASS_NAMES[c], timetable=days))
        return data

    def generate_teacher_view(self, tt):
        data = []
        for t in range(self.TOTAL_TEACHERS):
            sched = [[None for _ in range(self.SLOTS_PER_DAY)] for _ in range(self.DAYS)]
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
                                day=d, slot=s
                            )
                            hours += 1
            data.append(TeacherTimetable(teacher_id=t, teacher_name=self.TEACHER_NAMES[t], total_hours=hours,
                                         timetable=sched))
        return data

    def generate_combined_view(self, tt):
        res = []
        for d in range(self.DAYS):
            for s in range(self.SLOTS_PER_DAY):
                assigns = []
                for c in range(self.NUM_CLASSES):
                    subj, t, r = tt[c, d, s]
                    if subj != -1:
                        assigns.append(SlotInfo(
                            subject_id=subj,
                            subject_name=self.SUBJ_NAMES[subj],
                            teacher_id=t,
                            teacher_name=self.TEACHER_NAMES[t],
                            room_id=r,
                            room_name=self.ROOM_NAMES[r],
                            class_id=c,
                            class_name=self.CLASS_NAMES[c],
                            day=d, slot=s
                        ))
                res.append(CombinedTimetable(day=d, slot=s, assignments=assigns))
        return res

    def calculate_statistics(self, tt):
        stats = {
            "total_slots": self.NUM_CLASSES * self.DAYS * self.SLOTS_PER_DAY,
            "occupied_slots": 0,
            "free_slots": 0,
        }
        occ = np.count_nonzero(tt[:, :, :, 0] != -1)
        stats["occupied_slots"] = int(occ)
        stats["free_slots"] = int(stats["total_slots"] - occ)
        return stats


# ---------------------------
# Routes
# ---------------------------
@app.post("/generate-timetable", response_model=TimetableResponse)
async def generate_timetable(request: TimetableRequest):
    try:
        gen = TimetableGenerator(request)
        best, score = gen.run_ga()
        return TimetableResponse(
            success=True,
            fitness_score=float(score),
            generation_count=request.generations,
            student_timetables=gen.generate_student_view(best),
            teacher_timetables=gen.generate_teacher_view(best),
            combined_view=gen.generate_combined_view(best),
            statistics=gen.calculate_statistics(best)
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Timetable Generator API", "version": "1.0.0"}


@app.get("/example-request")
async def example_request():
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
        "room_names": ["R0", "R1", "R2", "R3", "R4", "R5"]
    }

@app.post("/generate-timetable/flat")
async def generate_timetable_flat(request: TimetableRequest = Body(...)) -> List[dict]:
    """
    Generate timetable and return a flat list of slots
    with fields ready for the React table.
    """
    try:
        gen = TimetableGenerator(request)
        best, _ = gen.run_ga()

        flat: List[dict] = []
        for c in range(gen.NUM_CLASSES):
            for d in range(gen.DAYS):
                for s in range(gen.SLOTS_PER_DAY):
                    subj, teacher, room = best[c, d, s]
                    if subj == -1:
                        continue
                    flat.append({
                        "class_id": c,
                        "day": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d],
                        "start_time": f"{9 + s}:00",   # adjust to your real slot mapping
                        "subject_id": subj,
                        "teacher_id": teacher,
                        "room_id": room,
                        "type": "theory",  # or decide based on your logic
                    })
        return flat

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
