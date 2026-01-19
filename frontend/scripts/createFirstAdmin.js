import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Load from environment or hardcode for script
const firebaseConfig = {
  apiKey: "AIzaSyDJXpzcfQ1qS4xR7UXYZg81RrNPgQiuT6o",
  authDomain: "calvio-484718.firebaseapp.com",
  projectId: "calvio-484718",
  storageBucket: "calvio-484718.firebasestorage.app",
  messagingSenderId: "314260418405",
  appId: "1:314260418405:web:6496e7244820486ce0fb8c",
  databaseURL: "https://calvio-484718-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createFirstAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123456";

  try {
    console.log("Creating first admin user...");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      departmentId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✅ First admin created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("UID:", user.uid);
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

createFirstAdmin();
