// Data
import { getFilteredHotels } from "@/lib/data";
import { getAvailableHotels } from "@/lib/data";
// Components
import { HotelInventoryCard } from "@/components/hotels/hotelInventoryCard";

export async function Hotels({
  searchParams,
}: {
  searchParams: HotelSearchParams | any;
}) {
  let hotels = [];

  if (Object.entries(searchParams).length > 0) {
    hotels = await getFilteredHotels(searchParams);
  } else {
    hotels = await getAvailableHotels();
  }

  return (
    <>
      {hotels.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <h1 className="text-xl font-bold">No Hotels Found</h1>
        </div>
      )}
      {hotels.map((hotel: Hotel) => (
        <HotelInventoryCard key={hotel._id} hotel={hotel} searchParams={searchParams} />
      ))}
    </>
  );
}
