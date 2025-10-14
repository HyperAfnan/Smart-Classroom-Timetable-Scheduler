import { statusColors } from "../constants";
const UpdateItem = ({ message, time, status }) => (
  <div className="flex space-x-3">
    <div
      className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${statusColors[status]}`}
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm text-card-foreground">{message}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  </div>
);
export default UpdateItem;
