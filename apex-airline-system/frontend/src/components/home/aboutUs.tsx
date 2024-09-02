// Data
import { getSiteIdentity } from "@/lib/data";

export async function AboutUs() {
  const { description, mission, vision } = await getSiteIdentity();

  return (
    <div className="flex flex-col gap-y-5">
      <div>
        {description}
      </div>
      <div className="grid grid-cols-2">
        <div className="flex flex-col gap-y-1">
          <div className="font-bold">Mission</div>
          <div>
            {mission}
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="font-bold">Vision</div>
          <div>
            {vision}
          </div>
        </div>
      </div>
    </div>
  );
}
