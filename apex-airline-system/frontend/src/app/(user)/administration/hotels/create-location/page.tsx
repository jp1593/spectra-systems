// Components
import { SectionTitle } from "@/components/user/sectionTitle";
import { LocationCreationForm } from "@/components/hotels/locationCreationForm";

export default async function LocationCreationHome() {
  return (
    <>
      <SectionTitle
        title="Create Location"
        description="Create a New Location and Add it to the Database"
      />
      <LocationCreationForm />
    </>
  );
}
