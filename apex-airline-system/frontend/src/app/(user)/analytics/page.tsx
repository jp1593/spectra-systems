import { Suspense } from "react";
import { getCities } from "@/lib/data";
import Link from "next/link";
// Components
import { Button } from "@/components/ui/button";
import { Graphics } from "@/components/analytics/graphics";
import { SectionTitle } from "@/components/user/sectionTitle";
import { Analytics } from "@/components/user/analytics/analytics";
import { AnalyticCardSkeleton } from "@/components/skeletons/analyticCardSkeleton";
import { FilterBar } from "@/components/user/analytics/filterBar";

export default async function AnalyticsHome({
  searchParams,
}: {
  searchParams: {
    source?: "web" | "rest";
    location?: string;
    checkin?: string;
    checkout?: string;
    madeAt?: string;
    mode?: "list" | "graphics";
  };
}) {
  const cities = await getCities();

  return (
    <>
      <SectionTitle
        title="Analytics"
        description="View Useful Analytics and Statistics"
      />
      <Suspense
        fallback={
          <div className="flex flex-col gap-y-3 mb-8 mr-8">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <AnalyticCardSkeleton key={index} />
              ))}
          </div>
        }
      >
        <Button asChild className="mb-5">
          <Link
            href={
              searchParams.mode === "graphics" ? "/analytics" : "?mode=graphics"
            }
          >
            {searchParams.mode === "graphics" ? "View List" : "View Graphics"}
          </Link>
        </Button>
        {searchParams.mode === "graphics" ? (
          <Graphics />
        ) : (
          <div className="flex flex-col gap-y-3 mb-8 flex-wrap mr-8">
            <FilterBar locations={cities} />
            <Analytics searchParams={searchParams} />
          </div>
        )}
      </Suspense>
    </>
  );
}
