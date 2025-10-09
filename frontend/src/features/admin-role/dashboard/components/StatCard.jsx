import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{loading ? "..." : value}</div>
        </CardContent>
      </Card>
  );
}
