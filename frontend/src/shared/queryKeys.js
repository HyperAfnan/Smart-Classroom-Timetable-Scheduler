export const queryKeys = Object.freeze({
  teachers: Object.freeze({
    all: ["teachers"],
    list: () => ["teachers", "list"], // reserved for filtered lists if needed
    detail: (id) => ["teachers", "detail", String(id)],
  }),

  subjects: Object.freeze({
    all: ["subjects"],
    list: () => ["subjects", "list"],
    detail: (id) => ["subjects", "detail", String(id)],
  }),

  rooms: Object.freeze({
    all: ["rooms"],
    list: () => ["rooms", "list"],
    detail: (id) => ["rooms", "detail", String(id)],
  }),

  departments: Object.freeze({
    all: ["departments"],
    detail: (idOrCode) => ["departments", "detail", String(idOrCode)],
  }),
});

export default queryKeys;
