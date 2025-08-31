<h1> Smart Classroom & Timetable Scheduler </h1>
<h2>Background </h2>
  
Higher Education institutions often face challenges in efficient class scheduling due to limited infrastructure, faculty constraints, elective courses, and overlapping departmental requirements. Manual timetable preparation leads to frequent clashes in classes, underutilized classrooms, uneven workload distribution, and dissatisfied students and faculty members. With the increasing adoption of multidisciplinary curricula and flexible learning under NEP 2020, the class scheduling process has become more complex and dynamic, requiring intelligent and adaptive solutions.  
  
<h2>Description </h2>
  
The current scheduling mechanism in most higher education institutes/colleges relies on manual input via spreadsheets or basic tools. These fail to account for real-time availability of faculty, room capacity, teaching load norms, subject combinations, and student preferences. A solution is required that will accommodate the various parameters required for scheduling classes for UG and PG students and return an optimized timetable ensuring:  
• Maximized utilization of classrooms and laboratories  
• Minimized workload on faculty members and students  
• Achievement of required learning outcomes  
  
<h2>Key Parameters </h2>
  
The following parameters can be taken into account as variables for creating optimized timetables:  
- Number of classrooms available  
- Number of batches of students  
- Number of subjects to be taught in a particular semester  
- Names of subjects  
- Maximum number of classes per day  
- Number of classes to be conducted for a subject per week / per day  
- Number of faculties available for different subjects  
- Average number of leaves a faculty member takes in a month  
- Special classes that have fixed slots in timetable  
  
Students may also consider additional variables that may help in effective timetable preparation 
( <mark style="background: #BBFABBA6;">like Elective Clashes Across Departments and Lab Session Availability )</mark>  
  
<h2>Expected Solution</h2>
  
A web-based platform that can be linked to the college website. Authorized personnel will be able to login and input data against the listed variables to generate fully optimized timetables.  
  
The platform should include:  
• Login facility for authorized personnel to create and manage timetables  (<mark style="background: #BBFABBA6;"> Done: we have 3 roles for the app: admin, teacher, student)</mark>
• Multiple options of optimized timetables to choose from  (<mark style="background: #BBFABBA6;">Done: well be using backtracking + heuristics for the most optimized time tables </mark>)
• Review and approval workflow for competent authorities <mark style="background: #FFF3A3A6;">(tba) </mark>
• Suggestions for suitable rearrangements when optimal solutions are not available  <mark style="background: #BBFABBA6;">(Done: we'll be providing manual rearrangements also, if the algo is not working as expected</mark>)
• Support for multi-department and multi-shift scheduling (<mark style="background: #BBFABBA6;">Done</mark>)
