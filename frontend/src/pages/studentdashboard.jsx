import { useState, useEffect } from "react"
// import Header from "./components/Header";
import StudentNotificationBanner  from "@/components/ui/notificationBanner.jsx";
import StudentTodaySchedule  from "@/components/ui/studentTodaySchedule.jsx";
import StudentWeeklyTimetable  from "@/components/ui/StudentWeeklyTimetable.jsx";
import StudentHeader from "@/components/ui/studentHeader.jsx";

const mockNotifications = [ ]

const getCurrentDayClasses = () => {
  const today = "Monday" // In real app, this would be dynamic
  const currentSchedule = mockSchedule.find(day => day.day === today)

  if (!currentSchedule) return []

  return currentSchedule.classes.map((cls, index) => ({
    ...cls,
    isNext: index === 1, // Mock: second class is next
    isCompleted: index === 0 // Mock: first class is completed
  }))
}
const mockSchedule = [
  {
    day: "Monday",
    date: "Jan 15",
    classes: [
      {
        id: "1",
        subject: "Data Structures",
        teacher: "Dr. Smith",
        room: "Room 101",
        startTime: "9:00",
        endTime: "10:00",
        type: "lecture",
        color: "bg-blue-50 border-blue-500"
      },
      {
        id: "2",
        subject: "Algorithm Lab",
        teacher: "Prof. Johnson",
        room: "Lab 201",
        startTime: "10:00",
        endTime: "12:00",
        type: "lab",
        color: "bg-purple-50 border-purple-500"
      },
      {
        id: "3",
        subject: "Database Systems",
        teacher: "Dr. Wilson",
        room: "Room 102",
        startTime: "2:00",
        endTime: "3:00",
        type: "lecture",
        color: "bg-green-50 border-green-500"
      }
    ]
  },
  {
    day: "Tuesday",
    date: "Jan 16",
    classes: [
      {
        id: "4",
        subject: "Operating Systems",
        teacher: "Dr. Brown",
        room: "Room 103",
        startTime: "9:00",
        endTime: "10:00",
        type: "lecture",
        color: "bg-orange-50 border-orange-500"
      },
      {
        id: "5",
        subject: "Computer Networks",
        teacher: "Prof. Davis",
        room: "Room 104",
        startTime: "11:00",
        endTime: "12:00",
        type: "lecture",
        color: "bg-red-50 border-red-500"
      }
    ]
  },
  {
    day: "Wednesday",
    date: "Jan 17",
    classes: [
      {
        id: "6",
        subject: "Software Engineering",
        teacher: "Dr. Taylor",
        room: "Room 105",
        startTime: "10:00",
        endTime: "11:00",
        type: "lecture",
        color: "bg-indigo-50 border-indigo-500"
      },
      {
        id: "7",
        subject: "Web Development Lab",
        teacher: "Prof. Anderson",
        room: "Lab 202",
        startTime: "1:00",
        endTime: "3:00",
        type: "lab",
        color: "bg-purple-50 border-purple-500"
      }
    ]
  },
  {
    day: "Thursday",
    date: "Jan 18",
    classes: [
      {
        id: "8",
        subject: "Machine Learning",
        teacher: "Dr. White",
        room: "Room 106",
        startTime: "9:00",
        endTime: "10:00",
        type: "lecture",
        color: "bg-pink-50 border-pink-500"
      },
      {
        id: "9",
        subject: "AI Tutorial",
        teacher: "Prof. Miller",
        room: "Room 107",
        startTime: "3:00",
        endTime: "4:00",
        type: "tutorial",
        color: "bg-green-50 border-green-500"
      }
    ]
  },
  {
    day: "Friday",
    date: "Jan 19",
    classes: [
      {
        id: "10",
        subject: "Project Work",
        teacher: "Dr. Garcia",
        room: "Lab 203",
        startTime: "10:00",
        endTime: "12:00",
        type: "lab",
        color: "bg-purple-50 border-purple-500"
      }
    ]
  }
]

function StudentDashboard() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [currentTime, setCurrentTime] = useState("10:30 AM")
  const [currentDay] = useState("Monday")

  const studentName = "Alex Johnson"
  const todayClasses = getCurrentDayClasses()

  useEffect(() => {
    // Update current time every minute
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
      <StudentHeader studentName={studentName} notifications={notifications.length} />

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
