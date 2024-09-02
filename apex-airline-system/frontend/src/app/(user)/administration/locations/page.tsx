import Link from "next/link";
import { Suspense } from "react";
// Components
import { Locations } from "@/components/locations/locations";
import { LocationCardSkeleton } from "@/components/skeletons/locationCardSkeleton";
import { SectionTitle } from "@/components/user/sectionTitle";
// UI Components
import { Button } from "@/components/ui/button";

export default function LocationsAdministrationHome() {
  const path = "/administration/partners";
  const links = [
    { name: "Create Location", href: `/administration/hotels/create-location` },
  ];

  return (
    <>
      <SectionTitle
        title="Locations Administration"
        description="Manage and Configure Hotel Locations"
      />
      <div className="flex gap-x-3 border p-3 rounded-lg mr-8">
        {links.map((link) => (
          <Button key={link.href} asChild>
            <Link href={link.href}>{link.name}</Link>
          </Button>
        ))}
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-y-3 mt-5 mb-8 mr-8 flex-wrap">
            {Array(2)
              .fill(0)
              .map((_, index) => (
                <LocationCardSkeleton key={index} />
              ))}
          </div>
        }
      >
        <div className="flex flex-col gap-y-3 mt-5 mb-8 mr-8 flex-wrap">
          <Locations />
        </div>
      </Suspense>
    </>
  );
}
