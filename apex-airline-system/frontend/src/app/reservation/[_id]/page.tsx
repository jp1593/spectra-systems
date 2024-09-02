// Data
import { getReservationById } from "@/lib/data";
// Components
import { MyDocument } from "@/components/checkout/pdf";

export default async function ReservationHome({
  params,
}: {
  params: { _id: string };
}) {
  const reservation = await getReservationById(params._id);

  return (
    <div>
      <MyDocument reservation={reservation} />
    </div>
  );
}
