"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
// Data
import { createCommentary } from "@/lib/actions";
// Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// Icons
import { MessageSquare } from "lucide-react";

export function ChildCommentary({
  _id,
  hotelId,
  userName,
  date,
  message,
  Children,
}: {
  _id: string;
  hotelId: string;
  userName: string;
  date: string;
  message: string;
  Children: Commentary[] | undefined;
}) {
  const { toast } = useToast();

  const initialState = { error: "" };
  const [state, formAction] = useFormState(createCommentary, initialState);

  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: state?.error,
      });
    }
  }, [state]);

  function renderChildren(children: Commentary[]) {
    return children.map((commentary, index) => (
      <ChildCommentary
        key={index}
        _id={commentary._id}
        hotelId={hotelId}
        userName={commentary.userName}
        date={commentary.date}
        message={commentary.message}
        Children={commentary.children}
      />
    ));
  }

  return (
    <div className="ml-9 flex flex-col gap-y-1 mt-2 text-sm border-l rounded-tl-2xl">
      <div className="flex gap-x-2 items-center">
        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500" />
        <div className="flex items-center gap-x-1">
          <div className="font-bold">{userName}</div>
          <div className="text-foreground font-extralight">• {date}</div>
        </div>
      </div>
      <div className="flex flex-col gap-y-px pl-9">
        <p>{message}</p>
        <Button
          onClick={() => setIsReplying(!isReplying)}
          variant="link"
          className="w-fit p-0 text-xs items-end h-8"
        >
          Reply <MessageSquare className="h-3 w-3 ml-1" />
        </Button>
        <form
          action={formAction}
          className={cn("mt-2 flex gap-x-2", !isReplying && "hidden")}
        >
          <input type="hidden" name="hotelId" value={hotelId} />
          <input type="hidden" name="parentId" value={_id} />
          <Textarea id="message" name="message" />
          <SubmitButton>Send</SubmitButton>
        </form>
      </div>
      {Children && renderChildren(Children)}
    </div>
  );
}
