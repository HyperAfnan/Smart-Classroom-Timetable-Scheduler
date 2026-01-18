import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth, clearAuth } from "@/Store/auth";
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndRoles = async (user) => {
      if (!user) {
        dispatch(clearAuth());
        setLoading(false);
        return;
      }
      
      const token = await user.getIdToken();

      let roles = [];
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


      let userData = {
          id: user.uid,
          email: user.email,
          ...user // spread other firebase user properties if needed
      };

      if (roles.includes("admin") || roles.includes("teacher")) {
        const teacherQuery = query(
             collection(db, "teacher_profile"),
             where("email", "==", user.email)
        );
        const teacherSnapshot = await getDocs(teacherQuery);

        if (!teacherSnapshot.empty) {
            const profileData = teacherSnapshot.docs[0].data();
            userData = { ...userData, ...profileData };

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
            const profileData = hodSnapshot.docs[0].data();
            userData = { ...userData, ...profileData };
        }
      } else if (roles.includes("student")) {
         const studentQuery = query(
             collection(db, "student_profile"),
             where("userId", "==", user.uid)
         );
         const studentSnapshot = await getDocs(studentQuery);
         if (!studentSnapshot.empty) {
             const profileData = studentSnapshot.docs[0].data();
             userData = { ...userData, ...profileData };
         }
      }

      dispatch(setAuth({ user: userData, token, roles }));
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        getUserAndRoles(user);
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return loading ? null : children;
}
