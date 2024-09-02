"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { updateUser } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserModificationForm({ user }: { user: User }) {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(updateUser, initialState);

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
      className="flex flex-col gap-y-5 p-3 rounded-lg border"
    >
      <input type="hidden" name="_id" value={user._id} />
      <div className="grid grid-cols-2 gap-x-5">
        {/* Left */}
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              defaultValue={user.email}
              required
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Age</Label>
            <Input type="number" name="age" defaultValue={user.age} required />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Country of Origin</Label>
            <Input
              type="text"
              name="originCountry"
              defaultValue={user.originCountry}
              required
            />
          </div>
          <Select required name="role" defaultValue={user.role}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="webService">Web Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Right */}
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-2">
            <Label>Names</Label>
            <Input
              type="text"
              name="firstName"
              defaultValue={user.firstName}
              required
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Last Name</Label>
            <Input
              type="text"
              name="lastName"
              defaultValue={user.lastName}
              required
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>Passport Number</Label>
            <Input
              type="number"
              name="passportNumber"
              defaultValue={user.passportNumber}
              required
            />
          </div>
        </div>
      </div>
      <SubmitButton>Update User</SubmitButton>
    </form>
  );
}
