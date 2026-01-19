import { auth, db } from "@/config/firebase";
import { 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const USER_QUERY_KEY = ["user"];

/**
 * Hook to access current user state
 */
export function useUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => {
      // This will be populated by AuthInitializer
      return null;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: null,
  });

  return {
    user: data?.user || null,
    roles: data?.roles || [],
    role: data?.user?.role || null,
    token: data?.token || null,
    isAuthenticated: !!data?.user,
    isLoading,
    error,
  };
}

/**
 * Hook for authentication actions (login, logout)
 */
export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("User profile not found. Please contact administrator.");
      }

      const userData = userDoc.data();
      const token = await firebaseUser.getIdToken();

      return {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userData,
        },
        roles: [userData.role],
        token,
      };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(USER_QUERY_KEY, data);

      // Navigate based on role
      const role = data.user.role;
      switch (role) {
        case "admin":
          navigate("/dashboard");
          break;
        case "teacher":
          navigate("/dashboard");
          break;
        case "student":
          navigate("/dashboard");
          break;
        case "hod":
          navigate("/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },

    onSuccess: () => {
      queryClient.setQueryData(USER_QUERY_KEY, null);
      queryClient.clear();
      navigate("/");
    },
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}

