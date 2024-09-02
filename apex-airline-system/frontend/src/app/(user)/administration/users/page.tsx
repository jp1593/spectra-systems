import { Suspense } from "react";
// Components
import { Users } from "@/components/user/administration/users";
import { UserCardSkeleton } from "@/components/skeletons/userCardSkeleton";
import { SectionTitle } from "@/components/user/sectionTitle";

export default function UsersAdministrationHome() {
  return (
    <>
      <SectionTitle
        title="Users Administration"
        description="Visualize and Manage Users Information"
      />
      <Suspense
        fallback={
          <div className="flex flex-col gap-y-3 mb-8 mr-8">
            {Array(2)
              .fill(0)
              .map((_, index) => (
                <UserCardSkeleton key={index} />
              ))}
          </div>
        }
      >
        <div className="flex flex-col gap-y-3 mb-8 mr-8">
          <Users />
        </div>
      </Suspense>
    </>
  );
}
