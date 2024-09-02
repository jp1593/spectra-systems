import Link from "next/link";
// Components
import { HotelInventoryCard } from "@/components/hotels/hotelInventoryCard";
import { ModifyReservationStatus } from "@/components/reservations/modifyReservationStatus";
// UI Components
import { Button } from "@/components/ui/button";

export function ReservationCard({
  reservation,
  admin = false,
}: {
  reservation: Reservation;
  admin?: boolean;
}) {
  return (
    <div className="rounded-lg border">
      <div className="flex p-3 gap-x-5">
        <div className="flex flex-col text-sm">
          <div className="font-bold">{reservation.hotel.name}</div>
          <div className="text-muted-foreground">{reservation._id}</div>
        </div>
        <Button asChild>
          <Link href={`/reservation/${reservation._id}`}>Generate PDF</Link>
        </Button>
        {admin && (
          <ModifyReservationStatus
            reservationId={reservation._id}
            status={reservation.state}
          />
        )}
      </div>
      {reservation.state === "disabled" && (
        <div className="text-red-500 p-3">
          Reservation is currently disabled due to hotel deactivation.
        </div>
      )}
      {reservation.state === "manuallyDisabled" && (
        <div className="text-red-500 p-3">
          Reservation has been manually disabled.
        </div>
      )}
      <div className="grid grid-cols-3 p-3 gap-y-5">
        <ReservationSection
          title="Room Purchased"
          value={
            reservation.roomType === "juniorSuite"
              ? "Junior Suite"
              : reservation.roomType === "standardSuite"
              ? "Standard Suite"
              : reservation.roomType === "doubleSuite"
              ? "Double Suite"
              : "Big Suite"
          }
        />
        <ReservationSection
          title="Room Price"
          value={`${reservation.roomPrice} USD`}
        />
        <ReservationSection title="Guests" value={reservation.guests} />
        <ReservationSection title="Stay-In Days" value={reservation.stayDays} />
        <ReservationSection title="Check In" value={reservation.checkin} />
        <ReservationSection title="Check Out" value={reservation.checkout} />
        <ReservationSection
          title="Total Price"
          value={`${reservation.totalPrice} USD`}
        />
        <ReservationSection title="Made At" value={reservation.madeAt} />
        <ReservationSection
          title="Buyer"
          value={reservation.user.firstName + " " + reservation.user.lastName}
        />
      </div>
      <HotelInventoryCard hotel={reservation.hotel} searchParams={{}} />
    </div>
  );
}

function ReservationSection({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col text-sm">
      <div className="font-bold">{title}</div>
      <div>{value}</div>
    </div>
  );
}
