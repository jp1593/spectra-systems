// Data
import { getLocations } from "@/lib/data";
// Components
import { SectionTitle } from "@/components/user/sectionTitle";
import { HotelCreationForm } from "@/components/user/administration/hotelCreationForm";

export default async function HotelCreationHome() {
  const locations = await getLocations();

  return (
    <>
      <SectionTitle
        title="Create Hotel"
        description="Create a New Hotel and Add it to the Database."
      />
      <HotelCreationForm locations={locations} />
    </>
  );
}
