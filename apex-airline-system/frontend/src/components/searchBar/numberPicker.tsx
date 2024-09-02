"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export function NumberPicker({
  guests,
  setGuests,
}: {
  guests: number;
  setGuests: (number: number) => void;
}) {
  return (
    <div className="flex gap-x-3 items-center justify-center">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setGuests(guests + -1)}
        disabled={guests <= 1}
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease</span>
      </Button>
      <div className="flex flex-col text-center">
        <div className="text-xl font-bold tracking-tighter">{guests}</div>
        <div className="text-xs uppercase text-muted-foreground">Guests</div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setGuests(guests + 1)}
        disabled={guests >= 20}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase</span>
      </Button>
    </div>
  );
}
