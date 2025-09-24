import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, bgColor, textColor, link, loading }) {
  return (
    <Link to={link}>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`w-5 h-5 ${textColor}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{loading ? "..." : value}</div>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
            <span className="text-xs text-green-600 font-medium">Active</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
