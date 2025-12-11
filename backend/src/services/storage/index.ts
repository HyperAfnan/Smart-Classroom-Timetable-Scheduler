import supabase from '../../config/supabase.js';
import type { FileObject } from '@supabase/storage-js';

interface StorageError {
  message: string;
  statusCode?: string;
}

interface StorageResult<T> {
  data: T | null;
  error: StorageError | null;
}

interface UploadData {
  id: string;
  path: string;
  fullPath: string;
}

interface SignedUrlData {
  signedUrl: string;
  token?: string;
  path?: string;
}

interface PublicUrlData {
  publicUrl: string;
}

interface ListOptions {
  limit?: number;
  offset?: number;
  sortBy?: {
    column: string;
    order: 'asc' | 'desc';
  };
  search?: string;
}

interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

class Storage {
  /**
   * Upload a file to a bucket
   * @param bucket - Bucket name
   * @param path - File path within the bucket
   * @param file - File to upload
   * @param options - Upload options (contentType, cacheControl, etc.)
   * @returns Promise with upload data or error
   */
  async upload(
    bucket: string,
    path: string,
    file: File | Blob | Buffer | ArrayBuffer,
    options: UploadOptions = {}
  ): Promise<StorageResult<UploadData>> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Download a file from a bucket
   * @param bucket - Bucket name
   * @param path - File path within the bucket
   * @returns Promise with Blob data or error
   */
  async download(bucket: string, path: string): Promise<StorageResult<Blob>> {
    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Delete a file from a bucket
   * @param bucket - Bucket name
   * @param paths - File path(s) to delete
   * @returns Promise with deleted file data or error
   */
  async delete(
    bucket: string,
    paths: string | string[]
  ): Promise<StorageResult<FileObject[]>> {
    const pathArray = Array.isArray(paths) ? paths : [paths];

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(pathArray);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * List files in a bucket
   * @param bucket - Bucket name
   * @param folder - Folder path within the bucket
   * @param options - List options (limit, offset, sortBy, etc.)
   * @returns Promise with file list or error
   */
  async list(
    bucket: string,
    folder: string = '',
    options: ListOptions = {}
  ): Promise<StorageResult<FileObject[]>> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, options);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Get public URL of a file
   * @param bucket - Bucket name
   * @param path - File path within the bucket
   * @returns Object containing the public URL
   */
  getPublicUrl(bucket: string, path: string): { data: PublicUrlData } {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return { data };
  }

  /**
   * Get signed URL for temporary access to a file
   * @param bucket - Bucket name
   * @param path - File path within the bucket
   * @param expiresIn - Expiration time in seconds
   * @returns Promise with signed URL data or error
   */
  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<StorageResult<SignedUrlData>> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }
}

export const storageService = new Storage();
export default Storage;
