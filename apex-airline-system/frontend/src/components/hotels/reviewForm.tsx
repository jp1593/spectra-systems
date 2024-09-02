"use client";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useFormStatus } from "react-dom";
// Data
import { createReview } from "@/lib/actions";
// UI Components
import { Button } from "@/components/ui/button";
// Icons
import { Star } from "lucide-react";

export function ReviewForm({ hotelId }: { hotelId: string }) {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(createReview, initialState);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: state?.error,
      });
    }
  }, [state]);

  return (
    <div className="flex gap-x-1">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <form action={formAction} key={index} className="group">
            <input type="hidden" name="hotelId" value={hotelId} />
            <input type="hidden" name="rating" value={index + 1} />
            <Button
              type="submit"
              variant="ghost"
              className="p-0 hover:bg-transparent"
            >
              <Star className="h-5 w-5 group-hover:fill-yellow-500 transition-all" />
            </Button>
          </form>
        ))}
    </div>
  );
}
