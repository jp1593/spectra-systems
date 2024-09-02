import { Suspense } from "react";
// Components
import { UserReservations } from "@/components/reservations/userReservations";
import { ReservationCardSkeleton } from "@/components/skeletons/reservationCardSkeleton";
import { SectionTitle } from "@/components/user/sectionTitle";

export default function ReservationsHome() {
  return (
    <>
      <SectionTitle
        title="My Reservations"
        description="View Your History of Past and Current Reservations"
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
          <UserReservations />
        </div>
      </Suspense>
    </>
  );
}
