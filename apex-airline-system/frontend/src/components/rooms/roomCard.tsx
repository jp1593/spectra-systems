import Image from "next/image";
import Link from "next/link";
// Components
import { RoomDialog } from "@/components/rooms/roomDialog";
// UI Components
import { Button } from "@/components/ui/button";
import { BedDouble, UserRound } from "lucide-react";

export function RoomCard({
  hotelId,
  suite,
  searchParams,
}: {
  hotelId: string;
  suite: {
    type: string;
    picture: string;
    price: number;
    description: string;
    maxOccupancy: number;
    beds: { amount: number; size: string };
    roomSize: string;
    totalRooms: number;
    reservedRooms: number;
  };
  searchParams: HotelSearchParams;
}) {
  return (
    <article className="border rounded-md grid-cols-[0.75fr_1fr] grid h-72">
      <div className="relative">
        <Image
          src={suite.picture}
          alt={`${suite.type} Image`}
          fill
          className="object-cover rounded-l-md"
        />
      </div>
      <div className="flex flex-col justify-between rounded-r-md bg-background">
        <div className="flex flex-col gap-y-1 p-4 h-full">
          <div className="font-medium tracking-tight text-xl">
            {suite.type === "juniorSuite"
              ? "Junior Suite"
              : suite.type === "standardSuite"
              ? "Standard Suite"
              : suite.type === "doubleSuite"
              ? "Double Suite"
              : "Big Suite"}
          </div>
          <div className="flex gap-x-1 text-sm items-center text-muted-foreground">
            <BedDouble className="w-4 h-4 text-black fill-yellow-500" />
            <div>
              {suite.beds.amount} {suite.beds.size} Size beds
            </div>
            <div>|</div>
            <UserRound className="w-4 h-4 text-black fill-red-700" />
            <div>{suite.maxOccupancy} maximum occupancy</div>
          </div>
          <p className="text-sm line-clamp-3 mt-4">{suite.description}</p>
          <RoomDialog
            hotelId={hotelId}
            suite={suite}
            searchParams={searchParams}
          />
        </div>
        <div className="border-t p-3 flex justify-end gap-x-3">
          <div className="flex gap-x-1 items-end">
            <div className="font-bold text-xl">{suite.price}</div>
            <div className="text-sm mb-[2px] text-muted-foreground">
              USD / Night
            </div>
          </div>
          {Number(searchParams.guests) > suite.maxOccupancy ? (
            <Button disabled>Not Enough Space</Button>
          ) : (
            <Button asChild>
              <Link
                href={`/checkout/${hotelId}/?${new URLSearchParams(
                  searchParams
                ).toString()}&type=${suite.type}`}
              >
                Continue
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
