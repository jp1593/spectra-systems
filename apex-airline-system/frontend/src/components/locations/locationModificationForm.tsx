"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { updateLocation } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LocationModificationForm({
  location,
}: {
  location: HotelLocation;
}) {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(updateLocation, initialState);

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
      <input type="hidden" name="_id" value={location._id} />
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="street">Street</Label>
        <Input
          id="street"
          name="street"
          required
          defaultValue={location.street}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" required defaultValue={location.city} />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="state">State</Label>
        <Input id="state" name="state" required defaultValue={location.state} />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          name="country"
          required
          defaultValue={location.country}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="picture">Picture</Label>
        <Input
          id="picture"
          name="picture"
          required
          defaultValue={location.picture}
        />
      </div>
      <SubmitButton>Update Location</SubmitButton>
    </form>
  );
}
