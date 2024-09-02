"use client";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
// Data
import { createCommentary } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Input } from "@/components/ui/input";

export function CommentaryForm({ hotelId }: { hotelId: string }) {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(createCommentary, initialState);

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
    <form action={formAction} className="flex gap-x-2 mb-2">
      <input type="hidden" id="hotelId" name="hotelId" value={hotelId} />
      <Input
        id="message"
        name="message"
        type="text"
        placeholder="Add a comment"
      />
      <SubmitButton>Comment</SubmitButton>
    </form>
  );
}
