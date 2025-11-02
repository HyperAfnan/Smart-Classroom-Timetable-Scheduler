import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/config/supabase.js";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setAuth } from "@/Store/auth.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(formData.email),
      password: String(formData.password),
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    let roles = [];
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("roles(role_name)")
      .eq("user_id", data.user.id);

    if (rolesError) {
      setError(rolesError.message);
    } else {
      roles = rolesData?.map((r) => r.roles?.role_name).filter(Boolean);
    }

    let jwtClaims = {};
    try {
      jwtClaims = jwtDecode(data.session.access_token);
    } catch {}

    if (roles.includes("admin") || roles.includes("teacher")) {
      const { data: profileData, error: profileError } = await supabase
        .from("teacher_profile")
        .select("*")
        .eq("email", data.user.email)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else {
        data.user = { ...data.user, ...profileData };
      }

      const { data: subjectsData, error: subjectsError } = await supabase
        .from("teacher_subjects")
        .select("subject")
        .eq("teacher", profileData.name);

      if (subjectsError) {
        setError(subjectsError.message);
      } else {
        data.user = {
          ...data.user,
          subjects: subjectsData.map((s) => s.subject),
        };
      }
    }

    if (roles.includes("hod")) {
      const { data: profileData, error: profileError } = await supabase
        .from("hod_profile")
        .select("*")
        .eq("userId", data.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else {
        data.user = { ...data.user, ...profileData };
      }
    }

    if (roles.includes("student")) {
      const { data: profileData, error: profileError } = await supabase
        .from("student_profile")
        .select("*")
        .eq("userId", data.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else {
        data.user = { ...data.user, ...profileData };
      }
    }

    dispatch(
      setAuth({
        user: data.user,
        token: data.session.access_token,
        roles,
      }),
    );

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.session.access_token);
    localStorage.setItem("roles", JSON.stringify(roles));

    setIsSubmitting(false);
    navigate("/dashboard");
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
