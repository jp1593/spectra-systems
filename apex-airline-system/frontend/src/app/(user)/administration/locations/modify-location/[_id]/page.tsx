// Data
import { getLocationById } from "@/lib/data";
// Components
import { SectionTitle } from "@/components/user/sectionTitle";
import { LocationModificationForm } from "@/components/locations/locationModificationForm";

export default async function LocationModificationHome({
  params,
}: {
  params: { _id: string };
}) {
  const location = await getLocationById(params._id);

  return (
    <>
      <SectionTitle
        title="Update Location"
        description="Update a Location and Reflect it in the Database"
      />
      <LocationModificationForm location={location} />
    </>
  );
}
