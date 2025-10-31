import { Badge } from "@/components/ui/badge";
export function TimetableCell({ lecture, isBreak }) {
	if (isBreak) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<div className="text-[10px] py-1 px-2 rounded-md bg-amber-50 text-amber-700 text-center border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40">
					Break
				</div>
			</div>
		);
	}

	if (!lecture) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<div className="text-[10px] py-1 px-2 rounded-md bg-muted text-muted-foreground text-center">
					—
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full p-1.5">
			<div className="h-full bg-gradient-to-br from-[#EEF5FF] to-[#DBEAFF] dark:bg-secondary dark:bg-none border border-[#B8D4F1] dark:border-border rounded-lg p-1.5 flex flex-col gap-1.5 shadow-sm hover:shadow-md transition-shadow">
				{/* Subject */}
				<div className="text-[#1E3A5F] dark:text-foreground text-[10px] leading-snug break-words line-clamp-2 shrink-0 min-h-[14px]">
					{lecture.subject}
				</div>

				{/* Teacher and Room Info */}
				<div className="space-y-0.5 shrink-0">
					<div className="text-[#4A7BA7] dark:text-muted-foreground text-[8px] leading-snug truncate">
						{lecture.teacher}
					</div>
					<div className="text-[#4A7BA7] dark:text-muted-foreground text-[8px] leading-snug truncate">
						Room: {lecture.room}
					</div>
				</div>

				{/* Spacer to push badge to bottom */}
				<div className="flex-1" />

				{/* Type Badge */}
				<div className="flex justify-start">
					<Badge
						variant="secondary"
						className="text-[10px] px-1.5 py-0.5 leading-none bg-[#DBEAFE] text-[#1E40AF] border border-[#93C5FD] dark:bg-secondary dark:text-secondary-foreground dark:border-border"
					>
						{lecture.type}
					</Badge>
				</div>
			</div>
		</div>
	);
}
