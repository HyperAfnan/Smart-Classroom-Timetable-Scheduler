const ScheduleCard = ({ time, subject, room, students }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center space-x-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-blue-600">{time}</p>
      </div>
      <div>
        <p className="font-medium text-card-foreground">{subject}</p>
        <p className="text-sm  text-muted-foreground">
          {room} • {students} students
        </p>
      </div>
    </div>
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Confirmed
    </span>
  </div>
);
export default ScheduleCard;
