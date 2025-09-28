import { useEffect } from "react";
import { toast } from "react-toastify";

export default function useTeacherNotifications({
  createStatus,
  updateStatus,
  deleteStatus,
}) {
  useEffect(() => {
    if (createStatus.isSuccess) toast.success("Teacher created successfully!");
    if (updateStatus.isSuccess) toast.success("Teacher updated successfully!");
    if (deleteStatus.isSuccess) toast.success("Teacher deleted successfully!");

    if (createStatus.isError)
      toast.error(`Create failed: ${createStatus.error.message}`);
    if (updateStatus.isError)
      toast.error(`Update failed: ${updateStatus.error.message}`);
    if (deleteStatus.isError)
      toast.error(`Delete failed: ${deleteStatus.error.message}`);
  }, [createStatus, updateStatus, deleteStatus]);
}
