// Data
import { getSiteIdentity } from "@/lib/data";
// Components
import { SectionTitle } from "@/components/user/sectionTitle";
import { SiteIdentityForm } from "@/components/user/administration/siteIdentityForm";

export default async function SiteIdentityAdministrationHome() {
  const siteIdentity = await getSiteIdentity();

  return (
    <>
      <SectionTitle
        title="Site Identity Administration"
        description="Manage and Configure Site Identity Settings"
      />
      <div className="mb-8 mr-8">
        <SiteIdentityForm siteIdentity={siteIdentity} />
      </div>
    </>
  );
}
