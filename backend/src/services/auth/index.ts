import supabase from '../../config/supabase.js';
import type {
  AuthError,
  Session,
  User,
  Subscription,
  AuthChangeEvent,
} from '@supabase/supabase-js';

interface AuthResult<T> {
  data: T | null;
  error: AuthError | null;
}

interface LogoutResult {
  success: boolean;
  error: AuthError | null;
}

interface AuthStateChangeResult {
  data: { subscription: Subscription };
}

class Auth {
  /**
   * Login user with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns Promise with user and session data or error
   */
  async login(
    email: string,
    password: string
  ): Promise<AuthResult<{ user: User; session: Session }>> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Register a new user with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns Promise with user and session data or error
   */
  async register(
    email: string,
    password: string
  ): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Login with Google OAuth
   * @param redirectTo - URL to redirect after authentication
   * @returns Promise with OAuth URL data or error
   */
  async loginWithGoogle(
    redirectTo: string
  ): Promise<AuthResult<{ provider: string; url: string }>> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Logout current user
   * @returns Promise with success status or error
   */
  async logout(): Promise<LogoutResult> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  }

  /**
   * Get current session
   * @returns Promise with session data or error
   */
  async getSession(): Promise<AuthResult<{ session: Session | null }>> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Listen to auth state changes
   * @param callback - Callback function to handle auth state changes
   * @returns Object containing the subscription
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): AuthStateChangeResult {
    const { data } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        callback(event, session);
      }
    );

    return { data };
  }
}

export const authService = new Auth();
export default Auth;
