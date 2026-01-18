import { db } from "@/config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const sanitizeData = (data) => {
  if (!data) return data;
  const cleaned = { ...data };
  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];
    if (value && typeof value === 'object' && typeof value.toDate === 'function') {
      cleaned[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && value.seconds && value.nanoseconds) {
       // Handle raw object timestamp if simplified by library
       cleaned[key] = new Date(value.seconds * 1000).toISOString();
    }
  });
  return cleaned;
};

/**
 * Fetches full user data including roles and profile.
 * Performs RBAC seeding (First User -> Admin) if no roles exist in the system.
 *
 * @param {import("firebase/auth").User} user - The Firebase Auth user object
 * @returns {Promise<Object>} The complete user data object for Redux
 */
export async function getUserData(user) {
  if (!user) return null;

  // 1. RBAC Auto-Seeding Check
  // Check if ANY roles exist in the system.
  const allRolesQuery = query(collection(db, "user_roles"), limit(1));
  const allRolesSnapshot = await getDocs(allRolesQuery);

  if (allRolesSnapshot.empty) {
    console.log("No roles found in system. Seeding first user as Admin.");

    try {
      // Assign Admin Role
      await addDoc(collection(db, "user_roles"), {
        user_id: user.uid,
        role_name: "admin",
        created_at: serverTimestamp(),
      });
      // Assign Teacher Role (for profile context)
      await addDoc(collection(db, "user_roles"), {
        user_id: user.uid,
        role_name: "teacher",
        created_at: serverTimestamp(),
      });

      // Create Placeholder Teacher Profile
      await addDoc(collection(db, "teacher_profile"), {
        email: user.email,
        name: user.displayName || user.email.split("@")[0] || "Admin User",
        department_id: "Main",
        created_at: serverTimestamp(),
        userId: user.uid,
      });

      console.log("Seeding complete.");
    } catch (err) {
      console.error("Error during RBAC seeding:", err);
      // Construct basic fallback data so login doesn't completely fail
    }
  }

  // 2. Fetch User Roles
  const roles = [];
  const rolesQuery = query(
    collection(db, "user_roles"),
    where("user_id", "==", user.uid)
  );
  const rolesSnapshot = await getDocs(rolesQuery);

  rolesSnapshot.forEach((doc) => {
    const roleData = doc.data();
    if (roleData.role_name) {
      roles.push(roleData.role_name);
    }
  });

  // 3. Construct Base User Data
  let userData = {
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };

  // 4. Fetch Role-Specific Profile Data
  if (roles.includes("admin") || roles.includes("teacher")) {
    const teacherQuery = query(
      collection(db, "teacher_profile"),
      where("email", "==", user.email)
    );
    const teacherSnapshot = await getDocs(teacherQuery);

    if (!teacherSnapshot.empty) {
      const profileData = sanitizeData(teacherSnapshot.docs[0].data());
      userData = { ...userData, ...profileData };

      // Fetch Subjects for Teacher
      const subjectsQuery = query(
        collection(db, "teacher_subjects"),
        where("teacher", "==", profileData.name)
      );
      const subjectsSnapshot = await getDocs(subjectsQuery);
      const subjects = [];
      subjectsSnapshot.forEach((doc) => {
        subjects.push(doc.data().subject);
      });
      userData.subjects = subjects;
    }
  } else if (roles.includes("hod")) {
    const hodQuery = query(
      collection(db, "hod_profile"),
      where("userId", "==", user.uid)
    );
    const hodSnapshot = await getDocs(hodQuery);
    if (!hodSnapshot.empty) {
      const profileData = sanitizeData(hodSnapshot.docs[0].data());
      userData = { ...userData, ...profileData };
    }
  } else if (roles.includes("student")) {
    const studentQuery = query(
      collection(db, "student_profile"),
      where("userId", "==", user.uid)
    );
    const studentSnapshot = await getDocs(studentQuery);
    if (!studentSnapshot.empty) {
      const profileData = sanitizeData(studentSnapshot.docs[0].data());
      userData = { ...userData, ...profileData };
    }
  }

  return { userData, roles };
}
