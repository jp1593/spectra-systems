// Data
import { getHotelById } from "@/lib/data";
// Components
import { RoomCard } from "@/components/rooms/roomCard";

export async function HotelRooms({
  id,
  searchParams,
}: {
  id: string;
  searchParams: HotelSearchParams;
}) {
  const hotel = await getHotelById(id);

  return (
    <>
      <RoomCard
        hotelId={id}
        suite={{ ...hotel.rooms.juniorSuite, type: "juniorSuite" }}
        searchParams={searchParams}
      />
      <RoomCard
        hotelId={id}
        suite={{ ...hotel.rooms.standardSuite, type: "standardSuite" }}
        searchParams={searchParams}
      />
      <RoomCard
        hotelId={id}
        suite={{ ...hotel.rooms.doubleSuite, type: "doubleSuite" }}
        searchParams={searchParams}
      />
      <RoomCard
        hotelId={id}
        suite={{ ...hotel.rooms.bigSuite, type: "bigSuite" }}
        searchParams={searchParams}
      />
    </>
  );
}
