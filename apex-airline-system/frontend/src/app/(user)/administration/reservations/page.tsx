import { Suspense } from "react";
// Components
import { ReservationCardSkeleton } from "@/components/skeletons/reservationCardSkeleton";
import { AdminReservations } from "@/components/reservations/adminReservations";
import { SectionTitle } from "@/components/user/sectionTitle";

export default async function ReservationsAdministrationHome() {
  return (
    <>
      <SectionTitle
        title="Reservations Administration"
        description="Visualize and Manage Reservations Information"
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
          <AdminReservations />
        </div>
      </Suspense>
    </>
  );
}
