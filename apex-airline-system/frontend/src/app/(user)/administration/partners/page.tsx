import Link from "next/link";
import { Suspense } from "react";
// Components
import { Partners } from "@/components/partners/partners";
import { SectionTitle } from "@/components/user/sectionTitle";
// UI Components
import { Button } from "@/components/ui/button";

export default function PartnersAdministrationHome() {
  const path = "/administration/partners";

  const links = [
    { name: "Create Partner", href: `${path}/create-partner` },
  ];
  return (
    <>
      <SectionTitle
        title="Partners Administration"
        description="Manage and Configure Hotel Partners"
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
          <div className="flex gap-x-5 gap-y-5 mt-5 mb-8 mr-8 flex-wrap">
            {Array(2)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="h-20 w-72 animate-pulse bg-muted rounded-lg" />
              ))}
          </div>
        }
      >
        <div className="flex gap-x-5 gap-y-5 mt-5 mb-8 mr-8 flex-wrap">
          <Partners />
        </div>
      </Suspense>
    </>
  );
}
