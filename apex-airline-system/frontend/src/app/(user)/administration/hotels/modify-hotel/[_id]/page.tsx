// Data
import { getHotelById, getLocations } from "@/lib/data";
// Components
import { SectionTitle } from "@/components/user/sectionTitle";
import { HotelModificationForm } from "@/components/user/administration/hotelModificationForm";

export default async function HotelModificationHome({
  params,
}: {
  params: { _id: string };
}) {
  const hotel = await getHotelById(params._id);
  const locations = await getLocations();

  return (
    <>
      <SectionTitle
        title="Update Hotel"
        description="Update a Hotel and Reflect it in the Database"
      />
      <HotelModificationForm hotel={hotel} locations={locations} />
    </>
  );
}
