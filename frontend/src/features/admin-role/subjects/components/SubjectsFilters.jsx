import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

function SubjectFilters({
  departments,
  searchTerm,
  selectedDepartment,
  onSearchChange,
  onDepartmentChange,
}) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localDept, setLocalDept] = useState(selectedDepartment || "all");

  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange(value);
  };

  const handleDeptChange = (value) => {
    setLocalDept(value);
    onDepartmentChange(value);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search subjects..."
              value={localSearch}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>

          <Select value={localDept} onValueChange={handleDeptChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubjectFilters;
