import { useEffect } from "react";
import { toast } from "react-toastify";

/**
 * Hook to surface toast notifications for Subject CRUD operations.
 * Mirrors the behavior of useTeacherNotifications for a consistent UX.
 *
 * @param {Object} params
 * @param {import('@tanstack/react-query').UseMutationResult} params.createStatus
 * @param {import('@tanstack/react-query').UseMutationResult} params.updateStatus
 * @param {import('@tanstack/react-query').UseMutationResult} params.deleteStatus
 */
export default function useSubjectNotifications({
  createStatus,
  updateStatus,
  deleteStatus,
}) {
  useEffect(() => {
    if (createStatus?.isSuccess) toast.success("Subject created successfully!");
    if (updateStatus?.isSuccess) toast.success("Subject updated successfully!");
    if (deleteStatus?.isSuccess) toast.success("Subject deleted successfully!");

    if (createStatus?.isError)
      toast.error(`Create failed: ${createStatus.error?.message}`);
    if (updateStatus?.isError)
      toast.error(`Update failed: ${updateStatus.error?.message}`);
    if (deleteStatus?.isError)
      toast.error(`Delete failed: ${deleteStatus.error?.message}`);
  }, [createStatus, updateStatus, deleteStatus]);
}

