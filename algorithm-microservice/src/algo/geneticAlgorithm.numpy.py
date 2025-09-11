# import numpy as np
# import random
# from prettytable import PrettyTable
#
# # ---------------------------
# # 1. Define Departments
# # ---------------------------
# DEPARTMENTS = {
#     "CSE": {
#         "classes": ["CSE-1A", "CSE-1B"],
#         "subjects": ["DSA", "OOP", "DBMS"],
#         "teachers": ["T1", "T2", "T3"],
#         "rooms": ["CSE-R1", "CSE-Lab1"]
#     },
#     "MCA": {
#         "classes": ["MCA-1"],
#         "subjects": ["AI", "ML", "DBMS"],
#         "teachers": ["T4", "T5"],
#         "rooms": ["MCA-R1", "MCA-Lab1"]
#     }
# }
#
# DAYS = 5
# SLOTS_PER_DAY = 6
#
# # Teacher-subject mapping
# TEACHER_SUBJECTS = {
#     "T1": ["DSA"],
#     "T2": ["OOP", "DBMS"],
#     "T3": ["DBMS"],
#     "T4": ["AI", "ML"],
#     "T5": ["DBMS", "ML"]
# }
#
# # ---------------------------
# # 2. Encode Entities as IDs
# # ---------------------------
# def build_index_map(items):
#     return {item: idx for idx, item in enumerate(items)}
#
# # Flatten global lists
# ALL_CLASSES = sum([d["classes"] for d in DEPARTMENTS.values()], [])
# ALL_SUBJECTS = list(set(sum([d["subjects"] for d in DEPARTMENTS.values()], [])))
# ALL_TEACHERS = list(set(sum([d["teachers"] for d in DEPARTMENTS.values()], [])))
# ALL_ROOMS = list(set(sum([d["rooms"] for d in DEPARTMENTS.values()], [])))
#
# CLASS_IDX = build_index_map(ALL_CLASSES)
# SUBJ_IDX = build_index_map(ALL_SUBJECTS)
# TEACH_IDX = build_index_map(ALL_TEACHERS)
# ROOM_IDX = build_index_map(ALL_ROOMS)
#
# # ---------------------------
# # 3. Timetable Representation
# # ---------------------------
# # timetable[class][day][slot] = [subject_id, teacher_id, room_id]
# def generate_random_timetable(num_classes):
#     return np.array([
#         [
#             [  # For each slot in a day
#                 [
#                     np.random.randint(len(ALL_SUBJECTS)),  # subject
#                     np.random.randint(len(ALL_TEACHERS)),  # teacher
#                     np.random.randint(len(ALL_ROOMS))      # room
#                 ]
#                 for _ in range(SLOTS_PER_DAY)
#             ]
#             for _ in range(DAYS)
#         ]
#         for _ in range(num_classes)
#     ], dtype=int)
#
#
# # ---------------------------
# # 4. Fitness Function
# # ---------------------------
# def calculate_fitness(timetable):
#     score = 0
#     num_classes = timetable.shape[0]
#
#     # Teacher clash check
#     for d in range(DAYS):
#         for s in range(SLOTS_PER_DAY):
#             teachers = timetable[:, d, s, 1]  # all teachers teaching at this slot
#             if len(teachers) != len(set(teachers)):
#                 score -= 10  # clash penalty
#
#     # Subject balance (per class)
#     for c in range(num_classes):
#         subj_counts = np.bincount(timetable[c, :, :, 0].flatten(), minlength=len(ALL_SUBJECTS))
#         variance = subj_counts.max() - subj_counts.min()
#         score -= variance
#
#     return score
#
#
# # ---------------------------
# # 5. Crossover + Mutation
# # ---------------------------
# def crossover(p1, p2):
#     mask = np.random.rand(*p1.shape) < 0.5
#     child = np.where(mask, p1, p2)
#     return child
#
# def mutate(timetable, rate=0.05):
#     mutated = timetable.copy()
#     mask = np.random.rand(*timetable.shape[:-1]) < rate
#     for idx in np.argwhere(mask):
#         c, d, s = idx
#         mutated[c, d, s] = [
#             np.random.randint(len(ALL_SUBJECTS)),
#             np.random.randint(len(ALL_TEACHERS)),
#             np.random.randint(len(ALL_ROOMS))
#         ]
#     return mutated
#
#
# # ---------------------------
# # 6. Run GA
# # ---------------------------
# def run_ga(num_classes, generations=100, pop_size=30):
#     population = [generate_random_timetable(num_classes) for _ in range(pop_size)]
#     for gen in range(generations):
#         scored = [(calculate_fitness(ind), ind) for ind in population]
#         scored.sort(reverse=True, key=lambda x: x[0])
#         best_score, best_tt = scored[0]
#         print(f"Gen {gen} Best fitness: {best_score}")
#
#         # Elitism + selection
#         new_pop = [best_tt]
#         while len(new_pop) < pop_size:
#             p1 = random.choice(scored[:10])[1]
#             p2 = random.choice(scored[:10])[1]
#             child = crossover(p1, p2)
#             child = mutate(child)
#             new_pop.append(child)
#         population = new_pop
#     return best_tt
#
#
# def print_class_timetable(class_id, best_timetable):
#     """
#     Prints timetable for a single class in 'image style':
#     - Days as rows
#     - Periods (P1..Pn) as columns
#     - Each cell = Subject\nTeacher (Room)
#     """
#     idx_to_class = {v: k for k, v in CLASS_IDX.items()}
#     idx_to_subj = {v: k for k, v in SUBJ_IDX.items()}
#     idx_to_teach = {v: k for k, v in TEACH_IDX.items()}
#     idx_to_room = {v: k for k, v in ROOM_IDX.items()}
#
#     class_name = idx_to_class[class_id]
#     print(f"\n📘 Timetable for {class_name}\n")
#
#     # Build table
#     table = PrettyTable()
#     table.field_names = ["Day"] + [f"P{s+1}" for s in range(SLOTS_PER_DAY)]
#
#     for d in range(DAYS):
#         row = [f"Day {d+1}"]
#         for s in range(SLOTS_PER_DAY):
#             subj_id, teach_id, room_id = best_timetable[class_id, d, s]
#             subj = idx_to_subj[subj_id]
#             teach = idx_to_teach[teach_id]
#             room = idx_to_room[room_id]
#             cell = f"{subj}\n{teach}\n({room})"
#             row.append(cell)
#         table.add_row(row)
#
#     print(table)
#
#
# def print_full_timetable(best_timetable):
#     """
#     Prints timetable for ALL classes in image-style tables
#     """
#     for c in range(best_timetable.shape[0]):
#         print_class_timetable(c, best_timetable)
#
#
# if __name__ == "__main__":
#     num_classes = len(ALL_CLASSES)
#     best_timetable = run_ga(num_classes)
#
#     print("\n✅ Best Timetable Generated!\n")
#     print_full_timetable(best_timetable)


# bigger scale algorithm 

import numpy as np
import random
from prettytable import PrettyTable

# ---------------------------
# CONFIG - adapt these
# ---------------------------
NUM_CLASSES = 20        # set 20-30 as you need
DAYS = 5
SLOTS_PER_DAY = 6
TOTAL_ROOMS = 25
TOTAL_TEACHERS = 40

# Example subjects and requirements (subject ids must be 0..N-1)
SUBJECT_HOURS = {
    0: 4,   # subject 0 => 4 hrs/week
    1: 3,
    2: 3,
    3: 2,
    4: 2,
    5: 2,
}
NUM_SUBJECTS = max(SUBJECT_HOURS.keys()) + 1

# Which teacher ids can teach which subject (teacher ids 0..TOTAL_TEACHERS-1)
SUBJECT_TEACHERS = {
    0: [0, 1, 2],
    1: [3, 4],
    2: [5, 6],
    3: [7, 8, 9],
    4: [10, 11],
    5: [12, 13, 14]
}

MAX_HOURS_PER_DAY = 6
MAX_HOURS_PER_WEEK = 20

# Optional names for display (replace with your real names)
CLASS_NAMES = [f"Class-{i+1}" for i in range(NUM_CLASSES)]
SUBJ_NAMES = [f"S{i}" for i in range(NUM_SUBJECTS)]
TEACHER_NAMES = [f"T{i}" for i in range(TOTAL_TEACHERS)]
ROOM_NAMES = [f"R{i}" for i in range(TOTAL_ROOMS)]

# ---------------------------
# UTIL: normalize any chromosome to int-array shape (C,D,S,3)
# ---------------------------
def normalize_chromosome(chrom):
    """
    Accepts:
      - numpy int array already shaped (C,D,S,3)
      - numpy/object array with tuples (subject, teacher) or (subject,teacher,room)
      - nested python lists
    Returns: numpy int array shape (NUM_CLASSES, DAYS, SLOTS_PER_DAY, 3)
    """
    target = np.full((NUM_CLASSES, DAYS, SLOTS_PER_DAY, 3), -1, dtype=int)

    chrom = np.array(chrom, copy=False)
    if chrom.shape == target.shape and chrom.dtype != object:
        return chrom.astype(int)

    # Otherwise try to read per slot
    for c in range(NUM_CLASSES):
        for d in range(DAYS):
            for s in range(SLOTS_PER_DAY):
                try:
                    entry = chrom[c][d][s]
                except Exception:
                    entry = None

                if entry is None or entry == -1:
                    continue

                # entry could be tuple/list/ndarray or single int
                if isinstance(entry, (list, tuple, np.ndarray)):
                    if len(entry) == 3:
                        subj, teacher, room = int(entry[0]), int(entry[1]), int(entry[2])
                    elif len(entry) == 2:
                        subj, teacher = int(entry[0]), int(entry[1])
                        room = random.randrange(TOTAL_ROOMS)
                    else:
                        # unknown shape: skip
                        continue
                else:
                    # single integer — interpret as subject only (rare)
                    subj = int(entry)
                    teacher = random.randrange(TOTAL_TEACHERS)
                    room = random.randrange(TOTAL_ROOMS)

                # bounds safety
                if subj < 0 or subj >= NUM_SUBJECTS:
                    subj = -1
                if teacher < 0 or teacher >= TOTAL_TEACHERS:
                    teacher = random.randrange(TOTAL_TEACHERS)
                if room < 0 or room >= TOTAL_ROOMS:
                    room = random.randrange(TOTAL_ROOMS)

                if subj == -1:
                    continue
                target[c, d, s, 0] = subj
                target[c, d, s, 1] = teacher
                target[c, d, s, 2] = room

    return target

# ---------------------------
# GENERATOR: create valid random timetable (int array)
# ---------------------------
def generate_random_timetable():
    tt = np.full((NUM_CLASSES, DAYS, SLOTS_PER_DAY, 3), -1, dtype=int)

    for cls in range(NUM_CLASSES):
        # build subject list by hours requirement
        subject_list = []
        for subj, hrs in SUBJECT_HOURS.items():
            subject_list += [subj] * hrs

        total_slots = DAYS * SLOTS_PER_DAY
        if len(subject_list) > total_slots:
            # truncate but warn (shouldn't happen)
            subject_list = subject_list[:total_slots]
        else:
            # remaining slots will stay -1 (free) or fill with electives if you want
            pass

        random.shuffle(subject_list)
        idx = 0
        for d in range(DAYS):
            for s in range(SLOTS_PER_DAY):
                if idx >= len(subject_list):
                    break
                subj = subject_list[idx]
                possible_teachers = SUBJECT_TEACHERS.get(subj)
                if not possible_teachers:
                    teacher = random.randrange(TOTAL_TEACHERS)
                else:
                    teacher = random.choice(possible_teachers)
                room = random.randrange(TOTAL_ROOMS)
                tt[cls, d, s] = [subj, teacher, room]
                idx += 1
    return tt

# ---------------------------
# FITNESS (robust) - returns higher is better
# ---------------------------
def fitness(chrom):
    chrom = normalize_chromosome(chrom)  # defensive
    penalty = 0

    # teacher load trackers
    teacher_week = np.zeros(TOTAL_TEACHERS, dtype=int)
    teacher_day = np.zeros((TOTAL_TEACHERS, DAYS), dtype=int)

    # check per (day,slot)
    for d in range(DAYS):
        for s in range(SLOTS_PER_DAY):
            teacher_seen = set()
            room_seen = set()
            for c in range(NUM_CLASSES):
                subj, teacher, room = chrom[c, d, s]
                if subj == -1:
                    continue

                # teacher clash
                if teacher in teacher_seen:
                    penalty += 50
                else:
                    teacher_seen.add(teacher)

                # room clash
                if room in room_seen:
                    penalty += 50
                else:
                    room_seen.add(room)

                # teacher load
                teacher_week[teacher] += 1
                teacher_day[teacher, d] += 1

                # teacher-subject compatibility (hard)
                if subj not in SUBJECT_TEACHERS or teacher not in SUBJECT_TEACHERS[subj]:
                    # big penalty / or repair
                    penalty += 20

    # teacher max hours check
    over_week = np.maximum(0, teacher_week - MAX_HOURS_PER_WEEK)
    penalty += np.sum(over_week) * 10

    over_day = np.maximum(0, teacher_day - MAX_HOURS_PER_DAY)
    penalty += np.sum(over_day) * 8

    # subject-hour per class check
    for c in range(NUM_CLASSES):
        subj_counts = np.bincount(chrom[c, :, :, 0].ravel()[chrom[c, :, :, 0].ravel() >= 0],
                                  minlength=NUM_SUBJECTS)
        for subj, required in SUBJECT_HOURS.items():
            have = subj_counts[subj] if subj < len(subj_counts) else 0
            penalty += abs(have - required) * 5

    # room capacity / availability checks (if you have room types, add penalties here)
    # e.g., keep some rooms reserved for labs; check room type compatibility

    score = -penalty
    return score

# ---------------------------
# CROSSOVER + MUTATION (operate on int arrays)
# ---------------------------
def crossover(p1, p2):
    # class-level crossover: for some classes take from p2
    child = p1.copy()
    cut = random.randint(1, NUM_CLASSES-1)
    child[cut:] = p2[cut:]
    return child

def mutate(chrom, mutation_rate=0.02):
    # chrom: numpy int array (C,D,S,3)
    out = chrom.copy()
    num_changes = int(mutation_rate * NUM_CLASSES * DAYS * SLOTS_PER_DAY)
    for _ in range(max(1, num_changes)):
        c = random.randrange(NUM_CLASSES)
        d = random.randrange(DAYS)
        s = random.randrange(SLOTS_PER_DAY)

        # either change subject (and choose compatible teacher), or change room, or swap slots
        if random.random() < 0.6:
            # change subject -> choose teacher compatible
            subj = random.choice(list(SUBJECT_HOURS.keys()))
            teachers = SUBJECT_TEACHERS.get(subj, None)
            teacher = random.choice(teachers) if teachers else random.randrange(TOTAL_TEACHERS)
            room = random.randrange(TOTAL_ROOMS)
            out[c, d, s] = [subj, teacher, room]
        else:
            # swap with another random slot in same class
            c2 = random.randrange(NUM_CLASSES)
            d2 = random.randrange(DAYS)
            s2 = random.randrange(SLOTS_PER_DAY)
            tmp = out[c, d, s].copy()
            out[c, d, s] = out[c2, d2, s2]
            out[c2, d2, s2] = tmp
    return out

# ---------------------------
# DISPLAY (PrettyTable)
# ---------------------------
def print_class_table(chrom, class_idx):
    chrom = normalize_chromosome(chrom)
    table = PrettyTable()
    table.field_names = ["Day"] + [f"P{p+1}" for p in range(SLOTS_PER_DAY)]
    for d in range(DAYS):
        row = [f"Day-{d+1}"]
        for s in range(SLOTS_PER_DAY):
            subj, teacher, room = chrom[class_idx, d, s]
            if subj == -1:
                row.append("Free")
            else:
                row.append(f"{SUBJ_NAMES[subj]}\n{TEACHER_NAMES[teacher]}\n({ROOM_NAMES[room]})")
        table.add_row(row)
    print(f"\nTimetable for {CLASS_NAMES[class_idx]}")
    print(table)

# ---------------------------
# SIMPLE GA LOOP (use the int-array representation)
# ---------------------------
def run_ga(pop_size=80, generations=200):
    population = [generate_random_timetable() for _ in range(pop_size)]
    for gen in range(generations):
        scored = [(fitness(ind), ind) for ind in population]
        scored.sort(reverse=True, key=lambda x: x[0])
        best_score, best_tt = scored[0]
        print(f"Gen {gen+1} best score: {best_score}")

        # selection: top 30%
        cutoff = max(2, pop_size // 3)
        selected = [ind for _, ind in scored[:cutoff]]

        # new population
        new_pop = []
        # elitism: keep top 2
        new_pop.extend([scored[0][1].copy(), scored[1][1].copy()])

        while len(new_pop) < pop_size:
            p1, p2 = random.sample(selected, 2)
            child = crossover(p1, p2)
            child = mutate(child, mutation_rate=0.02)
            new_pop.append(child)
        population = new_pop

    # return best
    scored = [(fitness(ind), ind) for ind in population]
    scored.sort(reverse=True, key=lambda x: x[0])
    return scored[0][1]

# ---------------------------
# Example run (wrap in __main__ in your script)
# ---------------------------
if __name__ == "__main__":
    best = run_ga(pop_size=60, generations=80)
    # print first 3 class timetables
    for c in range(min(3, NUM_CLASSES)):
        print_class_table(best, c)
