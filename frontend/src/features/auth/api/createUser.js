import { auth, db, serverTimestamp } from "@/config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, getDocs, limit } from "firebase/firestore";

/**
 * Creates a new user with Firebase Auth and Firestore profile
 * First user automatically becomes admin
 * 
 * @param {Object} params - User creation parameters
 * @param {string} params.email - User email
 * @param {string} params.password - User password
 * @param {string} params.firstName - User first name
 * @param {string} params.lastName - User last name
 * @param {string} params.role - User role (admin, teacher, student, hod, coordinator)
 * @param {string} [params.departmentId] - Department ID (optional)
 * @returns {Promise<Object>} Created user object
 */
export async function createUser({ email, password, firstName, lastName, role, departmentId }) {
  // Check if this is the first user (auto-admin)
  const usersSnapshot = await getDocs(query(collection(db, "users"), limit(1)));
  const isFirstUser = usersSnapshot.empty;
  
  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  // Determine final role
  const finalRole = isFirstUser ? "admin" : role;
  
  // Create Firestore user document
  await setDoc(doc(db, "users", firebaseUser.uid), {
    email,
    firstName: firstName || "",
    lastName: lastName || "",
    role: finalRole,
    departmentId: departmentId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return {
    uid: firebaseUser.uid,
    email,
    firstName,
    lastName,
    role: finalRole,
    departmentId
  };
}
