import { Spinner } from "@/components/ui/spinner.jsx";

const Loader = () => {
   return (
      <div className="flex items-center justify-center h-full w-full">
         <Spinner className="flex items-center justify-center h-auto w-auto" />
      </div>
   );
};

export default Loader;
