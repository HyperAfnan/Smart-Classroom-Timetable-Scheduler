#### Why not an LLM-based approach?

**Ans:**  
LLMs are powerful, but not suited for timetable generation because:

- **Hallucinations & errors:** LLMs might hallucinate or produce invalid timetables when handling large amounts of constraint-heavy data.
    
- **Nondeterministic results:** Same input can generate different timetables across runs, creating inconsistency and confusion.
    
- **Weak constraint handling:** LLMs are not designed to enforce hard rules (room capacity, faculty load, elective overlaps). They may ignore or misapply them.
    
- **Scalability limits:** Universities require multi-department, multi-shift scheduling with thousands of constraints. LLMs face context length issues and high compute costs at this scale.
    
- **Opaque decisions:** LLMs act as black boxes — it’s difficult to explain why a slot was assigned. In academic workflows requiring approval, this lack of transparency is unacceptable.
    
- **High cost & dependency:** Running LLMs reliably often requires external APIs or GPU hosting, which is costly for colleges and reduces self-sufficiency.
    

#### Why an Algorithmic approach?

**Ans:**  
Algorithms are the right fit for this project because:
- **Determinism & reliability:** Same inputs always produce the same timetable — essential for fairness and trust.
- **Strong constraint satisfaction:** Algorithms (CSP, graph coloring, ILP, heuristics, genetic algorithms) are designed to respect hard rules like faculty load, room size, fixed slots, and elective overlaps.
- **Transparency & auditability:** Every scheduling decision can be traced and explained to authorities for review and approval.
- **Scalability:** Algorithms can optimize across thousands of possible combinations efficiently.
- **Cost-effectiveness:** Runs on modest servers without expensive cloud APIs, making it affordable and sustainable for colleges.
- **Fairness & compliance:** Academic rules under NEP 2020 (balanced workloads, multidisciplinary scheduling) can be encoded directly into the algorithm, ensuring unbiased allocation.
####  How will your solution improve classroom utilization and faculty workload balance? 

**Ans:**  
Our solution directly addresses both **infrastructure utilization** and **faculty workload** through algorithmic optimization:

🔹 **1. Classroom Utilization**
- The algorithm ensures that **every available room** (classroom, lab, seminar hall) is used optimally by:
    - Avoiding clashes — no two batches in the same room at the same time.
    - Matching class size with room capacity (a 40-student class won’t be placed in a 200-seat auditorium).
    - Minimizing idle periods, so rooms aren’t left empty while students are free.
    - Distributing classes across the day and week to prevent overloading mornings and underusing afternoons.
👉 **Impact:** This reduces underutilization of classrooms and ensures institutions don’t feel the “artificial need” for more infrastructure when existing resources are sufficient.

🔹 **2. Faculty Workload Balance**
- The system keeps track of **maximum teaching hours per week/day** for each faculty, as per academic norms.
- It distributes subjects and sessions fairly across all faculty members to avoid:
    - Overloading some teachers while others are underutilized.
    - Assigning back-to-back classes without breaks.
    - Violating leave/availability constraints.
- The algorithm can also enforce **fairness rules** like ensuring electives and labs don’t all fall on the same faculty member.
👉 **Impact:** Faculty get a balanced teaching schedule, preventing burnout, and ensuring compliance with workload norms under NEP 2020.

🔹 **3. Joint Optimization**
- Classroom allocation and faculty load are solved **together**, not separately.
- For example, if two teachers are available at the same slot but one classroom is free, the algorithm ensures fair faculty allocation while making sure the classroom isn’t wasted.
#### What happens if there is no feasible solution?

**Ans:**  
In scheduling, there are cases where **all constraints cannot be satisfied simultaneously** — for example, too many subjects but not enough classrooms, or multiple electives clashing with limited faculty.
##### Our solution handles this gracefully in three steps:
🔹 **1. Detection of Infeasibility**
	- The algorithm will detect when constraints conflict and no valid timetable exists.
	- Instead of endlessly searching, it flags the infeasibility early.
🔹 **2. Suggestions for Rearrangement**
	- The system doesn’t stop at “no solution.”
	- It provides **guided suggestions** like:
	    - “Increase available classroom slots (evening shift).”
	    - “Reduce per-day class limit from 6 to 5.”
	    - “Reassign Subject X to Faculty Y.”
	    - “Move lab sessions to alternate days.”
- This gives administrators **actionable options** to make the timetable feasible.
🔹 **3. Multiple Near-Optimal Options**
	- If a perfect timetable is not possible, the algorithm can generate **near-optimal timetables** that satisfy most constraints while clearly marking which rules were relaxed (e.g., one faculty slightly exceeding teaching hours, or one elective shifted to evening).

