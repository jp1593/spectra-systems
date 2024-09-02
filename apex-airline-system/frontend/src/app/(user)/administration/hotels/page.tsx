import { Suspense } from "react";
import Link from "next/link";
// Components
import { Hotels } from "@/components/user/administration/hotels";
import { HotelCardSkeleton } from "@/components/skeletons/hotelCardSkeleton";
import { SectionTitle } from "@/components/user/sectionTitle";
// UI Components
import { Button } from "@/components/ui/button";

export default function HotelsAdministrationHome() {
  const path = "/administration/hotels";
  const links = [
    { name: "Create Hotel", href: `${path}/create-hotel` },
    { name: "Create Location", href: `${path}/create-location` },
  ];

  return (
    <>
      <SectionTitle
        title="Hotels Administration"
        description="Add, Modify and Configure Hotel Information"
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
          <div className="flex flex-col gap-y-3 pt-5 mb-8 mr-8">
            {Array(2)
              .fill(0)
              .map((_, index) => (
                <HotelCardSkeleton key={index} />
              ))}
          </div>
        }
      >
        <div className="flex flex-col gap-y-3 pt-5 mb-8 mr-8">
          <Hotels />
        </div>
      </Suspense>
    </>
  );
}
