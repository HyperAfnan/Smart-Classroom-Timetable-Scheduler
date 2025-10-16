import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function ClassFilters({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  departments,
}) {
  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm">
      <CardContent className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background text-foreground placeholder:text-muted-foreground border-border"
          />
        </div>
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-[200px] bg-background text-foreground border-border">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground border border-border shadow-md">
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
