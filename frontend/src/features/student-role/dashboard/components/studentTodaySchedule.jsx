import React from "react";
import { Clock, MapPin, User, BookOpen } from "lucide-react";

export default function StudentTodaySchedule({ classes, currentTime }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border  border-border-200 dark:bg-card dark:border-border">
      <div className="p-6 border-b  border-border-200 dark:border-border">
        <h2 className="text-xl font-semibold text-card-foreground">
          Today's Classes
        </h2>
        <p className="text-sm text-gray-500 mt-1 dark:text-muted-foreground">
          Current time: {currentTime}
        </p>
      </div>

      <div className="p-6">
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4 dark:text-muted-foreground" />
            <p className="text-gray-500 dark:text-muted-foreground">
              No classes scheduled for today
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
                  classItem.isNext
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-100 dark:bg-primary/20 dark:border-primary dark:ring-primary/30"
                    : classItem.isCompleted
                      ? "bg-gray-50 border-border-300 opacity-75 dark:bg-muted/50 dark:border-border"
                      : classItem.type === "lab"
                        ? "bg-purple-50 border-purple-500 dark:bg-purple-500/15 dark:border-purple-500 dark:ring-1 dark:ring-purple-500/40"
                        : classItem.type === "tutorial"
                          ? "bg-green-50 border-green-500 dark:bg-green-500/15 dark:border-green-500 dark:ring-1 dark:ring-green-500/40"
                          : "bg-blue-50 border-blue-500 dark:bg-blue-500/15 dark:border-blue-500 dark:ring-1 dark:ring-blue-500/40"
                } hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-card-foreground">
                        {classItem.subject}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          classItem.type === "lab"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 dark:ring-1 dark:ring-purple-500/40"
                            : classItem.type === "tutorial"
                              ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 dark:ring-1 dark:ring-green-500/40"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-1 dark:ring-blue-500/40"
                        }`}
                      >
                        {classItem.type.charAt(0).toUpperCase() +
                          classItem.type.slice(1)}
                      </span>
                      {classItem.isNext && (
                        <span className="px-2 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-800 dark:bg-primary/25 dark:text-primary dark:ring-1 dark:ring-primary/50">
                          Next Class
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm  text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {classItem.startTime} - {classItem.endTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{classItem.teacher}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{classItem.room}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
