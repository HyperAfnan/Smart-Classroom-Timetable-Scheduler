import { useSelector } from "react-redux";
import { TimetableGrid } from "./components/TimetableGrid";

export default function TimetableViewer() {
	const departmentId = useSelector((state) => state.auth.user?.department_id);
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="max-w-[1800px] mx-auto">
        <TimetableGrid  departmentId={departmentId}/>
      </div>
    </div>
  );
}
