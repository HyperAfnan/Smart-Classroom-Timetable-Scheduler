import React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ThemeModeSelect from "./ThemeModeSelect";

export default function ThemeSection({ className }) {
  return (
    <Card className={cn("max-w-3xl", className)}>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose your preferred theme. You can follow the system preference or
          force light or dark mode.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6">
          <ThemeModeSelect />
        </div>
      </CardContent>
    </Card>
  );
}
