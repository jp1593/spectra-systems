// Data
import { getAnalytics } from "@/lib/data";
import { getStats } from "@/lib/data";
// Components
import { AnalyticCard } from "@/components/user/analytics/analyticCard";

export async function Analytics({
  searchParams,
}: {
  searchParams: {
    source?: "web" | "rest";
    location?: string;
    checkin?: string;
    checkout?: string;
    madeAt?: string;
  };
}) {
  const analytics = await getAnalytics(searchParams);
  const stats = await getStats();

  return (
    <>
      {analytics.length === 0 && (
        <div
          className={`flex justify-center items-center ${
            stats.length > 0 ? "" : "h-full"
          }`}
        >
          <h1 className="text-xl font-bold">No Analytics Found</h1>
        </div>
      )}
      {stats && (
        <div className="flex flex-col">
          <div className="font-bold">Statistics</div>
          <div className="flex flex-wrap gap-y-2 gap-x-2">
            {stats.map((stat, index) => (
              <div key={index} className="pr-2 border-r">
                {stat._id.location} searched {stat.count} times via{" "}
                {stat._id.source}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-x-3 gap-y-3">
        {analytics.map((analytic) => (
          <AnalyticCard key={analytic._id} analytic={analytic} />
        ))}
      </div>
    </>
  );
}
