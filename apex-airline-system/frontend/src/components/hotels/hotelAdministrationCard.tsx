import Image from "next/image";
import Link from "next/link";
// Components
import { HotelAdministrationDialog } from "@/components/hotels/hotelAdministrationDialog";
import { ModifyHotelStatus } from "@/components/hotels/modifyHotelStatus";
// UI Components
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";

export function HotelAdministrationCard(props: Hotel) {
  return (
    <article className="border rounded-md grid-cols-[0.75fr_1fr] grid h-72">
      <div className="relative">
        <Image
          src={props.picture}
          alt={`${props.name} Hotel Image`}
          fill
          className="object-cover rounded-l-md"
        />
      </div>
      <div className="flex flex-col justify-between rounded-r-md bg-background">
        <div className="flex flex-col gap-y-1 p-4 h-full">
          <div className="font-medium tracking-tight text-xl">{props.name}</div>
          <div className="flex gap-x-1 text-sm items-center text-muted-foreground">
            <div>{Math.round(props.reviews.average)}</div>
            <Star className="w-4 h-4 text-black fill-yellow-500" />
            <div>({props.reviews.count} reviews)</div>
            <div>|</div>
            <MapPin className="w-4 h-4 text-black fill-red-700" />
            <div>{props.location.address}</div>
          </div>
          {props.state === "disabled" && (
            <div className="text-sm text-red-500">
              Hotel is currently disabled.
            </div>
          )}
          <p className="text-sm line-clamp-3 mt-4">{props.description}</p>
          <div className="flex gap-x-2 mt-auto">
            <HotelAdministrationDialog {...props} />
            <Button asChild>
              <Link href={`/administration/hotels/modify-hotel/${props._id}`}>
                Update Hotel
              </Link>
            </Button>
            <ModifyHotelStatus hotelId={props._id} status={props.state} />
          </div>
        </div>
        <div className="border-t p-3 flex justify-end gap-x-3">
          <div className="flex gap-x-1 items-end">
            <div className="text-sm mb-[2px] text-muted-foreground">from</div>
            <div className="font-bold text-xl">
              {props.rooms.juniorSuite.price}
            </div>
            <div className="text-sm mb-[2px] text-muted-foreground">
              USD / Night
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
