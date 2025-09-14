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
      const user = session.user;
      const token = session.access_token;

      // Decode JWT for quick claims (optional)
      let jwtClaims = {};
      try {
        jwtClaims = jwtDecode(token);
      } catch {}

      // Fetch roles from DB
      let roles = [];
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("roles(role_name)")
        .eq("user_id", user.id);

      if (rolesData) {
        roles = rolesData.map((r) => r.roles?.role_name).filter(Boolean);
      }

      dispatch(setAuth({ user, token, roles }));
      setLoading(false);
    };

    // Initial check
    supabase.auth.getSession().then(({ data }) => {
      getUserAndRoles(data?.session);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      getUserAndRoles(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [dispatch]);

  return loading ? null : children;
}
