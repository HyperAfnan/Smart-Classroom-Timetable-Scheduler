import {
  pgTable,
  serial,
  text,
  uuid,
  timestamp,
  integer,
  smallint,
  time,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------------------------------------
// ENUM DEFINITIONS
// ----------------------------------------
export const roomTypeEnum = pgEnum("room_type_enum", [
  "CLASSROOM",
  "LAB",
  "SEMINAR",
  "OTHER",
]);

export const subjectTypeEnum = pgEnum("subject_type_enum", [
  "THEORY",
  "LAB",
  "TUTORIAL",
  "ELECTIVE",
]);

export const weekdayEnum = pgEnum("weekday_enum", [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
]);

// ----------------------------------------
// DEPARTMENT
// ----------------------------------------
export const department = pgTable("department", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  name: text("name").notNull().unique(),
});

// ----------------------------------------
// CLASSES
// ----------------------------------------
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  className: text("class_name").notNull().unique(),
  semester: smallint("semester"),
  academicYear: text("academic_year"),
  section: text("section"),
  studentsCount: integer("students_count"),
  departmentId: integer("department_id").references(() => department.id),
});

// ----------------------------------------
// TEACHER PROFILE
// ----------------------------------------
export const teacherProfile = pgTable("teacher_profile", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: uuid("user_id").unique(),

  empId: text("emp_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  name: text("name"),

  email: text("email").notNull().unique(),
  phone: text("phone").unique(),

  designation: text("designation"),
  maxHours: smallint("max_hours"),
  bio: text("bio"),

  departmentId: integer("department_id").references(() => department.id),
});

// ----------------------------------------
// STUDENT PROFILE
// ----------------------------------------
export const studentProfile = pgTable("student_profile", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: uuid("user_id").unique(),

  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),

  semester: smallint("semester"),
  rollNumber: text("roll_number").unique(),

  classId: integer("class_id").references(() => classes.id),
  bio: text("bio"),
});

// ----------------------------------------
// HOD PROFILE
// ----------------------------------------
export const hodProfile = pgTable("hod_profile", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: uuid("user_id").unique(),

  teacherId: integer("teacher_id")
    .references(() => teacherProfile.id)
    .unique(),

  departmentId: integer("department_id")
    .references(() => department.id)
    .unique(),

  maxHours: smallint("max_hours"),
  bio: text("bio"),
});

// ----------------------------------------
// TIMETABLE COORDINATOR
// ----------------------------------------
export const timetableCoordinator = pgTable("timetable_coordinator_profile", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  userId: uuid("user_id").unique(),
  teacherId: integer("teacher_id")
    .references(() => teacherProfile.id)
    .unique(),
  departmentId: integer("department_id")
    .references(() => department.id)
    .unique(),
});

// ----------------------------------------
// SUBJECTS
// ----------------------------------------
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  subjectName: text("subject_name").notNull().unique(),
  subjectCode: text("subject_code").notNull().unique(),

  semester: smallint("semester"),
  type: subjectTypeEnum("type"),

  credits: smallint("credits"),
  hoursPerWeek: smallint("hours_per_week"),

  departmentId: integer("department_id").references(() => department.id),
});

// ----------------------------------------
// ROOM
// ----------------------------------------
export const room = pgTable("room", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  roomNumber: text("room_number").notNull().unique(),
  roomType: roomTypeEnum("room_type"),
  capacity: smallint("capacity"),

  departmentId: integer("department_id").references(() => department.id),
});

// ----------------------------------------
// TIME SLOTS
// ----------------------------------------
export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  day: weekdayEnum("day").notNull(),
  slot: smallint("slot").notNull(),

  startTime: time("start_time"),
  endTime: time("end_time"),

  label: text("label"),
  departmentId: integer("department_id").references(() => department.id),
});

// ----------------------------------------
// TEACHER - SUBJECT (MANY TO MANY)
// ----------------------------------------
export const teacherSubjects = pgTable("teacher_subjects", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),

  teacherId: integer("teacher_id")
    .references(() => teacherProfile.id)
    .notNull(),

  subjectId: integer("subject_id")
    .references(() => subjects.id)
    .notNull(),
});

export const teacherSubjectsRelations = relations(
  teacherSubjects,
  ({ one }) => ({
    teacher: one(teacherProfile, {
      fields: [teacherSubjects.teacherId],
      references: [teacherProfile.id],
    }),
    subject: one(subjects, {
      fields: [teacherSubjects.subjectId],
      references: [subjects.id],
    }),
  }),
);

// ----------------------------------------
// TEACHER ASSIGNED TO CLASS
// ----------------------------------------
export const teacherPerClass = pgTable("teacher_per_class", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),

  teacherSubjectId: integer("teacher_subject_id").references(
    () => teacherSubjects.id,
  ),

  classId: integer("class_id").references(() => classes.id),

  departmentId: integer("department_id").references(() => department.id),
});

// ----------------------------------------
// TIMETABLE ENTRIES
// ----------------------------------------
export const timetableEntries = pgTable("timetable_entries", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),

  classId: integer("class_id").references(() => classes.id),
  timeSlotId: integer("time_slot_id").references(() => timeSlots.id),

  subjectId: integer("subject_id").references(() => subjects.id),
  teacherId: integer("teacher_id").references(() => teacherProfile.id),
  roomId: integer("room_id").references(() => room.id),

  type: subjectTypeEnum("type").default("THEORY"),
  departmentId: integer("department_id").references(() => department.id),
});

// ----------------------------------------
// ROLES & USER ROLES
// ----------------------------------------
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  roleName: text("role_name").unique(),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id"),
  roleId: integer("role_id").references(() => roles.id),
});
