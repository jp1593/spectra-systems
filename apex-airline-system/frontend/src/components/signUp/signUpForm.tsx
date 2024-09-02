"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { signUp } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function SignUpForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const params = searchParams.toString();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(signUp, initialState);

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
      className="flex justify-center items-center container"
    >
      <input type="hidden" name="params" value={params} />
      <div className="flex flex-col bg-background p-3 rounded-lg border gap-y-5">
        <div className="flex flex-col">
          <div className="font-bold text-lg">Sign Up</div>
          <Button variant="link" className="p-0 self-start" asChild>
            <Link href={`/signin?${searchParams.toString()}`}>Already have an account? Sign In</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-5">
          {/* Left */}
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-y-2">
              <Label>Email</Label>
              <Input type="email" name="email" required />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Password</Label>
              <Input type="password" name="password" required />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" name="passwordConfirmation" required />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Age</Label>
              <Input type="number" name="age" required />
            </div>
          </div>
          {/* Right */}
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-y-2">
              <Label>Names</Label>
              <Input type="text" name="firstName" required />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Last Name</Label>
              <Input type="text" name="lastName" required />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Country of Origin</Label>
              <Input type="text" name="originCountry" required />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Passport Number</Label>
              <Input type="number" name="passportNumber" required />
            </div>
          </div>
        </div>
        <SubmitButton>Sign Up</SubmitButton>
      </div>
    </form>
  );
}
