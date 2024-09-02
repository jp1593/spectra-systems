// Data
import { getHotelById, confirmAlliance } from "@/lib/data";
// Components
import { CheckoutForm } from "@/components/checkout/checkoutForm";
// UI Components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function CheckoutHome({
  params,
  searchParams,
}: {
  params: { _id: string };
  searchParams: {
    location: string;
    checkin: string;
    checkout: string;
    guests: string;
    type: "juniorSuite" | "standardSuite" | "doubleSuite" | "bigSuite";
    discount?: string;
    key?: string;
  };
}) {
  const hotel = await getHotelById(params._id);

  let alliance = null;
  if (searchParams.key) {
    alliance = await confirmAlliance(searchParams.key);
    searchParams.discount = alliance.discount;
  }

  return (
    <div className="grid grid-cols-2 gap-x-10 container py-8 min-h-[calc(100vh-4.813rem)]">
      <div className="flex flex-col">
        <h1 className="font-bold text-xl mb-8">Checkout</h1>
        <CheckoutForm hotel={hotel} searchParams={searchParams} />
      </div>
      <div className="flex flex-col">
        <h1 className="font-bold text-xl mb-8">Payment Information</h1>
        <div className="flex flex-col rounded-lg p-3 gap-y-3 border bg-gradient-to-r from-cyan-500/80 to-fuchsia-500/80">
          <PaymentSection title="Card Number" />
          <div className="flex gap-x-3">
            <PaymentSection title="Expiration Date" />
            <PaymentSection title="CVV" />
          </div>
          <PaymentSection title="Card Holder Name" />
          <PaymentSection title="Address" />
        </div>
      </div>
    </div>
  );
}

function PaymentSection({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-y-1">
      <Label>{title}</Label>
      <Input />
    </div>
  );
}
