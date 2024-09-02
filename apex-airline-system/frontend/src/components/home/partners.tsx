import Image from "next/image";
// Data
import { getPartners } from "@/lib/data";

export async function Partners() {
  const partners = await getPartners();

  return (
    <div className="grid grid-cols-3 gap-x-5 gap-y-5">
      {partners.map((partner) => (
        <Partner key={partner._id} partner={partner} />
      ))}
    </div>
  );
}

function Partner({ partner }: { partner: Partner }) {
  return (
    <div className="flex items-center gap-x-3 rounded-lg p-3 border">
      <Image src={partner.logo} alt="Partner" width={60} height={60} />
      <div className="font-bold">{partner.name}</div>
    </div>
  );
}
