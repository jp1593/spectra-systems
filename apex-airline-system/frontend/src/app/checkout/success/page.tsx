import Link from "next/link";
// Data
import { getAlliances } from "@/lib/data";
// UI Components
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default async function CheckoutSuccessHome() {
  const alliances = await getAlliances();

  return (
    <div className="container flex flex-col gap-y-5 items-center justify-center h-[calc(100vh-4.813rem)]">
      <h1 className="text-3xl font-bold">Thank You For Your Purchase!</h1>
      <ShoppingBag size={70} className="fill-green-600" />
      {alliances.length > 0 && (
        <Button variant="link" asChild>
          <Link href={alliances[0].address}>
            Check out our featured airline partner flights!
          </Link>
        </Button>
      )}
      <Button asChild className="text-base">
        <Link href="/reservations">Go To My Reservations</Link>
      </Button>
    </div>
  );
}
