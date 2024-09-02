"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { createLocation } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LocationCreationForm() {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(createLocation, initialState);

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
      className="flex flex-col border p-3 rounded-lg gap-y-5 mb-8 mr-8"
    >
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="street">Street</Label>
        <Input
          id="street"
          name="street"
          required
          defaultValue="3 East 40th Street"
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" required defaultValue="New York" />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="state">State</Label>
        <Input id="state" name="state" required defaultValue="New York" />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          name="country"
          required
          defaultValue="United States"
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="picture">Picture</Label>
        <Input
          id="picture"
          name="picture"
          required
          defaultValue="/city.webp"
        />
      </div>
      <SubmitButton>Create</SubmitButton>
    </form>
  );
}
