 # 5 population - 38 sec
 # 10 population - 2 min 30 sec
 # 15 population - 50 sec | 1 min 28 sec
 # 20 population -  3 min 6 sec | 1 min some sec

import random
from prettytable import PrettyTable,__all__

# Our Constants
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
TIME_SLOTS = {
    "before_lunch": [("9:15", "10:10"), ("10:10", "11:05"), ("11:05", "12:00"), ("12:00", "12:55"),],
    "after_lunch": [("13:50", "14:45"), ("14:45", "15:40"), ("15:40", "16:35")]
}
COURSE_TYPES = ["Theory", "Lab"]

# TODO: add more rooms for the timetable
ROOM_SIZES = {"classroom": 60, "large hall": 120}

# course, section, professor, and room data
courses = [
  {'name': 'DSA', 'type': 'Theory', 'professor': 'Ms. Rajinder Kaur', 'id': 4721},
  {'name': 'DSA Lab', 'type': 'Lab', 'professor': 'Ms. Rajinder Kaur', 'id': 6184},
  {'name': 'OOP', 'type': 'Theory', 'professor': 'Ms. Shivani Rana', 'id': 3057},
  {'name': 'OOP Lab', 'type': 'Lab', 'professor': 'Ms. Shivani Rana', 'id': 9872},
  {'name': 'Maths', 'type': 'Theory', 'professor': 'Mr. Somdutt', 'id': 4125},
  {'name': 'Tech', 'type': 'Theory', 'professor': 'Ms. Navisha TPP', 'id': 7609},
  {'name': 'DE', 'type': 'Theory', 'professor': 'Dr. Gagandeep Kaur', 'id': 1934},
  {'name': 'DE Lab', 'type': 'Lab', 'professor': 'Dr. Gagandeep Kaur', 'id': 8541},
  {'name': 'Apt', 'type': 'Theory', 'professor': 'Mr. Shehazad TPP', 'id': 2218},
  {'name': 'Verbal', 'type': 'Theory', 'professor': 'Ms. Eva TPP', 'id': 6547},
  {'name': 'DoS', 'type': 'Theory', 'professor': 'Ms. Anjuli', 'id': 8843},
  {'name': 'IT Workshop', 'type': 'Lab', 'professor': 'Ms. Ramanjot / Dr. Jasmeen', 'id': 7310}
]

# lockPosition = [
#      # {'course_id': 4721, 'section_id': 'S1', 'day1': 'Monday', 'time_slot1': ('9:15', '10:10'), 'room1': 'R1', 'day2': 'Wednesday', 'time_slot2': ('9:15', '10:10'), 'room2': 'R1'},
# ]

# TODO: add more sections for the timetable
sections = [
    {"id": "S1", "name": "A", "strength": 50},
    # {"id": "S2", "name": "B", "strength": 100},
    # {"id": "S3", "name": "C", "strength": 75}
]

professors = {
    "Prof1": {"name": "Ms. Rajinder Kaur", "max_courses": 3},
    "Prof2": {"name": "Ms. Shivani Rana", "max_courses": 3},
    "Prof3": {"name": "Mr. Somdutt", "max_courses": 3},
    "Prof4": {"name": "Ms. Navisha TPP", "max_courses": 3},
    "Prof5": {"name": "Dr. Gagandeep Kaur", "max_courses": 3},
    "Prof6": {"name": "Mr. Shehazad TPP", "max_courses": 3},
    "Prof7": {"name": "Ms. Eva TPP", "max_courses": 3},
    "Prof8": {"name": "Ms. Anjuli", "max_courses": 3},
    "Prof9": {"name": "Ms. Ramanjot", "max_courses": 3},
    "Prof10": {"name": "Dr. Jasmeen", "max_courses": 3}
}

# TODO: add more rooms for the timetable
rooms = [
    {"id": "R1", "name": "223 Lab, Block 2", "size": 60},
    {"id": "R2", "name": "614 Lab, Block 3", "size": 60},
    {"id": "R3", "name": "202 Lab, Block 3", "size": 60},
    {"id": "R4", "name": "222 Lab, Block 2", "size": 60},
    {"id": "R5", "name": "217 Lab, Block 2", "size": 60},
    {"id": "R6", "name": "Lecture Hall", "size": 120} 
]

print("Professors:\n", professors)
print("\nRooms:\n", rooms)

# Generate initial population of schedules
def generate_initial_population(size):
    population = []
    for _ in range(size):
        chromosome = []
        for course in courses:
            for section in sections:
                if course["type"] == "Lab":
                    # Randomly assign day, time slot, and room for lab courses
                    day = random.choice(DAYS)
                    time_slots = random.choice([(TIME_SLOTS["after_lunch"][i], TIME_SLOTS["after_lunch"][i+1]) for i in range(len(TIME_SLOTS["after_lunch"]) - 1)])
                    course_schedule = {
                        "course_id": course["id"],
                        "section_id": section["id"],
                        "day1": day,
                        "time_slot1": time_slots[0],
                        "room1": random.choice(rooms),
                        "day2": day,
                        "time_slot2": time_slots[1],
                        "room2": random.choice(rooms)
                    }
                else:
                    # Randomly assign days, time slots, and room for theory courses
                    days = random.sample(DAYS, 2)
                    while abs(DAYS.index(days[0]) - DAYS.index(days[1])) <= 1:
                        days = random.sample(DAYS, 2)
                    course_schedule = {
                        "course_id": course["id"],
                        "section_id": section["id"],
                        "day1": days[0],
                        "time_slot1": random.choice(TIME_SLOTS["before_lunch"]),
                        "room1": random.choice(rooms),
                        "day2": days[1],
                        "time_slot2": random.choice(TIME_SLOTS["before_lunch"]),
                        "room2": random.choice(rooms)
                    }
                chromosome.append(course_schedule)
        population.append(chromosome)
         
    return population

# Calculate fitness of a schedule
def fitness(chromosome):
    conflicts = 0
    room_timeslot_usage = {}
    section_timeslot_usage = {}

    for gene in chromosome:
        room1_key = (gene['room1']['id'], gene['day1'], gene['time_slot1'])
        if room1_key in room_timeslot_usage:
            conflicts += 1
        else:
            room_timeslot_usage[room1_key] = 1

        room2_key = (gene['room2']['id'], gene['day2'], gene['time_slot2'])
        if room2_key in room_timeslot_usage:
            conflicts += 1
        else:
            room_timeslot_usage[room2_key] = 1

        section1_key = (gene['section_id'], gene['day1'], gene['time_slot1'])
        if section1_key in section_timeslot_usage:
            conflicts += 1
        else:
            section_timeslot_usage[section1_key] = 1

        section2_key = (gene['section_id'], gene['day2'], gene['time_slot2'])
        if section2_key in section_timeslot_usage:
            conflicts += 1
        else:
            section_timeslot_usage[section2_key] = 1

        course = next((c for c in courses if c["id"] == gene["course_id"]), None)
        for other_gene in chromosome:
            if gene is not other_gene:
                other_course = next((c for c in courses if c["id"] == other_gene["course_id"]), None)
                if gene["day1"] == other_gene["day1"] and gene["time_slot1"] == other_gene["time_slot1"]:
                    if course and other_course and course["professor"] == other_course["professor"]:
                        conflicts += 1
                if gene["day2"] == other_gene["day2"] and gene["time_slot2"] == other_gene["time_slot2"]:
                    if course and other_course and course["professor"] == other_course["professor"]:
                        conflicts += 1

    return -conflicts

# Select parents for crossover using tournament selection
def select_parents(population):
    tournament_size = 5
    best = None
    for _ in range(tournament_size):
        individual = random.choice(population)
        if best is None or fitness(individual) > fitness(best):
            best = individual
    return best

# Perform crossover between two parents
def crossover(parent1, parent2):
    child = []
    crossover_pt1 = random.randint(0, len(parent1) - 1)
    crossover_pt2 = random.randint(crossover_pt1, len(parent1) - 1)
    child = parent1[:crossover_pt1] + parent2[crossover_pt1:crossover_pt2] + parent1[crossover_pt2:]
    return child

# Perform mutation on a chromosome
def mutate(chromosome):
    mutation_rate = 0.2
    for gene in chromosome:
        if random.random() < mutation_rate:
            course = next((c for c in courses if c["id"] == gene["course_id"]), None)
            if course["type"] == "Lab":
                gene["day1"] = random.choice(DAYS)
                gene["day2"] = gene["day1"]
                time_slots = random.choice([(TIME_SLOTS["after_lunch"][i], TIME_SLOTS["after_lunch"][i+1]) for i in range(len(TIME_SLOTS["after_lunch"]) - 1)])
                gene["time_slot1"] = time_slots[0]
                gene["time_slot2"] = time_slots[1]
            else:
                days = random.sample(DAYS, 2)
                while abs(DAYS.index(days[0]) - DAYS.index(days[1])) <= 1:
                    days = random.sample(DAYS, 2)
                gene["day1"] = days[0]
                gene["day2"] = days[1]
                gene["time_slot1"] = random.choice(TIME_SLOTS["before_lunch"])
                gene["time_slot2"] = random.choice(TIME_SLOTS["before_lunch"])
    return chromosome

# Perform genetic algorithm to find the best schedule
def genetic_algorithm(population_size):
    population = generate_initial_population(population_size)
    best_fitness = float('inf')
    while best_fitness != 0:
        new_population = sorted(population, key=fitness, reverse=True)[:2]
        while len(new_population) < population_size:
            parent1, parent2 = select_parents(population), select_parents(population)
            child = crossover(parent1, parent2)
            child = mutate(child)
            new_population.append(child)
        population = new_population
        best_fitness = -fitness(population[0])
    return population[0]

# Print the timetable schedule
def print_timetable(chromosome):
    table = PrettyTable()
    table.field_names = ["Time Slot", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    table.align = "l"
    table.hrules = 1

    schedule = {day: {slot: [] for slot in TIME_SLOTS["before_lunch"] + TIME_SLOTS["after_lunch"]} for day in DAYS}

    for gene in chromosome:
        course = next((c for c in courses if c["id"] == gene["course_id"]), None)
        section = next((s for s in sections if s["id"] == gene["section_id"]), None)
        info = f"{course['name']} ({course['type']})\nProf: {course['professor']}\nRoom: {gene['room1']['name']}\nSection: {section['name']}"
        schedule[gene["day1"]][(gene["time_slot1"][0], gene["time_slot1"][1])].append(info)
        if course["type"] == "Lab":
            schedule[gene["day2"]][(gene["time_slot2"][0], gene["time_slot2"][1])].append(info)
        else:
            info = f"{course['name']} ({course['type']})\nProf: {course['professor']}\nRoom: {gene['room2']['name']}\nSection: {section['name']}"
            schedule[gene["day2"]][(gene["time_slot2"][0], gene["time_slot2"][1])].append(info)

    for timeslot in TIME_SLOTS["before_lunch"] + TIME_SLOTS["after_lunch"]:
        row = [f"{timeslot[0]}-{timeslot[1]}"]
        for day in DAYS:
            if len(schedule[day][timeslot]) > 1:
                row.append("\n-----\n".join(schedule[day][timeslot]))
            else:
                row.append("\n".join(schedule[day][timeslot]))
        table.add_row(row)

    print(table)

# Run the genetic algorithm to find the best schedule and print it
best_schedule = genetic_algorithm(5)
print("Best Schedule Fitness:", fitness(best_schedule))
print_timetable(best_schedule)
