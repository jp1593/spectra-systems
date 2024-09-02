import Image from "next/image";
// Components
import { PartnerDeletion } from "./partnerDeletion";

export function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div className="flex items-center gap-x-3 rounded-lg p-3 border">
      <Image src={partner.logo} alt="Partner" width={60} height={60} />
      <div className="font-bold text-lg mr-2">{partner.name}</div>
      <PartnerDeletion partnerId={partner._id} />
    </div>
  );
}
