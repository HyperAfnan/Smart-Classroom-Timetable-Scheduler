import { Badge } from "@/components/ui/badge";

export default function TimetableSlot({ slot }) {
	if (!slot) return null;

	return (
		<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-left h-full">
			<div className="font-semibold text-blue-900 text-sm">
				{String(slot?.subject_name ?? "")}
			</div>
			<div className="text-xs text-blue-600 mt-1">
				{String(slot?.teacher_name ?? "")}
			</div>
			<div className="text-xs text-blue-500 mt-1">
				Room: {String(slot?.room_id ?? "")}
			</div>
			{slot?.type ? (
				<Badge
					variant="outline"
					className="bg-blue-200 text-blue-800 border-blue-300 text-xs mt-1"
				>
					{slot.type}
				</Badge>
			) : null}
		</div>
	);
}
