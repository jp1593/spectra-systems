"use client";
import { useFormStatus } from "react-dom";
// UI
import { Button } from "@/components/ui/button";
// Icons
import { Workflow, Loader2 } from "lucide-react";

export function SubmitButton({
  className,
  children,
  onClick,
  variant,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: any;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      onClick={onClick}
      type="submit"
      className={className}
      variant={variant}
      disabled={pending}
    >
      {children}
      {pending ? (
        <Loader2 className="h-4 w-4 ml-3 animate-spin" />
      ) : (
        <Workflow className="h-4 w-4 ml-3" />
      )}
    </Button>
  );
}
