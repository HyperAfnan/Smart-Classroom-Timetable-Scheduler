
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkUserSchema() {
  try {
     // Authenticate first
    console.log("Authenticating...");
    await signInWithEmailAndPassword(auth, "admin@example.com", "Admin@123456");
    console.log("Authenticated.");

    console.log("Fetching users...");
    const q = query(collection(db, "users"), limit(5));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No users found.");
      return;
    }

    console.log(`Found ${querySnapshot.size} users:`);
    querySnapshot.forEach((doc) => {
      const d = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`departmentId: ${d.departmentId}`);
      console.log(`department_id: ${d.department_id}`);
      console.log("Keys:", Object.keys(d));
      console.log("-------------------");
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    process.exit();
  }
}

checkUserSchema();
