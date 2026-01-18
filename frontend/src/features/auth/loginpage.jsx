import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { auth, db } from "@/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setAuth } from "@/Store/auth.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

//TODO: notification for errors
export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) return;

    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      let roles = [];
      const rolesQuery = query(
        collection(db, "user_roles"),
        where("user_id", "==", user.uid)
      );
      const rolesSnapshot = await getDocs(rolesQuery);

      rolesSnapshot.forEach((doc) => {
        const roleData = doc.data();
        // Assuming roleData structure matches what's needed or fetch role name relatedly.
        // If the structure is strictly mimicking the JOIN from Supabase, we might need adjustments.
        // For now simplifying to assume role_name is available or fetching from 'roles' collection is skipped if flattened.
        // Assuming a simpler structure for migration or direct translation:
        // Firebase structure might differ. If we stick to "user_roles" collection:
        // we might need to fetch the role name if it's a reference.
        // IMPORTANT: The original code did a join: .select("roles(role_name)").
        // If we assume the migrated data has 'role_name' directly or we need another query.
        // Let's assume we store role_name directly in user_roles for simpler NoSQL structure.
        if (roleData.role_name) {
          roles.push(roleData.role_name);
        }
      });
      
      // If we didn't find roles primarily, maybe check if we need to fetch from a separate 'roles' collection 
      // but let's assume the migration flattened it or we have the name.
      // If the migration kept relational refs, we'd need another query.
      // Let's proceed with roles found.

      let userData = {
        id: user.uid,
        email: user.email,
        // ... other basic auth info
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
      }

      if (roles.includes("hod")) {
        const hodQuery = query(
            collection(db, "hod_profile"),
            where("email", "==", user.email) // Changed from userId to email to be consistent or use uid if migrated that way
        );
        // The original code used userId for HOD and Student, but email for Teacher.
        // Let's stick to userId (uid) if that's how it was linked, but usually email is safer if UIDs changed during migration.
        // However, standardizing on UID is better. Let's assume the migration mapped Supabase ID to Firebase UID.
        // Re-checking original: .eq("userId", data.user.id)
        
        const hodQueryUid = query(
             collection(db, "hod_profile"),
             where("userId", "==", user.uid)
        );

        const hodSnapshot = await getDocs(hodQueryUid);
         if (!hodSnapshot.empty) {
             const profileData = hodSnapshot.docs[0].data();
             userData = { ...userData, ...profileData };
         }
      }

      if (roles.includes("student")) {
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

      dispatch(
        setAuth({
          user: userData,
          token: await user.getIdToken(),
          roles,
        })
      );

      // Persist to local storage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("roles", JSON.stringify(roles));

      setIsSubmitting(false);
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim();
  if (error) console.log(error);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-[#fafafa] mb-2">
          Welcome Back
        </h2>
        <p className="text-slate-600 dark:text-[#a0a0b0]">
          Sign in to your university account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-slate-700 dark:text-[#d3d3dc]"
          >
            Email Address *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-[#7b7b8b]" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="pl-12 py-3 text-lg border-slate-300 focus:border-purple-500 focus:ring-purple-500/20
                         dark:bg-[#12121a] dark:text-[#f4f4f5] dark:border-[#2a2a36]
                         dark:placeholder:text-[#6b6b7a]
                         dark:focus:border-[#8b5cf6] dark:focus:ring-[#8b5cf6]/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700 dark:text-[#d3d3dc]"
          >
            Password *
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-[#7b7b8b]" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="pl-12 py-3 text-lg border-slate-300 focus:border-purple-500 focus:ring-purple-500/20
                         dark:bg-[#12121a] dark:text-[#f4f4f5] dark:border-[#2a2a36]
                         dark:placeholder:text-[#6b6b7a]
                         dark:focus:border-[#8b5cf6] dark:focus:ring-[#8b5cf6]/30"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600 dark:text-[#c0c0c9]">
            <input
              type="checkbox"
              className="rounded border-slate-300 dark:border-[#3a3a48] dark:bg-[#1a1a22]"
            />
            Remember me
          </label>
          <a
            href="#"
            className="text-purple-600 hover:text-purple-700 dark:text-[#a78bfa] dark:hover:text-[#c4b5fd] font-medium"
          >
            Forgot password?
          </a>
        </div>

        <motion.div
          whileHover={{ scale: isFormValid ? 1.02 : 1 }}
          whileTap={{ scale: isFormValid ? 0.98 : 1 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600
                       hover:from-purple-700 hover:to-blue-700
                       text-white py-3 text-lg font-semibold rounded-xl
                       shadow-lg hover:shadow-xl transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
