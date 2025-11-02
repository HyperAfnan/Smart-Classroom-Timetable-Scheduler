import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

function FullscreenButton({ tableRef }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const elem = tableRef.current;

    if (!document.fullscreenElement) {
      elem?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label={
              isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"
            }
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Maximize className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default FullscreenButton;
