"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
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

export function LocationPicker({ locations }: { locations: HotelLocation[] }) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<HotelLocation | null>(null);
  const [value, setValue] = useState("");

  return (
    <>
      <input type="hidden" name="street" defaultValue={location?.street} />
      <input type="hidden" name="city" defaultValue={location?.city} />
      <input type="hidden" name="state" defaultValue={location?.state} />
      <input type="hidden" name="country" defaultValue={location?.country} />
      <input type="hidden" name="address" defaultValue={location?.address} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[500px] justify-between"
          >
            {value
              ? locations.find(
                  (location) => location.address.toLowerCase() === value
                )?.address
              : "Select location..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0">
          <Command>
            <CommandInput placeholder="Search location..." />
            <CommandEmpty>No locations found.</CommandEmpty>
            <CommandGroup>
              {locations.map((location) => (
                <CommandItem
                  key={location._id}
                  value={location.address}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setLocation(currentValue === value ? null : location);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === location.address.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {location.address}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
