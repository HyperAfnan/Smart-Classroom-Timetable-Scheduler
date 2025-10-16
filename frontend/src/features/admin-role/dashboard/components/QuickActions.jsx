import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickActions() {
  const actions = [
    { title: "Add New Teacher", link: "/dashboard/teachers" },
    { title: "Add New Subject", link: "/dashboard/subjects" },
    { title: "Add New Room", link: "/dashboard/rooms" },
    { title: "Add New Class", link: "/dashboard/classes" },
  ];

  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />{" "}
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((a) => (
          <Link key={a.title} to={a.link}>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> {a.title}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
