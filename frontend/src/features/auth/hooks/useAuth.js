import { auth } from "@/config/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useQuery, useQueryClient , useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../api/getUserData";

const USER_QUERY_KEY = ["user"];

export function useUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => {
        // This queryFn is technically optional if we always manually set data,
        // but can be useful for persistence/rehydration logic if needed.
        // For now, we rely on authInit setting the data.
        const storedUser = localStorage.getItem("user");
        const storedRoles = localStorage.getItem("roles");
        const storedToken = localStorage.getItem("token");
        
        if (storedUser && storedToken) {
           return {
               user: JSON.parse(storedUser),
               roles: JSON.parse(storedRoles || "[]"),
               token: storedToken
           };
        }
        return null;
    },
    staleTime: Infinity, // User data rarely changes automatically
    gcTime: Infinity, // Keep in cache
    initialData: null,
  });

  return { 
      user: data?.user || null,
      roles: data?.roles || [],
      token: data?.token || null,
      isAuthenticated: !!data?.user,
      isLoading,
      error
  };
}

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      // 1. Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch Roles & Profile (includes RBAC Seeding)
      const { userData, roles } = await getUserData(user);
      
      const token = await user.getIdToken();
      
      return { user: userData, roles, token };
    },
    onSuccess: (data) => {
      // 3. Update React Query Cache
      queryClient.setQueryData(USER_QUERY_KEY, data);

      // 4. Persist to LocalStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      localStorage.setItem("roles", JSON.stringify(data.roles));

      // 5. Navigate
      navigate("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },
    onSuccess: () => {
      queryClient.setQueryData(USER_QUERY_KEY, null);
      localStorage.clear();
      // queryClient.clear(); // Careful clearing everything if not intended
      queryClient.removeQueries(); // Clear all queries
      navigate("/");
    },
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
