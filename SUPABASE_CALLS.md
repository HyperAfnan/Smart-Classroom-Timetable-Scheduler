# Supabase Calls in Frontend Source

This document lists all Supabase interactions found in `frontend/src`, categorized by their purpose.

## 1. Authentication
These calls handle user sessions, login, and logout.

- **Sign In:** `supabase.auth.signInWithPassword({ email, password })`
  - *Location:* `features/auth/loginpage.jsx`
- **Get Session:** `supabase.auth.getSession()`
  - *Location:* `features/auth/authInit.jsx`
- **Auth State Listener:** `supabase.auth.onAuthStateChange(...)`
  - *Location:* `features/auth/authInit.jsx`
- **Sign Out:** `supabase.auth.signOut()`
  - *Location:* `shared/components/SideBar.jsx`

## 2. Database (Tables)
Interactions with specific database tables.

### `classes`
- **Select:** `select("*")`
- **Insert:** `insert([classPayload])`
- **Update:** `update(updates)`
- **Delete:** `delete().eq("id", id)`
- *Locations:*
  - `features/admin-role/classes/hooks/useClasses.js`
  - `features/admin-role/dashboard/hooks/useDashboardStats.js`
  - `features/admin-role/timetableViewer/hooks/useTimetableViewer.js`

### `room`
- **Select:** `select("*")`
- **Insert:** `insert([room])`
- **Update:** `update(updates)`
- **Delete:** `delete().eq("id", id)`
- *Locations:*
  - `features/admin-role/rooms/hooks/useRoom.js`
  - `features/admin-role/dashboard/hooks/useDashboardStats.js`

### `subjects`
- **Select:** `select("*")`
- **Insert:** `insert([prepared])`
- **Update:** `update(prepared)`
- **Delete:** `delete().eq("id", id)`
- *Locations:*
  - `features/admin-role/subjects/hooks/useSubjects.js`
  - `features/admin-role/subjects/hooks/useSubjectMutations.js`
  - `features/admin-role/dashboard/hooks/useDashboardStats.js`

### `teacher_profile`
- **Select:** `select("*")` (often with `.eq("email", ...)` or `.eq("department_id", ...)`)
- **Update:** `update(updates).eq("id", id)`
- **Delete:** `delete().eq("id", id)`
- *Locations:*
  - `features/admin-role/teachers/hooks/useTeachers.js`
  - `features/admin-role/teachers/hooks/useTeacherMutations.js`
  - `features/teacher-role/shared/hooks/useTeacherProfile.js`
  - `features/auth/authInit.jsx`
  - `features/auth/loginpage.jsx`

### `teacher_subjects`
- **Select:** `select("*")` or `select("subject")`
- **Insert:** `insert([payload])`
- **Update:** `update({ subject })`
- **Delete:** `delete().eq(...)`
- *Locations:*
  - `features/admin-role/teachers/hooks/useTeacherSubjects.js`
  - `features/admin-role/teachers/hooks/useTeacherSubjectsMutations.js`
  - `features/auth/authInit.jsx`

### `timetable_entries`
- **Select:** `select("*, time_slots(*)")`
- **Delete:** `delete("*").eq("department_id", ...)`
- **Upsert:** (Implied in mutation logic)
- *Locations:*
  - `features/admin-role/timetable/hooks/useTimetable.js`
  - `features/admin-role/timetable/hooks/useTimetableMutation.js`
  - `features/admin-role/timetableViewer/hooks/useTimetableViewer.js`

### `time_slots`
- **Select:** `select("*")`
- *Locations:*
  - `features/admin-role/timetable/hooks/useTimetableMutation.js`
  - `features/admin-role/timetableViewer/hooks/useTimetableViewer.js`
  - `features/admin-role/dashboard/hooks/useDashboardStats.js`

### `department`
- **Select:** `select("name")`
- *Locations:*
  - `features/admin-role/subjects/hooks/useSubjects.js`
  - `features/admin-role/teachers/hooks/useTeachers.js`

### `user_roles`
- **Select:** `select("roles(role_name)")`
- *Locations:*
  - `features/auth/authInit.jsx`
  - `features/auth/loginpage.jsx`

### `hod_profile`
- **Select:** `select("*")`
- *Locations:*
  - `features/auth/authInit.jsx`
  - `features/auth/loginpage.jsx`

### `student_profile`
- **Select:** `select("*")`
- *Locations:*
  - `features/auth/authInit.jsx`
  - `features/auth/loginpage.jsx`

### `profiles`
- **Update:** `update(...)`
- *Location:* `features/teacher-role/shared/hooks/useTeacherProfileMutations.js`

## 3. Edge Functions
Calls to Supabase Edge Functions.

- **Invoke:** `supabase.functions.invoke("teacher-creation", { body: teacher })`
  - *Location:* `features/admin-role/teachers/hooks/useTeacherMutations.js`

## 4. Storage
Calls to Supabase Storage buckets.

- **Upload:** `supabase.storage.from("avatars").upload(...)`
  - *Location:* `features/teacher-role/shared/hooks/useTeacherProfileMutations.js`
