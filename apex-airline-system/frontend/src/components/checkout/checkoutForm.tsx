"use client";
import Image from "next/image";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
// Data
import { createReservation } from "@/lib/actions";
// UI Components
import { SubmitButton } from "@/components/user/administration/submitButton";
// Date Utilities
import { differenceInDays } from "date-fns";

export function CheckoutForm({
  hotel,
  searchParams,
}: {
  hotel: Hotel;
  searchParams: {
    location: string;
    checkin: string;
    checkout: string;
    guests: string;
    type: "juniorSuite" | "standardSuite" | "doubleSuite" | "bigSuite";
    discount?: string;
  };
}) {
  const { toast } = useToast();

  const stayDays = differenceInDays(
    new Date(searchParams.checkout),
    new Date(searchParams.checkin)
  );

  const price = hotel.rooms[searchParams.type].price * stayDays;
  const discountPrice = price - (price / 100 * Number(searchParams.discount));

  const totalPrice = searchParams.discount ? discountPrice : price;

  const initialState = { error: "" };
  const [state, formAction] = useFormState(createReservation, initialState);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: state?.error,
      });
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col rounded-lg border">
      <input type="hidden" name="hotelId" value={hotel._id} />
      <input type="hidden" name="userId" value="0" />
      <input type="hidden" name="checkin" value={searchParams.checkin} />
      <input type="hidden" name="checkout" value={searchParams.checkout} />
      <input type="hidden" name="roomType" value={searchParams.type} />
      <input
        type="hidden"
        name="roomPrice"
        value={hotel.rooms[searchParams.type].price}
      />
      <input type="hidden" name="guests" value={searchParams.guests} />
      <input type="hidden" name="stayDays" value={stayDays} />
      <input type="hidden" name="totalPrice" value={totalPrice} />
      <div className="p-3 flex flex-col gap-y-px">
        <div className="font-bold">{hotel.name}</div>
        <div className="text-muted-foreground text-sm">
          {hotel.location.address}
        </div>
      </div>
      <div className="relative h-40">
        <Image
          src="/hotel-background.jpg"
          alt={`${hotel.name} Hotel Picture`}
          className="object-cover"
          fill
          priority
        />
      </div>
      <div className="grid grid-cols-2">
        <CheckoutSection
          title="Suite Type"
          value={
            searchParams.type === "juniorSuite"
              ? "Junior Suite"
              : searchParams.type === "standardSuite"
              ? "Standard Suite"
              : searchParams.type === "doubleSuite"
              ? "Double Suite"
              : "Big Suite"
          }
        />
        <CheckoutSection
          title="Room Price"
          value={hotel.rooms[searchParams.type].price + " USD / Night"}
        />
        <CheckoutSection title="Check In" value={searchParams.checkin} />
        <CheckoutSection title="Check Out" value={searchParams.checkout} />
        <CheckoutSection title="Guests" value={searchParams.guests} />
        <CheckoutSection title="Total Stay" value={stayDays + " Days"} />
        <CheckoutSection title="Total" value={totalPrice + " USD" + (searchParams.discount ? ` (${searchParams.discount}% Discount Applied from Alliance)` : "")} />
      </div>
      <SubmitButton className="mt-auto mx-3 mb-3">
        Complete Purchase
      </SubmitButton>
    </form>
  );
}

function CheckoutSection({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-3 flex flex-col gap-y-px">
      <div className="text-sm flex items-center font-bold">{title}</div>
      <div className="text-sm text-muted-foreground">{value}</div>
    </div>
  );
}
