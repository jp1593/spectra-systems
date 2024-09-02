"use client";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useFormStatus } from "react-dom";
// Data
import { deleteLocation } from "@/lib/actions";
// UI Components
import { Button } from "@/components/ui/button";
// Icons
import { Trash } from "lucide-react";

export function LocationDeletion({ locationId }: { locationId: string }) {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(deleteLocation, initialState);

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
    <form action={formAction}>
      <input type="hidden" id="_id" name="_id" value={locationId} />
      <DeleteButton />
    </form>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} variant="destructive" size="icon">
      <Trash className="h-4 w-4" />
    </Button>
  );
}
