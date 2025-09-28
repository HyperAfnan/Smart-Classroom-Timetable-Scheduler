import React from "react"
import { Bell, Calendar, AlertCircle, CheckCircle, Info } from "lucide-react"

const notificationsData = [
   {
      id: "1",
      type: "schedule",
      title: "Schedule Updated",
      message:
         "Your Calculus II class has been moved from Monday 9:00 AM to Monday 11:00 AM due to room availability.",
      time: "2 hours ago",
      read: false,
      priority: "high",
   },
   {
      id: "2",
      type: "conflict",
      title: "Conflict Resolved",
      message:
         "The scheduling conflict for Tuesday 2:00 PM slot has been automatically resolved.",
      time: "4 hours ago",
      read: false,
      priority: "medium",
   },
   {
      id: "3",
      type: "approval",
      title: "Leave Request Approved",
      message:
         "Your leave request for December 25th has been approved by the administration.",
      time: "1 day ago",
      read: true,
      priority: "low",
   },
   {
      id: "4",
      type: "system",
      title: "System Maintenance",
      message:
         "Scheduled system maintenance will occur on Saturday from 2:00 AM to 4:00 AM.",
      time: "2 days ago",
      read: true,
      priority: "low",
   },
   {
      id: "5",
      type: "schedule",
      title: "New Class Assignment",
      message:
         "You have been assigned to teach Advanced Statistics starting next week.",
      time: "3 days ago",
      read: false,
      priority: "high",
   },
];



const getIcon = (type, priority) => {
  const iconClass =
    priority === "high"
      ? "text-red-500"
      : priority === "medium"
      ? "text-yellow-500"
      : "text-blue-500"

  switch (type) {
    case "schedule":
      return <Calendar className={`h-5 w-5 ${iconClass}`} />
    case "conflict":
      return <AlertCircle className={`h-5 w-5 ${iconClass}`} />
    case "approval":
      return <CheckCircle className={`h-5 w-5 ${iconClass}`} />
    case "system":
      return <Info className={`h-5 w-5 ${iconClass}`} />
    default:
      return <Bell className={`h-5 w-5 ${iconClass}`} />
  }
}

const getPriorityColor = (priority, read) => {
  if (read) return "bg-gray-50 border-gray-200"

  switch (priority) {
    case "high":
      return "bg-red-50 border-red-200"
    case "medium":
      return "bg-yellow-50 border-yellow-200"
    case "low":
      return "bg-blue-50 border-blue-200"
    default:
      return "bg-gray-50 border-gray-200"
  }
}

export { notificationsData , getPriorityColor , getIcon }
