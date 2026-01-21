
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

async function listClasses() {
  try {
     // Authenticate first
    console.log("Authenticating...");
    await signInWithEmailAndPassword(auth, "admin@example.com", "Admin@123456");
    console.log("Authenticated.");

    console.log("Fetching classes...");
    const q = query(collection(db, "classes"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No classes found.");
      return;
    }

    console.log(`Found ${querySnapshot.size} classes:`);
    querySnapshot.forEach((doc) => {
      const d = doc.data();
      console.log(`ID: ${doc.id} | className: "${d.className}" | class_name: "${d.class_name}" | name: "${d.name}"`);
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
  } finally {
    process.exit();
  }
}

listClasses();
