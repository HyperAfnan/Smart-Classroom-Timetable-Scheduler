import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import HeaderSection from "./components/HeaderSection";
import ControlsCard from "./components/ControlsCard";
import TimetableTable from "./components/TimetableTable";
import { days, times } from "./constants";
import useClasses from "../classes/hooks/useClasses.js";
import { useSelector } from "react-redux";
import Loader from "@/shared/components/Loader.jsx";

export default function Timetable() {
	const [selectedClass, setSelectedClass] = useState("");
	const departmentId = useSelector((state) => state.auth.user?.department_id);
	const { classes, isLoading: classLoading } = useClasses();

	const selectedClassObj = classes.find((c) => String(c.id) === selectedClass);
	const className = selectedClassObj?.class_name ?? "";

	if (classLoading)return ( <Loader />);

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
			<div className="max-w-8xl mx-auto px-16 m-0 py-8 md:py-12 space-y-6">
				<HeaderSection
					title="Timetable"
					subtitle="View individual class schedules"
				/>

				<ControlsCard
					selectedClass={selectedClass}
					onSelectClass={setSelectedClass}
				/>

				{selectedClass ? (
					<Card className="bg-card text-card-foreground border border-border shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-foreground">
								<Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
								Weekly Timetable – {className}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<TimetableTable
									days={days}
									times={times}
									departmentId={departmentId}
									className={className}
									breakAfterTime="12:00"
									breakLabel="Break"
								/>
							</div>
						</CardContent>
					</Card>
				) : (
					<Card
						role="region"
						aria-label="Empty state"
						className="bg-card text-card-foreground border border-border shadow-sm"
					>
						<CardContent className="p-8 text-center">
							<Calendar
								className="w-16 h-16 text-muted-foreground mx-auto mb-4"
								aria-hidden="true"
							/>
							<h3 className="text-lg font-medium text-foreground mb-2">
								No Class Selected
							</h3>
							<p className="text-muted-foreground mb-4">
								Please select a class to view its timetable.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
