const statusColors = {
  success: "bg-green-400",
  info: "bg-blue-400",
  warning: "bg-yellow-400",
};
const recentChanges = [
  {
    type: "rescheduled",
    message: "Calculus II moved from Mon 9:00 AM to Mon 11:00 AM",
    time: "2 hours ago",
    status: "info",
  },
  {
    type: "conflict",
    message: "Schedule conflict resolved automatically",
    time: "4 hours ago",
    status: "success",
  },
  {
    type: "leave",
    message: "Leave request approved for Dec 25th",
    time: "1 day ago",
    status: "success",
  },
];
const todaySchedule = [
  { time: "9:00 AM", subject: "Calculus I", room: "Room 301", students: 42 },
  { time: "11:00 AM", subject: "Statistics", room: "Room 205", students: 35 },
  { time: "2:00 PM", subject: "Algebra II", room: "Lab B", students: 28 },
];

export { statusColors, recentChanges, todaySchedule };
