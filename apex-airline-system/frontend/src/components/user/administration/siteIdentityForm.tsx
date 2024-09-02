"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { updateSiteIdentity } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SiteIdentityForm({
  siteIdentity,
}: {
  siteIdentity: SiteIdentity;
}) {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(updateSiteIdentity, initialState);

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
        <Label htmlFor="name">Hotel Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={siteIdentity.name}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="logo">Hotel Logo</Label>
        <Input
          id="logo"
          name="logo"
          required
          defaultValue={siteIdentity.logo}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="description">Hotel Chain Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={siteIdentity.description}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="vision">Vision</Label>
        <Textarea
          id="vision"
          name="vision"
          required
          defaultValue={siteIdentity.vision}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="mission">Mission</Label>
        <Textarea
          id="mission"
          name="mission"
          required
          defaultValue={siteIdentity.mission}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          name="contactNumber"
          required
          defaultValue={siteIdentity.contactNumber}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          required
          defaultValue={siteIdentity.address}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor="copyright">Copyright Text</Label>
        <Input
          id="copyright"
          name="copyright"
          required
          defaultValue={siteIdentity.copyright}
        />
      </div>
      <SubmitButton>Update Site</SubmitButton>
    </form>
  );
}
