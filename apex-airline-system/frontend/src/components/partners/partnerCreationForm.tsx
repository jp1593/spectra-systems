"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { createPartner } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PartnerCreationForm() {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(createPartner, initialState);

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
      className="flex flex-col border p-3 rounded-lg gap-y-5"
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="name">Partner Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="logo">Partner Logo</Label>
        <Input id="logo" name="logo" required defaultValue="/logo.png" />
      </div>
      <SubmitButton>Create Partner</SubmitButton>
    </form>
  );
}
