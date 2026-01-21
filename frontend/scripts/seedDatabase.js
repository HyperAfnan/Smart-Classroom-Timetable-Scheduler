import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

async function seedDatabase() {
  try {
    // Sign in as admin first
    console.log("🔐 Signing in as admin...");
    await signInWithEmailAndPassword(auth, "admin@example.com", "Admin@123456");
    console.log("✅ Signed in successfully!\n");
    
    console.log("🌱 Seeding database...\n");

    // 1. Create Department
    console.log("Creating department...");
    const deptRef = await addDoc(collection(db, "departments"), {
      name: "Computer Science",
      createdAt: serverTimestamp(),
    });
    console.log("✅ Department created:", deptRef.id);

    // 2. Create Rooms
    console.log("\nCreating rooms...");
    await addDoc(collection(db, "rooms"), {
      roomNumber: "101",
      roomType: "Classroom",
      capacity: 60,
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "rooms"), {
      roomNumber: "Lab-1",
      roomType: "Lab",
      capacity: 30,
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "rooms"), {
      roomNumber: "102",
      roomType: "Classroom",
      capacity: 60,
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Rooms created");

    // 3. Create Subjects
    console.log("\nCreating subjects...");
    await addDoc(collection(db, "subjects"), {
      subjectName: "Data Structures",
      subjectCode: "CS201",
      semester: "3",
      type: "Theory",
      credits: 4,
      hoursPerWeek: 4,
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "subjects"), {
      subjectName: "Database Systems",
      subjectCode: "CS202",
      semester: "3",
      type: "Theory",
      credits: 4,
      hoursPerWeek: 4,
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "subjects"), {
      subjectName: "Operating Systems",
      subjectCode: "CS203",
      semester: "3",
      type: "Theory",
      credits: 4,
      hoursPerWeek: 4,
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "subjects"), {
      subjectName: "Database Lab",
      subjectCode: "CS204",
      semester: "3",
      type: "Lab",
      credits: 2,
      hoursPerWeek: 2,
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Subjects created");

    // 4. Create Classes
    console.log("\nCreating classes...");
    await addDoc(collection(db, "classes"), {
      className: "CS-3A",
      semester: 3,
      academicYear: "2025-26",
      section: "A",
      students: 60,
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "classes"), {
      className: "CS-3B",
      semester: 3,
      academicYear: "2025-26",
      section: "B",
      students: 55,
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Classes created");

    // 5. Create Time Slots
    console.log("\nCreating time slots...");
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const slots = [
      { slot: 1, startTime: "09:00", endTime: "10:00", label: "Period 1" },
      { slot: 2, startTime: "10:00", endTime: "11:00", label: "Period 2" },
      { slot: 3, startTime: "11:00", endTime: "12:00", label: "Period 3" },
      { slot: 4, startTime: "12:00", endTime: "13:00", label: "Period 4" },
      { slot: 5, startTime: "14:00", endTime: "15:00", label: "Period 5" },
      { slot: 6, startTime: "15:00", endTime: "16:00", label: "Period 6" },
    ];

    for (const day of days) {
      for (const slotData of slots) {
        await addDoc(collection(db, "time_slots"), {
          day,
          ...slotData,
          departmentId: deptRef.id,
        });
      }
    }
    console.log("✅ Time slots created (30 slots)");

    // 6. Create Teacher Profiles
    console.log("\nCreating teacher profiles...");
    await addDoc(collection(db, "teacher_profile"), {
      empId: "EMP001",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      name: "John Doe",
      designation: "Assistant Professor",
      phone: 1234567890,
      maxHours: "20",
      bio: "Experienced professor in Computer Science",
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "teacher_profile"), {
      empId: "EMP002",
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      name: "Jane Smith",
      designation: "Associate Professor",
      phone: 1234567891,
      maxHours: "18",
      bio: "Database systems expert",
      departmentId: deptRef.id,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Teacher profiles created");

    // 7. Create Teacher Subjects mapping
    console.log("\nCreating teacher-subject mappings...");
    await addDoc(collection(db, "teacher_subjects"), {
      subject: "Data Structures",
      teacher: "John Doe",
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "teacher_subjects"), {
      subject: "Database Systems",
      teacher: "Jane Smith",
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "teacher_subjects"), {
      subject: "Database Lab",
      teacher: "Jane Smith",
      createdAt: serverTimestamp(),
    });
    console.log("✅ Teacher-subject mappings created");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log("  - 1 Department");
    console.log("  - 3 Rooms");
    console.log("  - 4 Subjects");
    console.log("  - 2 Classes");
    console.log("  - 30 Time Slots");
    console.log("  - 2 Teachers");
    console.log("  - 3 Teacher-Subject mappings");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
