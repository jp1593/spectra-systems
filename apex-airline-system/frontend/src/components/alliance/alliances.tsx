import { AllianceCard } from "@/components/alliance/allianceCard";
import { getAlliances } from "@/lib/data";

export async function Alliances() {
  const alliances = await getAlliances();

  return (
    <>
      {alliances.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <h1 className="text-xl font-bold">No Alliances Found</h1>
        </div>
      )}
      {alliances.map((alliance) => (
        <AllianceCard key={alliance._id} alliance={alliance} />
      ))} 
    </>
  );
}
