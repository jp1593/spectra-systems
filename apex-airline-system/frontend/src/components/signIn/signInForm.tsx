"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { signIn } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const params = searchParams.toString();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(signIn, initialState);

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
      <div className="flex flex-col bg-background p-3 rounded-lg border gap-y-5 w-[34rem]">
        <div className="flex flex-col">
          <div className="font-bold text-lg">Sign In</div>
          <Button variant="link" className="p-0 self-start" asChild>
            <Link href={`/signup?${searchParams.toString()}`}>
              Need an account? Sign Up
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Email</Label>
          <Input type="email" name="email" required />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Password</Label>
          <Input type="password" name="password" required />
        </div>
        <SubmitButton>Sign In</SubmitButton>
      </div>
    </form>
  );
}
