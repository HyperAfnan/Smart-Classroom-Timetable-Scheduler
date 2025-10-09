export const queryKeys = Object.freeze({
  teachers: Object.freeze({
    all: ["teachers"],
    list: () => ["teachers", "list"],
    detail: (id) => ["teachers", "detail", String(id)],
    profile: (email) => ["teachers", "profile", email],
  }),
  subjects: Object.freeze({
    all: ["subjects"],
    list: () => ["subjects", "list"],
    detail: (name) => ["subjects", "detail", String(name)],
  }),

  teacherSubjects: {
    all: ["teacher_subjects"],
    byTeacher: (teacher) => ["teacher_subjects", "teacher", teacher],
    bySubject: (subject) => ["teacher_subjects", "subject", subject],
    detail: (teacher, subject) => [
      "teacher_subjects",
      "teacher",
      teacher,
      "subject",
      subject,
    ],
  },
  rooms: Object.freeze({
    all: ["rooms"],
    list: () => ["rooms", "list"],
    detail: (id) => ["rooms", "detail", String(id)],
  }),

  classes: Object.freeze({
    all: ["classes"],
    list: () => ["classes", "list"],
    detail: (id) => ["classes", "detail", String(id)],
  }),

  dashboard: Object.freeze({
    stats: ["dashboard", "stats"],
  }),

  departments: Object.freeze({
    all: ["departments"],
    detail: (idOrCode) => ["departments", "detail", String(idOrCode)],
  }),
});

export default queryKeys;
