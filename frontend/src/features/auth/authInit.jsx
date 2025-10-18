import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth, clearAuth } from "@/Store/auth";
import { supabase } from "@/config/supabase";
import { jwtDecode } from "jwt-decode";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndRoles = async (session) => {
      if (!session) {
        dispatch(clearAuth());
        setLoading(false);
        return;
      }
      let user = session.user;
      const token = session.access_token;

      let jwtClaims = {};
      try {
        jwtClaims = jwtDecode(token);
      } catch {}

      let roles = [];
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("roles(role_name)")
        .eq("user_id", user.id);

      if (rolesData) {
        roles = rolesData.map((r) => r.roles?.role_name).filter(Boolean);
      }

      if (roles.includes("admin") || roles.includes("teacher")) {
         const {data: profileData } = await supabase
            .from("teacher_profile")
            .select("*")
            .eq("email", user.email)
            .single();

         user = { ...user, ...profileData };

         const { data: subjectsData } = await supabase
            .from("teacher_subjects")
            .select("subject")
            .eq("teacher", profileData?.name);

         user = { ...user, subjects: subjectsData.map(s => s.subject) };
      } else if (roles.includes("hod")) {
         const {data: profileData } = await supabase
            .from("hod_profile")
            .select("*")
            .eq("email", user.email)
            .single();

         user = { ...user, ...profileData };
      } else if (roles.includes("student")) {
         const {data: profileData } = await supabase
            .from("student_profile")
            .select("*")
            .eq("userId", user.id)
            .single();
         user = { ...user, ...profileData };
      }

      dispatch(setAuth({ user, token, roles }));
      setLoading(false);
    } 

    supabase.auth.getSession().then(({ data }) => {
      getUserAndRoles(data?.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      getUserAndRoles(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [dispatch]);

  return loading ? null : children;
}
