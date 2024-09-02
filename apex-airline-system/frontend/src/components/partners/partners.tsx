import { getPartners } from "@/lib/data";
import { PartnerCard } from "@/components/partners/partnerCard";

export async function Partners() {
  const partners = await getPartners();

  return (
    <>
      {partners.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <h1 className="text-xl font-bold">No Partners Found</h1>
        </div>
      )}
      {partners.map((partner) => (
        <PartnerCard key={partner._id} partner={partner} />
      ))}
    </>
  );
}
