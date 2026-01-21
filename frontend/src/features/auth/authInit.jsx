import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData } from "./api/getUserData";

export default function AuthInitializer({ children }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        queryClient.setQueryData(["user"], null);
        setLoading(false);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        const { userData, roles } = await getUserData(firebaseUser);

        queryClient.setQueryData(["user"], {
          user: userData,
          token,
          roles,
        });
      } catch (err) {
        console.error("Auth init error:", err);
        queryClient.setQueryData(["user"], null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [queryClient]);

  return loading ? null : children;
}

