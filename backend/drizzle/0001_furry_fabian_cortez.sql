CREATE TYPE "public"."room_type_enum" AS ENUM('CLASSROOM', 'LAB', 'SEMINAR', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."subject_type_enum" AS ENUM('THEORY', 'LAB', 'TUTORIAL', 'ELECTIVE');--> statement-breakpoint
CREATE TYPE "public"."weekday_enum" AS ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"class_name" text NOT NULL,
	"semester" smallint,
	"academic_year" text,
	"section" text,
	"students_count" integer,
	"department_id" integer,
	CONSTRAINT "classes_class_name_unique" UNIQUE("class_name")
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "department_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "hod_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	"teacher_id" integer,
	"department_id" integer,
	"max_hours" smallint,
	"bio" text,
	CONSTRAINT "hod_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "hod_profile_teacher_id_unique" UNIQUE("teacher_id"),
	CONSTRAINT "hod_profile_department_id_unique" UNIQUE("department_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"role_name" text,
	CONSTRAINT "roles_role_name_unique" UNIQUE("role_name")
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"room_number" text NOT NULL,
	"room_type" "room_type_enum",
	"capacity" smallint,
	"department_id" integer,
	CONSTRAINT "room_room_number_unique" UNIQUE("room_number")
);
--> statement-breakpoint
CREATE TABLE "student_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	"first_name" text,
	"last_name" text,
	"phone_number" text,
	"semester" smallint,
	"roll_number" text,
	"class_id" integer,
	"bio" text,
	CONSTRAINT "student_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "student_profile_roll_number_unique" UNIQUE("roll_number")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"subject_name" text NOT NULL,
	"subject_code" text NOT NULL,
	"semester" smallint,
	"type" "subject_type_enum",
	"credits" smallint,
	"hours_per_week" smallint,
	"department_id" integer,
	CONSTRAINT "subjects_subject_name_unique" UNIQUE("subject_name"),
	CONSTRAINT "subjects_subject_code_unique" UNIQUE("subject_code")
);
--> statement-breakpoint
CREATE TABLE "teacher_per_class" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"teacher_subject_id" integer,
	"class_id" integer,
	"department_id" integer
);
--> statement-breakpoint
CREATE TABLE "teacher_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	"emp_id" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"name" text,
	"email" text NOT NULL,
	"phone" text,
	"designation" text,
	"max_hours" smallint,
	"bio" text,
	"department_id" integer,
	CONSTRAINT "teacher_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "teacher_profile_emp_id_unique" UNIQUE("emp_id"),
	CONSTRAINT "teacher_profile_email_unique" UNIQUE("email"),
	CONSTRAINT "teacher_profile_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "teacher_subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"teacher_id" integer NOT NULL,
	"subject_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" "weekday_enum" NOT NULL,
	"slot" smallint NOT NULL,
	"start_time" time,
	"end_time" time,
	"label" text,
	"department_id" integer
);
--> statement-breakpoint
CREATE TABLE "timetable_coordinator_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	"teacher_id" integer,
	"department_id" integer,
	CONSTRAINT "timetable_coordinator_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "timetable_coordinator_profile_teacher_id_unique" UNIQUE("teacher_id"),
	CONSTRAINT "timetable_coordinator_profile_department_id_unique" UNIQUE("department_id")
);
--> statement-breakpoint
CREATE TABLE "timetable_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"class_id" integer,
	"time_slot_id" integer,
	"subject_id" integer,
	"teacher_id" integer,
	"room_id" integer,
	"type" "subject_type_enum" DEFAULT 'THEORY',
	"department_id" integer
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" uuid,
	"role_id" integer
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hod_profile" ADD CONSTRAINT "hod_profile_teacher_id_teacher_profile_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hod_profile" ADD CONSTRAINT "hod_profile_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_per_class" ADD CONSTRAINT "teacher_per_class_teacher_subject_id_teacher_subjects_id_fk" FOREIGN KEY ("teacher_subject_id") REFERENCES "public"."teacher_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_per_class" ADD CONSTRAINT "teacher_per_class_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_per_class" ADD CONSTRAINT "teacher_per_class_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profile" ADD CONSTRAINT "teacher_profile_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_teacher_id_teacher_profile_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_coordinator_profile" ADD CONSTRAINT "timetable_coordinator_profile_teacher_id_teacher_profile_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_coordinator_profile" ADD CONSTRAINT "timetable_coordinator_profile_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_time_slot_id_time_slots_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "public"."time_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_teacher_id_teacher_profile_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;