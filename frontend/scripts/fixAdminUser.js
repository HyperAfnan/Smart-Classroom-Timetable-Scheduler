import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

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

async function fixAdminUser() {
  const email = "admin@example.com";
  const password = "Admin@123456";

  try {
    console.log("Attempting to sign in with existing admin account...");
    
    // Try to sign in with existing credentials
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("✅ Signed in successfully!");
    console.log("UID:", user.uid);
    
    // Check if Firestore document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      console.log("✅ User document already exists in Firestore");
      console.log("User data:", userDoc.data());
    } else {
      console.log("⚠️  User document missing in Firestore. Creating it now...");
      
      // Create the Firestore document
      await setDoc(doc(db, "users", user.uid), {
        email,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        departmentId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log("✅ User document created successfully!");
    }
    
    console.log("\n📋 Admin Credentials:");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("UID:", user.uid);
    console.log("\n⚠️  Please change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 If the password is wrong, you may need to:");
    console.log("1. Go to Firebase Console → Authentication");
    console.log("2. Delete the existing admin@example.com user");
    console.log("3. Run this script again");
    process.exit(1);
  }
}

fixAdminUser();
