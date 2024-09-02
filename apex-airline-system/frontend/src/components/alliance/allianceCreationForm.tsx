"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { createAlliance } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AllianceCreationForm() {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(createAlliance, initialState);

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
        <Label>Name</Label>
        <Input id="name" name="name" type="text" required />
      </div>
      <div className="flex flex-col gap-y-2 w-full">
        <Label>Address</Label>
        <Input id="address" name="address" type="text" required />
      </div>
      <div className="flex flex-col gap-y-2 w-full">
        <Label>Discount</Label>
        <Input id="discount" name="discount" type="number" required />
      </div>
      <div className="flex flex-col gap-y-2 w-full">
        <Label>Key</Label>
        <Input id="key" name="key" type="text" required />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label className="invisible">Create</Label>
        <SubmitButton>Create Alliance</SubmitButton>
      </div>
    </form>
  );
}
