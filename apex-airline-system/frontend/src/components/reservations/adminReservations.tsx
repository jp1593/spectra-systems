// Data
import { getReservations } from "@/lib/data";
// Components
import { ReservationCard } from "@/components/reservations/reservationCard";

export async function AdminReservations() {
  let reservations = await getReservations();

  return (
    <>
      {reservations.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <h1 className="text-xl font-bold">No Reservations Found</h1>
        </div>
      )}
      {reservations.map((reservation: Reservation) => (
        <ReservationCard
          key={reservation._id}
          reservation={reservation}
          admin={true}
        />
      ))}
    </>
  );
}
