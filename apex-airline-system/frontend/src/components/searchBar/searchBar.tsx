"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
// Data
import { registerAnalytic } from "@/lib/actions";
// Components
import { DatePicker } from "@/components/searchBar/datePicker";
import { NumberPicker } from "@/components/searchBar/numberPicker";
import { LocationPicker } from "@/components/searchBar/locationPicker";
// UI Components
import { Button } from "@/components/ui/button";
// Utilities
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

function SearchBarElement({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="text-foreground font-bold tracking-tight">{title}</div>
      {children}
    </div>
  );
}

export function SearchBar({ locations }: { locations: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [searchInfo, setSearchInfo] = useState<{
    location: string;
    date: DateRange | undefined;
    guests: number;
  }>({
    location: searchParams.get("location") || "",
    date: {
      from: searchParams.get("checkin")
        ? new Date(searchParams.get("checkin")!)
        : new Date(),
      to: searchParams.get("checkout")
        ? new Date(searchParams.get("checkout")!)
        : addDays(new Date(), 20),
    },
    guests: searchParams.get("guests")
      ? parseInt(searchParams.get("guests")!)
      : 1,
  });

  function handleSearch() {
    // Check if the search parameters are valid
    if (!searchInfo.date || !searchInfo.date.from || !searchInfo.date.to) {
      return toast({
        variant: "destructive",
        description: "Please enter a check-in and check-out date.",
      });
    }
    if (!searchInfo.location) {
      return toast({
        variant: "destructive",
        description: "Please enter a location.",
      });
    }

    // Create a new URLSearchParams object and set the search parameters
    const params = new URLSearchParams();
    params.set("location", searchInfo.location);
    params.set("checkin", format(searchInfo.date.from, "MM/dd/yyyy"));
    params.set("checkout", format(searchInfo.date.to, "MM/dd/yyyy"));
    params.set("guests", searchInfo.guests.toString());

    registerAnalytic(
      searchInfo.location,
      format(searchInfo.date.from, "MM/dd/yyyy"),
      format(searchInfo.date.to, "MM/dd/yyyy"),
      searchInfo.guests
    );

    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex container items-center justify-center">
      <div className="flex gap-x-3 bg-background shadow rounded-md p-3 items-center">
        <SearchBarElement title="Where to?">
          <LocationPicker
            locations={locations}
            currentLocation={searchInfo.location}
            setLocation={(location: string) =>
              setSearchInfo({ ...searchInfo, location })
            }
          />
        </SearchBarElement>
        <SearchBarElement title="When?">
          <DatePicker
            date={searchInfo.date}
            setDate={(date) => setSearchInfo({ ...searchInfo, date })}
          />
        </SearchBarElement>
        <SearchBarElement title="How many?">
          <NumberPicker
            guests={searchInfo.guests}
            setGuests={(guests: number) =>
              setSearchInfo({ ...searchInfo, guests })
            }
          />
        </SearchBarElement>
        <div className="flex flex-col gap-y-2">
          <div className="text-background font-bold">Search</div>
          <Button onClick={handleSearch}>Find Hotels</Button>
        </div>
      </div>
    </div>
  );
}
