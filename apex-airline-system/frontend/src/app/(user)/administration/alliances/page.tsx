import { Suspense } from "react";
// Components
import { SectionTitle } from "@/components/user/sectionTitle";
import { Alliances } from "@/components/alliance/alliances";
import { AllianceCreationForm } from "@/components/alliance/allianceCreationForm";

export default function AllianceAdministrationHome() {
  return (
    <>
      <SectionTitle
        title="Airline Alliance Administration"
        description="Manage and Configure Airline Alliance"
      />
      <AllianceCreationForm />
      <Suspense
        fallback={
          <div className="flex gap-x-3 gap-y-3 mt-5 mb-8 mr-8 flex-wrap">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-28 rounded-lg bg-muted animate-pulse w-56"
                />
              ))}
          </div>
        }
      >
        <div className="flex gap-x-3 gap-y-3 mt-5 mb-8 mr-8 flex-wrap">
          <Alliances />
        </div>
      </Suspense>
    </>
  );
}
