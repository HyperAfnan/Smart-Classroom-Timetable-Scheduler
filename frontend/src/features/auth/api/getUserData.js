import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetches user profile from Firestore using Firebase Auth UID
 * @param {Object} firebaseUser - Firebase Auth user object
 * @returns {Promise<{ userData: Object, roles: string[] }>}
 */
export async function getUserData(firebaseUser) {
  if (!firebaseUser?.uid) {
    throw new Error("Firebase user is required");
  }

  const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

  if (!userDoc.exists()) {
    throw new Error("User profile not found");
  }

  const data = userDoc.data();

  const userData = {
    uid: firebaseUser.uid,
    email: data.email || firebaseUser.email,
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    role: data.role,
    departmentId: data.departmentId || data.department_id || null,
  };

  return {
    userData,
    roles: [data.role], // Keep as array for backward compatibility
  };
}

