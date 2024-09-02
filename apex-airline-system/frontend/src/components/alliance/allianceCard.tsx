// Components
import { AllianceDeletionForm } from "@/components/alliance/allianceDeletionForm";

export function AllianceCard({ alliance }: { alliance: Alliance }) {
  return (
    <div className="flex flex-col gap-y-2 p-3 border rounded-lg">
      <div className="flex justify-between gap-x-4">
        <div className="flex flex-col text-sm">
          <div className="font-bold">Name</div>
          <div>{alliance.name}</div>
        </div>
        <AllianceDeletionForm id={alliance._id} />
      </div>
      <div className="flex flex-col text-sm">
        <div className="font-bold">Address</div>
        <div>{alliance.address}</div>
      </div>
      <div className="flex flex-col text-sm">
        <div className="font-bold">Discount</div>
        <div>{alliance.discount} %</div>
      </div>
      <div className="flex flex-col text-sm">
        <div className="font-bold">Key</div>
        <div>{alliance.key}</div>
      </div>
    </div>
  );
}
