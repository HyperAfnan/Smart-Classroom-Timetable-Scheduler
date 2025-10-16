import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div
          className={`p-3 rounded-lg ${color} ring-1 ring-black/5 dark:ring-white/10`}
        >
          <Icon className="w-6 h-6 text-white dark:text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {loading ? "..." : value}
        </div>
      </CardContent>
    </Card>
  );
}
