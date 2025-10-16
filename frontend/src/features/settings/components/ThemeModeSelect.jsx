import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import useTheme from "@/shared/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/**
 * ThemeModeSelect
 *
 * A settings component that allows switching the UI theme between:
 * - light
 * - dark
 * - system (follows OS preference)
 *
 * Uses:
 * - Tailwind CSS for styling
 * - shadcn/ui Select component
 * - shared useTheme hook to update theme in the Redux store
 */
export default function ThemeModeSelect({ className }) {
  const { mode, resolvedMode, setMode } = useTheme();

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor="theme-mode">Theme</Label>

      <Select value={mode} onValueChange={setMode}>
        <SelectTrigger id="theme-mode" className="w-[220px]">
          <SelectValue placeholder="Choose theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <div className="flex items-center gap-2">
              <Sun className="size-4" />
              <span>Light</span>
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className="size-4" />
              <span>Dark</span>
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className="flex items-center gap-2">
              <Laptop className="size-4" />
              <span>System</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <p className="text-xs text-muted-foreground">
        Effective theme:{" "}
        <span className="font-medium capitalize">{resolvedMode}</span>
        {mode === "system" ? " (following system preference)" : ""}
      </p>
    </div>
  );
}
