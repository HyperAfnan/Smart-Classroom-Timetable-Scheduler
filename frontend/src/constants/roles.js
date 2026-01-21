/**
 * Role constants for the Smart Classroom Timetable Scheduler
 */
export const ROLES = {
  ADMIN: "admin",
  HOD: "hod",
  COORDINATOR: "coordinator",
  TEACHER: "teacher",
  STUDENT: "student",
};

/**
 * Permission definitions for each role
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    "manage_users",
    "manage_departments",
    "manage_teachers",
    "manage_subjects",
    "manage_classes",
    "manage_rooms",
    "manage_timetables",
    "view_all",
  ],
  [ROLES.HOD]: [
    "manage_department_teachers",
    "manage_department_subjects",
    "manage_department_classes",
    "create_timetables",
    "view_department",
  ],
  [ROLES.COORDINATOR]: [
    "create_timetables",
    "edit_timetables",
    "view_department",
  ],
  [ROLES.TEACHER]: [
    "view_schedule",
    "view_classes",
    "update_profile",
  ],
  [ROLES.STUDENT]: [
    "view_class_schedule",
    "view_profile",
  ],
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]}
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}
