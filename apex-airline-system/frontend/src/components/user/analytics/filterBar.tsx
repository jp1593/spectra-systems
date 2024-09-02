"use client";
// Hooks
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { LocationPicker } from "@/components/user/analytics/locationPicker";
// Utils
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";

export function FilterBar({ locations }: { locations: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkin, setCheckin] = useState<Date>();
  const [checkout, setCheckout] = useState<Date>();

  const [filter, setFilter] = useState({
    source: searchParams.get("source") || null,
    location: searchParams.get("location") || null,
    checkin: searchParams.get("checkin") || null,
    checkout: searchParams.get("checkout") || null,
    madeAt: searchParams.get("madeAt") || null,
  });

  function handleFilter() {
    const params = new URLSearchParams();
    filter.source && params.set("source", filter.source);
    filter.location && params.set("location", filter.location);
    checkin && params.set("checkin", format(checkin, "MM/dd/yyyy"));
    checkout && params.set("checkout", format(checkout, "MM/dd/yyyy"));
    filter.madeAt && params.set("guests", filter.madeAt);

    router.push(`/analytics?${params.toString()}`);
  }

  useEffect(() => {
    handleFilter();
  }, [filter, checkin, checkout]);

  return (
    <div className="flex gap-x-4">
      <Select
        onValueChange={(value) => {
          setFilter({ ...filter, source: value });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="web">Web</SelectItem>
          <SelectItem value="rest">Rest</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !checkin && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {checkin ? format(checkin, "PPP") : <span>Check-In</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={checkin}
            onSelect={setCheckin}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !checkout && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {checkout ? format(checkout, "PPP") : <span>Check-Out</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={checkout}
            onSelect={setCheckout}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <LocationPicker
        locations={locations}
        currentLocation={searchParams.get("location") || ""}
        setLocation={(value) => {
          setFilter({ ...filter, location: value });
        }}
      />
    </div>
  );
}
