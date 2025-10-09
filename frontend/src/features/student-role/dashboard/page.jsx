import { useState, useEffect } from "react"
import StudentNotificationBanner from "./components/notificationBanner.jsx";
import StudentTodaySchedule from "./components/studentTodaySchedule.jsx";
import StudentWeeklyTimetable from "./components/StudentWeeklyTimetable.jsx";
import StudentHeader from "./components/studentHeader.jsx";
import { mockSchedule } from "./constants.js";

const mockNotifications = [ ]

const getCurrentDayClasses = () => {
  const today = "Monday"
  const currentSchedule = mockSchedule.find(day => day.day === today)
  if (!currentSchedule) return []

  return currentSchedule.classes.map((cls, index) => ({
    ...cls,
    isNext: index === 1,
    isCompleted: index === 0
  }))
}

function StudentDashboard() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [currentTime, setCurrentTime] = useState("10:30 AM")
  const [currentDay] = useState("Monday")

  const studentName = "Alex Johnson"
  const todayClasses = getCurrentDayClasses()

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
      setCurrentTime(timeString)
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const handleDismissNotification = id => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <StudentHeader studentName={studentName} notifications={notifications.length} /> */}

      <StudentNotificationBanner
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {studentName}!
          </h1>
          <p className="text-gray-600">Here's your schedule for today</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <StudentTodaySchedule classes={todayClasses} currentTime={currentTime} />
          </div>

          <div className="lg:col-span-2">
            <StudentWeeklyTimetable schedule={mockSchedule} currentDay={currentDay} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard;
