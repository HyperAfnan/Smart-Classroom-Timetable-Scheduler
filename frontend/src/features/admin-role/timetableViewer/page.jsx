import { TimetableGrid } from "./components/TimetableGrid";

export default function TimetableViewer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background p-8 " >
      <div className="max-w-[1800px] mx-auto">
        <TimetableGrid />
      </div>
    </div>
  );
}
