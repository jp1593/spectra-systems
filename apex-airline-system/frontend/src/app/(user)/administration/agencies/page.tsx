import { Suspense } from "react";
// Components
import { SectionTitle } from "@/components/user/sectionTitle";
import { Agencies } from "@/components/agencies/agencies";
import { AgencyCreationForm } from "@/components/agencies/agencyCreationForm";

export default function AgenciesAdministrationHome() {
  return (
    <>
      <SectionTitle
        title="Agencies Administration"
        description="Manage and Configure Agencies"
      />
      <AgencyCreationForm />
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
          <Agencies />
        </div>
      </Suspense>
    </>
  );
}
