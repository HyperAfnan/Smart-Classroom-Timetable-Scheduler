import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Loader2, RefreshCw, Download, AlertCircle } from "lucide-react";
import useTimetableMutation from "../hooks/useTimetableMutation.js";
import { useUser } from "@/features/auth/hooks/useAuth";
import useClasses from "../../classes/hooks/useClasses.js";
import { useState } from "react";

/**
 * ControlsCard
 * Encapsulates class selection and actions (Generate / Export) for timetable.
 *
 * Props:
 * - selectedClass: string|number
 * - onSelectClass: (value: string) => void
 * - onGenerate: () => Promise<void> | void
 * - generating?: boolean
 * - onExport?: () => void
 * - disableGenerate?: boolean
 * - disableExport?: boolean
 */
export default function ControlsCard({
	selectedClass,
	onSelectClass,
	onExport,
}) {
    const { user } = useUser();
	const departmentId = user?.department_id;
	const {
		createTimetableEntryAsync,
		isError: isTimetableError,
		isLoading: isGenerating,
		error: timetableError,
	} = useTimetableMutation(departmentId);
	const {
		classes,
		isError: isClassError,
		isLoading: class_loading,
		error: classError,
	} = useClasses();

	const [error, setError] = useState(null);
	const onGenerate = async () => {
		if (!selectedClass) {
			setError("Please select a class first");
			return;
		}
		setError("");
		try {
			await createTimetableEntryAsync();
		} catch (err) {
			console.error("Timetable generation error:", err);
			setError(`Error generating timetable: ${err.message}`);
		}
	};

	return (
		<Card className="bg-card text-card-foreground border border-border shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-foreground">
					<Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
					Timetable Generate
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1">
						<Select
							value={selectedClass ?? ""}
							onValueChange={onSelectClass}
						>
							<SelectTrigger
								aria-label="Select class"
								className="bg-background text-foreground border-border"
								disabled={class_loading}
							>
								<SelectValue placeholder="Select a class..." />
							</SelectTrigger>
							<SelectContent className="bg-popover text-popover-foreground border border-border shadow-md">
								{classes.map((c) => (
									<SelectItem key={c.id} value={String(c.id)}>
										{c.class_name}
										{c.semester ? `(Sem ${c.semester})` : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex gap-2">
						<Button
							onClick={onGenerate}
							disabled={isGenerating || !selectedClass}
							className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-500 dark:hover:to-indigo-600"
						>
							{isGenerating ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Generating...
								</>
							) : (
								<>
									<RefreshCw className="w-4 h-4 mr-2" />
									Generate Timetable
								</>
							)}
						</Button>

						<Button
							variant="outline"
							disabled={isGenerating}
							onClick={onExport}
							className="hover:bg-accent hover:text-accent-foreground transition-colors"
						>
							<Download className="w-4 h-4 mr-2" />
							Export
						</Button>
					</div>
				</div>

				{isClassError || isTimetableError || error ? (
					<Alert
						variant="destructive"
						role="alert"
						className="bg-destructive/10 text-destructive border border-destructive/30 dark:bg-destructive/20"
					>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{String(classError || timetableError || error)}
						</AlertDescription>
					</Alert>
				) : null}
			</CardContent>
		</Card>
	);
}
