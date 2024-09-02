import { InformativeTooltip } from "@/components/ui/informativeTooltip";
import { cn } from "@/lib/utils";

export function SectionTitle({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-x-3 mb-5", className)}>
      <h1 className="font-bold text-xl">{title}</h1>
      <InformativeTooltip description={description} />
    </div>
  );
}
