// Data
import { getLocations } from "@/lib/data";
// Components
import { SectionTitle } from "@/components/user/sectionTitle";
import { PartnerCreationForm } from "@/components/partners/partnerCreationForm";

export default async function PartnerCreationHome() {
  const locations = await getLocations();

  return (
    <>
      <SectionTitle
        title="Create Partner"
        description="Create a New Partner and Add it to the Database."
      />
      <PartnerCreationForm />
    </>
  );
}
