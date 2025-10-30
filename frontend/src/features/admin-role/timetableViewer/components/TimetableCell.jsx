export function TimetableCell({ lecture, isBreak }) {
  if (isBreak) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-[10px] py-1.5 px-2 rounded-lg bg-[#FFF4E6] text-[#D97706] text-center border border-[#FDE68A]">
          Break
        </div>
      </div>
    )
  }

  if (!lecture) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-[10px] py-1.5 px-2 rounded-lg bg-[#F8FAFC] text-[#CBD5E1] text-center">
          —
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full p-1.5">
      <div className="h-full bg-[#E8F0F9] border border-[#B8D4F1] rounded-lg p-1.5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
        {/* Subject Name */}
        <div className="text-[#1E3A5F] text-[10px] leading-tight mb-1 line-clamp-2">
          {lecture.subject}
        </div>

        {/* Teacher and Room Info */}
        <div className="space-y-0.5 mb-1">
          <div className="text-[#4A7BA7] text-[8px] leading-tight truncate">
            {lecture.teacher}
          </div>
          <div className="text-[#4A7BA7] text-[8px] leading-tight truncate">
            Room: {lecture.room}
          </div>
        </div>

        {/* Type Badge */}
        <div className="flex justify-start">
          <span className="inline-block bg-[#6B9FD8] text-white text-[7px] px-1.5 py-0.5 rounded leading-none">
            {lecture.type}
          </span>
        </div>
      </div>
    </div>
  )
}
