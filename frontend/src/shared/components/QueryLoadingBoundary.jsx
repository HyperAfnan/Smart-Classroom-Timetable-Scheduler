import { Spinner } from "@/components/ui/spinner.jsx";
import { Suspense } from "react";

export const QueryLoadingBoundary = ({ children }) => {
   return (
      <Suspense
         fallback={
            <div className="flex items-center justify-center h-full">
               <Spinner className="flex items-center justify-center h-full" />
            </div>
         }
      >
         {children}
      </Suspense>
   );
};
