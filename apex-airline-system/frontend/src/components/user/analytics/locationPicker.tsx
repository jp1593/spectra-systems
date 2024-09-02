"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
// UI Components
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Icons
import { Check, ChevronsUpDown } from "lucide-react";

export function LocationPicker({
  locations,
  currentLocation,
  setLocation,
}: {
  locations: string[];
  currentLocation: string;
  setLocation: (location: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentLocation.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-96 justify-between"
        >
          {value
            ? locations.find((location) => location.toLowerCase() === value)
            : "City"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <Command>
          <CommandInput placeholder="Search location..." />
          <CommandEmpty>No destinations found.</CommandEmpty>
          <CommandGroup>
            {locations.map((location) => (
              <CommandItem
                key={location}
                value={location}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setLocation(currentValue === value ? "" : location);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === location.toLowerCase()
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {location}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
