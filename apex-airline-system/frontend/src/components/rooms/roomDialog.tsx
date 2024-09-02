import Image from "next/image";
import Link from "next/link";
// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
// Icons
import { ArrowRight, BedDouble, UserRound, Bed, Lamp } from "lucide-react";

export function RoomDialog({
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="w-fit p-0 mt-auto">
          View Room Details
          <ArrowRight className="ml-1 w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-y-1 ">
          <h1 className="text-xl font-bold">
            {suite.type === "juniorSuite"
              ? "Junior Suite"
              : suite.type === "standardSuite"
              ? "Standard Suite"
              : suite.type === "doubleSuite"
              ? "Double Suite"
              : "Big Suite"}
          </h1>
          <div className="flex gap-x-1 text-sm items-center text-muted-foreground">
            <BedDouble className="w-4 h-4 text-black fill-yellow-500" />
            <div>
              {suite.beds.amount} {suite.beds.size} Size beds
            </div>
            <div>|</div>
            <UserRound className="w-4 h-4 text-black fill-red-700" />
            <div>{suite.maxOccupancy} maximum occupancy</div>
          </div>
          <div className="flex flex-col gap-y-2 mt-5">
            <div className="font-medium text-lg">Overview</div>
            <p className="text-sm">{suite.description}</p>
          </div>
          <div className="flex flex-col gap-y-2 mt-5">
            <div className="font-medium text-lg">Room View</div>
            <div className="relative h-52">
              <Image
                src={suite.picture}
                fill
                alt={`${suite.type} Image`}
                className="object-cover rounded-lg border"
              />
            </div>
          </div>
          <div className="flex flex-col gap-y-2 mt-5">
            <div className="flex items-center font-medium text-lg">
              Beds and Bedding <Bed className="h-4 w-4 ml-3" />
            </div>
            <div className="flex flex-col gap-y-5 text-sm">
              <div>• {suite.maxOccupancy} maximum occupancy</div>
              <div>
                • {suite.beds.amount} {suite.beds.size} Size beds
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-y-2 mt-5">
            <div className="flex items-center font-medium text-lg">
              Room Features <Lamp className="h-4 w-4 ml-3" />
            </div>
            <div className="flex flex-col gap-y-5 text-sm">
              <div>• {suite.roomSize}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
