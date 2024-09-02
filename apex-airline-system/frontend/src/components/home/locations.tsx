import Image from "next/image";
// Data
import { getLocations } from "@/lib/data";

export async function Locations() {
  const locations = await getLocations();

  return (
    <div className="grid grid-cols-3 gap-y-5">
      {locations.map((location, index) => (
        <div key={index} className="flex flex-col gap-y-2 w-[300px]">
          <div className="font-bold text-sm">{location.address}</div>
          <Image
            src={location.picture}
            alt="Location"
            width={300}
            height={200}
            className="rounded -lg"
          />
        </div>
      ))}
    </div>
  );
}
