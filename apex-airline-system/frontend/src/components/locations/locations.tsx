import { getLocations } from "@/lib/data";
import { LocationCard } from "@/components/locations/locationCard";

export async function Locations() {
  const locations = await getLocations();

  return (
    <>
      {locations.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <h1 className="text-xl font-bold">No Locations Found</h1>
        </div>
      )}
      {locations.map((location) => (
        <LocationCard key={location._id} location={location} />
      ))}
    </>
  );
}
