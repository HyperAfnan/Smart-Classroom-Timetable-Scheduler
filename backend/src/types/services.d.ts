import type { AuthError, Session, User, Subscription } from '@supabase/supabase-js';

// Generic service result type
export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

// Auth service types
export interface AuthResult<T> {
  data: T | null;
  error: AuthError | null;
}

export interface LogoutResult {
  success: boolean;
  error: AuthError | null;
}

export interface LoginData {
  user: User;
  session: Session;
}

export interface RegisterData {
  user: User | null;
  session: Session | null;
}

export interface OAuthData {
  url: string;
}

export interface SessionData {
  session: Session | null;
}

export interface AuthStateChangeData {
  subscription: Subscription;
}

// Storage service types
export interface StorageError {
  message: string;
  statusCode?: string;
}

export interface StorageResult<T> {
  data: T | null;
  error: StorageError | null;
}

export interface UploadData {
  id: string;
  path: string;
  fullPath: string;
}

export interface PublicUrlData {
  publicUrl: string;
}

export interface SignedUrlData {
  signedUrl: string;
  token?: string;
  path?: string;
}

export interface FileObject {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  sortBy?: {
    column: string;
    order: 'asc' | 'desc';
  };
  search?: string;
}

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}
