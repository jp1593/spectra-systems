import { Suspense } from "react";
// Components
import { ReservationCardSkeleton } from "@/components/skeletons/reservationCardSkeleton";
import { Reservations } from "@/components/reservations/reservations";
import { SectionTitle } from "@/components/user/sectionTitle";

export default function PurchaseLogsHome() {
  return (
    <>
      <SectionTitle
        title="Purchase Logs"
        description="View and Search for Purchase Logs"
      />
      <Suspense
        fallback={
          <div className="flex flex-col gap-y-3 mb-8 mr-8">
            {Array(2)
              .fill(0)
              .map((_, index) => (
                <ReservationCardSkeleton key={index} />
              ))}
          </div>
        }
      >
        <div className="flex flex-col gap-y-3 mb-8 mr-8">
          <Reservations />
        </div>
      </Suspense>
    </>
  );
}
