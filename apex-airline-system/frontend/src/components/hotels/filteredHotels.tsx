// Data
import { getFilteredHotels } from "@/lib/data";
// Components
import { HotelCard } from "@/components/hotels/hotelCard";

export async function FilteredHotels({
  searchParams,
}: {
  searchParams: HotelSearchParams;
}) {
  const hotels = await getFilteredHotels(searchParams);

  return (
    <>
      {hotels.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <h1 className="text-xl font-bold">No Hotels Found</h1>
        </div>
      )}
      {hotels.map((hotel: Hotel) => (
        <HotelCard key={hotel._id} hotel={hotel} searchParams={searchParams} />
      ))}
    </>
  );
}
