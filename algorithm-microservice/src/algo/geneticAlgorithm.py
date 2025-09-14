# import random
# from prettytable import PrettyTable
#
# # -----------------------------
# # Constants
# # -----------------------------
# DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
# TIME_SLOTS = {
#     "before_lunch": [("9:15", "10:10"), ("10:10", "11:05"), ("11:05", "12:00"), ("12:00", "12:55")],
#     "after_lunch": [("13:50", "14:45"), ("14:45", "15:40"), ("15:40", "16:35")]
# }
#
# # -----------------------------
# # Course + Section + Professor
# # -----------------------------
# courses = {
#     "DSA": {"type": "Theory", "professor": "Ms. Rajinder Kaur"},
#     "DSA Lab": {"type": "Lab", "professor": "Ms. Rajinder Kaur"},
#     "OOP": {"type": "Theory", "professor": "Ms. Shivani Rana"},
#     "OOP Lab": {"type": "Lab", "professor": "Ms. Shivani Rana"},
#     "Maths": {"type": "Theory", "professor": "Mr. Somdutt"},
#     "Tech": {"type": "Theory", "professor": "Ms. Navisha TPP"},
#     "DE": {"type": "Theory", "professor": "Dr. Gagandeep Kaur"},
#     "DE Lab": {"type": "Lab", "professor": "Dr. Gagandeep Kaur"},
#     "Apt": {"type": "Theory", "professor": "Mr. Shehazad TPP"},
#     "Verbal": {"type": "Theory", "professor": "Ms. Eva TPP"},
#     "DoS": {"type": "Theory", "professor": "Ms. Anjuli"},
#     "IT Workshop": {"type": "Lab", "professor": "Ms. Ramanjot / Dr. Jasmeen"},
# }
#
# sections = [
#     {"id": "S1", "name": "CSE-A", "strength": 50},
#     {"id": "S2", "name": "CSE-B", "strength": 100},
# ]
#
# section_courses = {
#     "S1": ["DSA", "DSA Lab", "OOP", "OOP Lab", "Maths"],
#     "S2": ["Tech", "DE", "DE Lab", "Apt", "Verbal", "DoS"]
# }
#
# professors = {
#     "Ms. Rajinder Kaur": {"max_courses": 6},
#     "Ms. Shivani Rana": {"max_courses": 6},
#     "Mr. Somdutt": {"max_courses": 6},
#     "Ms. Navisha TPP": {"max_courses": 6},
#     "Dr. Gagandeep Kaur": {"max_courses": 6},
#     "Mr. Shehazad TPP": {"max_courses": 6},
#     "Ms. Eva TPP": {"max_courses": 6},
#     "Ms. Anjuli": {"max_courses": 6},
#     "Ms. Ramanjot / Dr. Jasmeen": {"max_courses": 6}
# }
#
# rooms = [
#     {"id": "R1", "name": "223 Lab", "size": 60, "type": "Lab"},
#     {"id": "R2", "name": "614 Lab", "size": 60, "type": "Lab"},
#     {"id": "R3", "name": "Lecture Hall", "size": 120, "type": "Theory"},
#     {"id": "R4", "name": "Classroom 101", "size": 60, "type": "Theory"}
# ]
#
# # -----------------------------
# # Generate initial population
# # -----------------------------
# def generate_initial_population(size):
#     population = []
#     for _ in range(size):
#         chromosome = []
#         for section in sections:
#             for cname in section_courses[section["id"]]:
#                 course = courses[cname]
#                 if course["type"] == "Lab":
#                     day = random.choice(DAYS)
#                     slot_pair = random.choice([(TIME_SLOTS["after_lunch"][i], TIME_SLOTS["after_lunch"][i+1]) for i in range(len(TIME_SLOTS["after_lunch"]) - 1)])
#                     room = random.choice([r for r in rooms if r["type"] == "Lab"])
#                     gene = {"course": cname, "section": section["id"], "professor": course["professor"], "day1": day, "time1": slot_pair[0], "day2": day, "time2": slot_pair[1], "room": room}
#                 else:
#                     days = random.sample(DAYS, 2)
#                     while abs(DAYS.index(days[0]) - DAYS.index(days[1])) <= 1:
#                         days = random.sample(DAYS, 2)
#                     room1 = random.choice([r for r in rooms if r["type"] == "Theory"])
#                     room2 = random.choice([r for r in rooms if r["type"] == "Theory"])
#                     gene = {"course": cname, "section": section["id"], "professor": course["professor"], "day1": days[0], "time1": random.choice(TIME_SLOTS["before_lunch"]), "room1": room1, "day2": days[1], "time2": random.choice(TIME_SLOTS["before_lunch"]), "room2": room2}
#                 chromosome.append(gene)
#         population.append(chromosome)
#     return population
#
# # -----------------------------
# # Fitness function
# # -----------------------------
# def fitness(chromosome):
#     conflicts = 0
#     room_usage = {}
#     section_usage = {}
#     prof_usage = {}
#
#     for gene in chromosome:
#         if "room" in gene:  # lab
#             keys = [(gene["room"]["id"], gene["day1"], gene["time1"]), (gene["room"]["id"], gene["day2"], gene["time2"])]
#         else:  # theory
#             keys = [(gene["room1"]["id"], gene["day1"], gene["time1"]), (gene["room2"]["id"], gene["day2"], gene["time2"])]
#
#         # Room conflict
#         for k in keys:
#             if k in room_usage: conflicts += 1
#             else: room_usage[k] = 1
#
#         # Section conflict
#         for k in [(gene["section"], gene["day1"], gene["time1"]), (gene["section"], gene["day2"], gene["time2"])]:
#             if k in section_usage: conflicts += 1
#             else: section_usage[k] = 1
#
#         # Professor load
#         prof = gene["professor"]
#         prof_usage[prof] = prof_usage.get(prof, 0) + 1
#         if prof_usage[prof] > professors[prof]["max_courses"]:
#             conflicts += 2  # heavy penalty
#
#     return -conflicts
#
# # -----------------------------
# # Selection, crossover, mutation
# # -----------------------------
# def select_parent(population):
#     return max(random.sample(population, 3), key=fitness)
#
# def crossover(p1, p2):
#     pt = random.randint(0, len(p1) - 1)
#     return p1[:pt] + p2[pt:]
#
# def mutate(chromosome, rate=0.1):
#     for gene in chromosome:
#         if random.random() < rate:
#             gene["day1"] = random.choice(DAYS)
#     return chromosome
#
# # -----------------------------
# # GA main loop
# # -----------------------------
# def genetic_algorithm(pop_size=10, generations=50):
#     population = generate_initial_population(pop_size)
#     for _ in range(generations):
#         new_pop = []
#         for _ in range(pop_size):
#             p1, p2 = select_parent(population), select_parent(population)
#             child = crossover(p1, p2)
#             child = mutate(child)
#             new_pop.append(child)
#         population = sorted(new_pop, key=fitness, reverse=True)
#     return population[0]
#
# # -----------------------------
# # Pretty print timetable
# # -----------------------------
# def print_timetable(chromosome):
#     table = PrettyTable()
#     table.field_names = ["Time Slot"] + DAYS
#     for slot in TIME_SLOTS["before_lunch"] + TIME_SLOTS["after_lunch"]:
#         row = [f"{slot[0]}-{slot[1]}"]
#         for day in DAYS:
#             entries = []
#             for gene in chromosome:
#                 if "time1" in gene and (gene["day1"] == day and gene["time1"] == slot):
#                     entries.append(f"{gene['course']} ({gene['section']})\n{gene['professor']}")
#                 if "time2" in gene and (gene["day2"] == day and gene["time2"] == slot):
#                     entries.append(f"{gene['course']} ({gene['section']})\n{gene['professor']}")
#             row.append("\n---\n".join(entries))
#         table.add_row(row)
#     print(table)
#
# # -----------------------------
# # Run GA
# # -----------------------------
# best = genetic_algorithm()
# print("Best fitness:", fitness(best))
# print_timetable(best)


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
