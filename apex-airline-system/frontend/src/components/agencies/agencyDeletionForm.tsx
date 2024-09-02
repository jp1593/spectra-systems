"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { deleteAgency } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// Icons
import { Trash } from "lucide-react";

export async function AgencyDeletionForm({ id }: { id: string }) {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(deleteAgency, initialState);

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
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="destructive">
        <Trash className="h-4 w-4" />
      </SubmitButton>
    </form>
  );
}
