"use client";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useFormStatus } from "react-dom";
// Data
import { disableHotel, enableHotel } from "@/lib/actions";
// UI Components
import { Button } from "@/components/ui/button";
// Icons
import { Loader2 } from "lucide-react";

export function ModifyHotelStatus({
  hotelId,
  status,
}: {
  hotelId: string;
  status: string;
}) {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(
    status === "active" ? disableHotel : enableHotel,
    initialState
  );

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
      <input type="hidden" name="hotelId" value={hotelId} />
      <SubmitButton status={status} />
    </form>
  );
}

function SubmitButton({ status }: { status: string }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} variant="destructive">
      {status === "active" ? "Disable Hotel" : "Enable Hotel"}
      {pending && <Loader2 className="h-4 w-4 ml-3 animate-spin" />}
    </Button>
  );
}
