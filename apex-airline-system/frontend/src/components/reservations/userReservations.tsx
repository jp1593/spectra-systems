import { cookies } from "next/headers";
// Data
import { getUserReservations } from "@/lib/data";
// Components
import { ReservationCard } from "@/components/reservations/reservationCard";
// JSON Web Token Utilities
import * as jose from "jose";

export async function UserReservations() {
  const token = cookies().get("token");

  const { payload }: { payload: User } = await jose.jwtVerify(
    token!.value,
    new TextEncoder().encode(process.env.JWT_SECRET)
  );

  let reservations = await getUserReservations(payload._id);

  return (
    <>
      {reservations.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <h1 className="text-xl font-bold">No Reservations Found</h1>
        </div>
      )}
      {reservations.map((reservation: Reservation) => (
        <ReservationCard key={reservation._id} reservation={reservation} />
      ))}
    </>
  );
}
