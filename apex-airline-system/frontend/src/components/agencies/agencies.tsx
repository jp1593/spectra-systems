import { AgencyCard } from "@/components/agencies/agencyCard";
import { getAgencies } from "@/lib/data";

export async function Agencies() {
  const agencies = await getAgencies();

  return (
    <>
      {agencies.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <h1 className="text-xl font-bold">No Agencies Found</h1>
        </div>
      )}
      {agencies.map((agency) => (
        <AgencyCard key={agency._id} agency={agency} />
      ))}
    </>
  );
}
