import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData } from "./api/getUserData";

export default function AuthInitializer({ children }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndRoles = async (user) => {
      if (!user) {
        queryClient.setQueryData(["user"], null);
        setLoading(false);
        return;
      }
      
      try {
        const token = await user.getIdToken();
        const { userData, roles } = await getUserData(user);
        
        queryClient.setQueryData(["user"], { user: userData, token, roles });
      } catch (err) {
        console.error("Auth init error:", err);
         queryClient.setQueryData(["user"], null);
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        getUserAndRoles(user);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return loading ? null : children;
}
