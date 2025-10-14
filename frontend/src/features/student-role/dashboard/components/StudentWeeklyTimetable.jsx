import React from "react";
import { Clock, MapPin, User } from "lucide-react";

export default function StudentWeeklyTimetable({ schedule, currentDay }) {
  const timeSlots = [
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "1:00",
    "2:00",
    "3:00",
    "4:00",
    "5:00",
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border  border-border-200 overflow-hidden">
      <div className="p-6 border-b  border-border-200">
        <h2 className="text-xl font-semibold text-card-foreground">
          Weekly Timetable
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Your complete weekly schedule
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-6 gap-px bg-gray-200">
            <div className="bg-gray-50 p-4 text-center">
              <span className="text-sm font-medium text-gray-700">Time</span>
            </div>
            {schedule.map((day) => (
              <div
                key={day.day}
                className={`p-4 text-center ${
                  day.day === currentDay
                    ? "bg-blue-50 border-b-2 border-blue-500"
                    : "bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium text-card-foreground">
                  {day.day}
                </div>
                <div className="text-xs text-gray-500">{day.date}</div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid grid-cols-6 gap-px bg-gray-200 min-h-[80px]"
            >
              <div className="bg-white p-4 flex items-center justify-center">
                <span className="text-sm  text-muted-foreground">{time}</span>
              </div>
              {schedule.map((day) => {
                const classAtTime = day.classes.find(
                  (cls) => cls.startTime === time,
                );
                return (
                  <div key={`${day.day}-${time}`} className="bg-white p-2">
                    {classAtTime && (
                      <div
                        className={`h-full rounded-lg p-3 border-l-4 ${classAtTime.color} hover:shadow-md transition-shadow cursor-pointer`}
                      >
                        <div className="text-sm font-medium text-card-foreground truncate">
                          {classAtTime.subject}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-xs  text-muted-foreground truncate">
                            {classAtTime.teacher}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span className="text-xs  text-muted-foreground">
                            {classAtTime.room}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs  text-muted-foreground">
                            {classAtTime.endTime}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
