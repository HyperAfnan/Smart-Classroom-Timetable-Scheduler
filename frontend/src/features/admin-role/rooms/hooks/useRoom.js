/**
 * React Query powered hook for Rooms feature.
 *
 * - Centralizes all reads (fetch) and writes (create/update/delete) to Supabase.
 * - Exposes mutation status flags so UI can disable submit/delete while pending.
 * - Returns stable empty arrays to avoid unnecessary re-render loops.
 *
 * Usage:
 *   import { useRooms } from "./hooks/useRoom";
 *
 *   function RoomsPage() {
 *     const {
 *       rooms,
 *       isLoading,
 *       isError,
 *       error,
 *       refetch,
 *       // mutations
 *       createRoomAsync,
 *       updateRoomAsync,
 *       deleteRoomAsync,
 *       // status flags
 *       createStatus,
 *       updateStatus,
 *       deleteStatus,
 *       isSubmitting,
 *       isDeleting,
 *     } = useRooms();
 *   }
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";

const EMPTY_ROOMS = Object.freeze([]);

/**
 * @typedef {Object} Room
 * @property {string|number} id
 * @property {string=} name
 * @property {string} room_number
 * @property {number} capacity
 * @property {string} room_type
 */

/**
 * Fetch rooms from Supabase.
 * @returns {Promise<Room[]>}
 */
async function fetchRooms() {
  const { data, error } = await supabase.from("room").select("*");
  if (error) {
    throw new Error(error.message || "Failed to load rooms");
  }
  return data ?? [];
}

/**
 * Insert a new room.
 * @param {Omit<Room, 'id'>} room
 * @returns {Promise<Room>}
 */
async function insertRoom(room) {
  const { data, error } = await supabase
    .from("room")
    .insert([room])
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message || "Failed to create room");
  }
  return data;
}

/**
 * Update a room by id.
 * @param {{ id: string|number, updates: Partial<Room> }} params
 * @returns {Promise<Room>}
 */
async function updateRoomById({ id, updates }) {
  const { data, error } = await supabase
    .from("room")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message || "Failed to update room");
  }
  return data;
}

/**
 * Delete a room by id.
 * @param {string|number} id
 * @returns {Promise<{ id: string|number }>}
 */
async function deleteRoomById(id) {
  const { error } = await supabase.from("room").delete().eq("id", id);
  if (error) {
    throw new Error(error.message || "Failed to delete room");
  }
  return { id };
}

/**
 * Main hook that provides:
 * - Query: rooms data and states
 * - Mutations: create/update/delete with cache updates and invalidations
 *
 * @param {Object} [options]
 * @param {import('@tanstack/react-query').UseQueryOptions<Room[], Error>} [options.roomsQueryOptions]
 * @param {import('@tanstack/react-query').UseMutationOptions<any, Error, any>} [options.createOptions]
 * @param {import('@tanstack/react-query').UseMutationOptions<any, Error, {id:string|number,updates:Object}>} [options.updateOptions]
 * @param {import('@tanstack/react-query').UseMutationOptions<any, Error, string|number>} [options.deleteOptions]
 */
export function useRooms({
  roomsQueryOptions = {},
  createOptions,
  updateOptions,
  deleteOptions,
} = {}) {
  const queryClient = useQueryClient();

  // Fetch rooms
  const roomsQuery = useQuery({
    queryKey: queryKeys.rooms.all,
    queryFn: fetchRooms,
    staleTime: 60_000, // 1 minute
    ...roomsQueryOptions,
  });

  // Create mutation
  const createStatus = useMutation({
    mutationFn: insertRoom,
    onSuccess: async (created, variables, context) => {
      // Optimistically update list
      queryClient.setQueryData(queryKeys.rooms.all, (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return [created, ...list];
      });
      // Ensure consistency by invalidating
      await queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      if (createOptions?.onSuccess) {
        createOptions.onSuccess(created, variables, context);
      }
    },
    onError: (err, variables, context) => {
      if (createOptions?.onError) {
        createOptions.onError(err, variables, context);
      }
    },
    ...createOptions,
  });

  // Update mutation
  const updateStatus = useMutation({
    mutationFn: updateRoomById,
    onSuccess: async (updated, variables, context) => {
      queryClient.setQueryData(queryKeys.rooms.all, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((r) =>
          r?.id === updated?.id ? { ...r, ...updated } : r,
        );
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      if (updateOptions?.onSuccess) {
        updateOptions.onSuccess(updated, variables, context);
      }
    },
    onError: (err, variables, context) => {
      if (updateOptions?.onError) {
        updateOptions.onError(err, variables, context);
      }
    },
    ...updateOptions,
  });

  // Delete mutation
  const deleteStatus = useMutation({
    mutationFn: deleteRoomById,
    onSuccess: async (result, variables, context) => {
      const deletedId = result?.id ?? variables;
      queryClient.setQueryData(queryKeys.rooms.all, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.filter((r) => r?.id !== deletedId);
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      if (deleteOptions?.onSuccess) {
        deleteOptions.onSuccess(result, variables, context);
      }
    },
    onError: (err, variables, context) => {
      if (deleteOptions?.onError) {
        deleteOptions.onError(err, variables, context);
      }
    },
    ...deleteOptions,
  });

  // Derived booleans to help UI disable actions while pending
  const isSubmitting = Boolean(
    createStatus.isPending || updateStatus.isPending,
  );
  const isDeleting = Boolean(deleteStatus.isPending);

  // Convenience async helpers
  const createRoomAsync = createStatus.mutateAsync;
  const updateRoomAsync = updateStatus.mutateAsync;
  const deleteRoomAsync = deleteStatus.mutateAsync;

  // Combined loading/error flags for the query
  const isLoading = roomsQuery.isLoading;
  const isError = roomsQuery.isError;
  const error = roomsQuery.error ?? null;

  // Exposed API
  return {
    // Data
    rooms: roomsQuery.data ?? EMPTY_ROOMS,

    // Query states
    isLoading,
    isError,
    error,
    refetch: roomsQuery.refetch,
    roomsQuery,

    // Mutations (helpers)
    createRoomAsync,
    updateRoomAsync,
    deleteRoomAsync,

    // Mutation status objects
    createStatus,
    updateStatus,
    deleteStatus,

    // Derived flags
    isSubmitting,
    isDeleting,
  };
}
