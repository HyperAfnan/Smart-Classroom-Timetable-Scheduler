import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Search, Plus } from "lucide-react";

function TeacherSearchBar({ value, onChange }) {
   return (
      <div className="p-4">
         <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
               type="text"
               value={value}
               onChange={(e) => onChange(e.target.value)}
               placeholder="Search teacher or subject..."
               className="w-full rounded-md bg-muted/30 pl-10 pr-3 py-2 text-sm outline-none"
            />
         </div>
      </div>
   );
}

export default function ClassTeachersPanel({
   classId,
   className,
   isOpen,
   onClose,
}) {
   const [query, setQuery] = useState("");

   // const filteredAssigned = useTeacherFilter(assigned, query);
   // const filteredAvailable = useTeacherFilter(available, query);

   return (
      <Sheet open={isOpen} onOpenChange={onClose}>
         <SheetContent
            side="right"
            className="w-[600px] bg-background border-l border-border"
         >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
               <h2 className="text-lg font-semibold text-foreground">{className}</h2>
            </div>
            <TeacherSearchBar value={query} onChange={setQuery} />
            {/**/}
            {/* <TeacherSection title="Assigned Teachers" count={filteredAssigned.length}> */}
            {/*   <TeacherGrid teachers={filteredAssigned} variant="assigned" /> */}
            {/* </TeacherSection> */}
            {/**/}
            {/* <TeacherSection title="Available Teachers" count={filteredAvailable.length}> */}
            {/*   <TeacherGrid teachers={filteredAvailable} variant="available" /> */}
            {/* </TeacherSection> */}
            {/**/}

            {/* Button */}
            <div className="p-4">
               <button
                  onClick={() => console.log("Button Clicked")}
                  className="w-full border border-border rounded-md py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors flex items-center justify-center gap-2"
               >
                  <Plus className="h-4 w-4" />
                  Add Teacher
               </button>
            </div>
         </SheetContent>
      </Sheet>
   );
}
