import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import useTeachers from "../hooks/useTeachers.js";
import useSubjects from "../../subjects/hooks/useSubjects.js";

function Filters({ onSearchChange, onSubjectChange }) {
   const { subjects } = useSubjects();
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedSubject, setSelectedSubject] = useState("all");

   const handleSearch = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      onSearchChange(value);
   };

   const handleSubjectChange = (value) => {
      setSelectedSubject(value);
      onSubjectChange(value === "all" ? null : value);
   };

   return (
      <Card>
         <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
               {/* Search Box */}
               <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                     placeholder="Search teachers..."
                     value={searchTerm}
                     onChange={handleSearch}
                     className="pl-10"
                  />
               </div>

               <Select
                  value={selectedSubject}
                  onValueChange={handleSubjectChange}
               >
                  <SelectTrigger className="w-[200px]">
                     <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Subjects</SelectItem>
                     {subjects.map((subject) => (
                        <SelectItem key={subject.subject_name} value={subject.subject_name}>
                           {subject.subject_name}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>
         </CardContent>
      </Card>
   );
}

export default Filters;
