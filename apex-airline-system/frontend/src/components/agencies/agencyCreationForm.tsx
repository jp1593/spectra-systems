"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { createAgency } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AgencyCreationForm() {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(createAgency, initialState);

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
    <form
      action={formAction}
      className="flex gap-x-4 items-center rounded-lg border p-3"
    >
      <div className="flex flex-col gap-y-2 w-full">
        <Label>Agency Name</Label>
        <Input id="name" name="name" type="text" required />
      </div>
      <div className="flex flex-col gap-y-2 w-full">
        <Label>Agency Endpoint</Label>
        <Input id="endpoint" name="endpoint" type="text" required />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label className="invisible">Create</Label>
        <SubmitButton>Create Agency</SubmitButton>
      </div>
    </form>
  );
}
