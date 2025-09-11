import random
from prettytable import PrettyTable

# -----------------------------
# Constants
# -----------------------------
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
TIME_SLOTS = {
    "before_lunch": [("9:15", "10:10"), ("10:10", "11:05"), ("11:05", "12:00"), ("12:00", "12:55")],
    "after_lunch": [("13:50", "14:45"), ("14:45", "15:40"), ("15:40", "16:35")]
}

# -----------------------------
# Course + Section + Professor
# -----------------------------
courses = {
    "DSA": {"type": "Theory", "professor": "Ms. Rajinder Kaur"},
    "DSA Lab": {"type": "Lab", "professor": "Ms. Rajinder Kaur"},
    "OOP": {"type": "Theory", "professor": "Ms. Shivani Rana"},
    "OOP Lab": {"type": "Lab", "professor": "Ms. Shivani Rana"},
    "Maths": {"type": "Theory", "professor": "Mr. Somdutt"},
    "Tech": {"type": "Theory", "professor": "Ms. Navisha TPP"},
    "DE": {"type": "Theory", "professor": "Dr. Gagandeep Kaur"},
    "DE Lab": {"type": "Lab", "professor": "Dr. Gagandeep Kaur"},
    "Apt": {"type": "Theory", "professor": "Mr. Shehazad TPP"},
    "Verbal": {"type": "Theory", "professor": "Ms. Eva TPP"},
    "DoS": {"type": "Theory", "professor": "Ms. Anjuli"},
    "IT Workshop": {"type": "Lab", "professor": "Ms. Ramanjot / Dr. Jasmeen"},
}

sections = [
    {"id": "S1", "name": "CSE-A", "strength": 50},
    {"id": "S2", "name": "CSE-B", "strength": 100},
]

section_courses = {
    "S1": ["DSA", "DSA Lab", "OOP", "OOP Lab", "Maths"],
    "S2": ["Tech", "DE", "DE Lab", "Apt", "Verbal", "DoS"]
}

professors = {
    "Ms. Rajinder Kaur": {"max_courses": 6},
    "Ms. Shivani Rana": {"max_courses": 6},
    "Mr. Somdutt": {"max_courses": 6},
    "Ms. Navisha TPP": {"max_courses": 6},
    "Dr. Gagandeep Kaur": {"max_courses": 6},
    "Mr. Shehazad TPP": {"max_courses": 6},
    "Ms. Eva TPP": {"max_courses": 6},
    "Ms. Anjuli": {"max_courses": 6},
    "Ms. Ramanjot / Dr. Jasmeen": {"max_courses": 6}
}

rooms = [
    {"id": "R1", "name": "223 Lab", "size": 60, "type": "Lab"},
    {"id": "R2", "name": "614 Lab", "size": 60, "type": "Lab"},
    {"id": "R3", "name": "Lecture Hall", "size": 120, "type": "Theory"},
    {"id": "R4", "name": "Classroom 101", "size": 60, "type": "Theory"}
]

# -----------------------------
# Generate initial population
# -----------------------------
def generate_initial_population(size):
    population = []
    for _ in range(size):
        chromosome = []
        for section in sections:
            for cname in section_courses[section["id"]]:
                course = courses[cname]
                if course["type"] == "Lab":
                    day = random.choice(DAYS)
                    slot_pair = random.choice([(TIME_SLOTS["after_lunch"][i], TIME_SLOTS["after_lunch"][i+1]) for i in range(len(TIME_SLOTS["after_lunch"]) - 1)])
                    room = random.choice([r for r in rooms if r["type"] == "Lab"])
                    gene = {"course": cname, "section": section["id"], "professor": course["professor"], "day1": day, "time1": slot_pair[0], "day2": day, "time2": slot_pair[1], "room": room}
                else:
                    days = random.sample(DAYS, 2)
                    while abs(DAYS.index(days[0]) - DAYS.index(days[1])) <= 1:
                        days = random.sample(DAYS, 2)
                    room1 = random.choice([r for r in rooms if r["type"] == "Theory"])
                    room2 = random.choice([r for r in rooms if r["type"] == "Theory"])
                    gene = {"course": cname, "section": section["id"], "professor": course["professor"], "day1": days[0], "time1": random.choice(TIME_SLOTS["before_lunch"]), "room1": room1, "day2": days[1], "time2": random.choice(TIME_SLOTS["before_lunch"]), "room2": room2}
                chromosome.append(gene)
        population.append(chromosome)
    return population

# -----------------------------
# Fitness function
# -----------------------------
def fitness(chromosome):
    conflicts = 0
    room_usage = {}
    section_usage = {}
    prof_usage = {}

    for gene in chromosome:
        if "room" in gene:  # lab
            keys = [(gene["room"]["id"], gene["day1"], gene["time1"]), (gene["room"]["id"], gene["day2"], gene["time2"])]
        else:  # theory
            keys = [(gene["room1"]["id"], gene["day1"], gene["time1"]), (gene["room2"]["id"], gene["day2"], gene["time2"])]

        # Room conflict
        for k in keys:
            if k in room_usage: conflicts += 1
            else: room_usage[k] = 1

        # Section conflict
        for k in [(gene["section"], gene["day1"], gene["time1"]), (gene["section"], gene["day2"], gene["time2"])]:
            if k in section_usage: conflicts += 1
            else: section_usage[k] = 1

        # Professor load
        prof = gene["professor"]
        prof_usage[prof] = prof_usage.get(prof, 0) + 1
        if prof_usage[prof] > professors[prof]["max_courses"]:
            conflicts += 2  # heavy penalty

    return -conflicts

# -----------------------------
# Selection, crossover, mutation
# -----------------------------
def select_parent(population):
    return max(random.sample(population, 3), key=fitness)

def crossover(p1, p2):
    pt = random.randint(0, len(p1) - 1)
    return p1[:pt] + p2[pt:]

def mutate(chromosome, rate=0.1):
    for gene in chromosome:
        if random.random() < rate:
            gene["day1"] = random.choice(DAYS)
    return chromosome

# -----------------------------
# GA main loop
# -----------------------------
def genetic_algorithm(pop_size=10, generations=50):
    population = generate_initial_population(pop_size)
    for _ in range(generations):
        new_pop = []
        for _ in range(pop_size):
            p1, p2 = select_parent(population), select_parent(population)
            child = crossover(p1, p2)
            child = mutate(child)
            new_pop.append(child)
        population = sorted(new_pop, key=fitness, reverse=True)
    return population[0]

# -----------------------------
# Pretty print timetable
# -----------------------------
def print_timetable(chromosome):
    table = PrettyTable()
    table.field_names = ["Time Slot"] + DAYS
    for slot in TIME_SLOTS["before_lunch"] + TIME_SLOTS["after_lunch"]:
        row = [f"{slot[0]}-{slot[1]}"]
        for day in DAYS:
            entries = []
            for gene in chromosome:
                if "time1" in gene and (gene["day1"] == day and gene["time1"] == slot):
                    entries.append(f"{gene['course']} ({gene['section']})\n{gene['professor']}")
                if "time2" in gene and (gene["day2"] == day and gene["time2"] == slot):
                    entries.append(f"{gene['course']} ({gene['section']})\n{gene['professor']}")
            row.append("\n---\n".join(entries))
        table.add_row(row)
    print(table)

# -----------------------------
# Run GA
# -----------------------------
best = genetic_algorithm()
print("Best fitness:", fitness(best))
print_timetable(best)
