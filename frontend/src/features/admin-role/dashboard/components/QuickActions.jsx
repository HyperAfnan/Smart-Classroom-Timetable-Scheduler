import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickActions() {
  const actions = [
    { title: "Add New Teacher", link: "/dashboard/teachers", color: "hover:bg-blue-50" },
    { title: "Add New Subject", link: "/dashboard/subjects", color: "hover:bg-purple-50" },
    { title: "Add New Room", link: "/dashboard/rooms", color: "hover:bg-green-50" },
    { title: "Add New Class", link: "/dashboard/classes", color: "hover:bg-orange-50" },
  ];

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" /> Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map(a => (
          <Link key={a.title} to={a.link}>
            <Button variant="outline" className={`w-full justify-start ${a.color}`}>
              <Plus className="w-4 h-4 mr-2" /> {a.title}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
