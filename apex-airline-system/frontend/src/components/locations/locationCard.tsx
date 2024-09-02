import Image from "next/image";
import Link from "next/link";
// Components
import { LocationDeletion } from "@/components/locations/locationDeletion";
// UI Components
import { Button } from "@/components/ui/button";

export function LocationCard({ location }: { location: HotelLocation }) {
  return (
    <div className="grid grid-cols-[1fr_0.25fr] border rounded-lg">
      <div className="flex flex-col gap-y-3">
        <div className="flex gap-x-3 border-b p-3 items-center">
          <div className="font-bold">{location.address}</div>
          <Button asChild>
            <Link
              href={`/administration/locations/modify-location/${location._id}`}
            >
              Update Location
            </Link>
          </Button>
          <LocationDeletion locationId={location._id} />
        </div>
        <div className="grid grid-cols-2 gap-y-3 px-3 pb-3">
          <Section title="Street" value={location.street} />
          <Section title="City" value={location.city} />
          <Section title="State" value={location.state} />
          <Section title="Country" value={location.country} />
        </div>
      </div>
      <div className="relative">
        <Image
          src={location.picture}
          alt={`${location.address} Location Image`}
          fill
          className="object-cover rounded-r-md"
        />
      </div>
    </div>
  );
}

function Section({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex flex-col text-sm">
      <div className="font-bold">{title}</div>
      <div>{value}</div>
    </div>
  );
}
