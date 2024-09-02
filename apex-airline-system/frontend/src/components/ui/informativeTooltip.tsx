import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function InformativeTooltip({ description }: { description: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="rounded-full p-px">
            <Info className="h-5 w-5 shrink-0" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
