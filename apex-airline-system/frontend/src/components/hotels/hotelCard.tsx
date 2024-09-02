import Image from "next/image";
import Link from "next/link";
// Components
import { HotelDialog } from "@/components/hotels/hotelDialog";
// UI Components
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";

export function HotelCard({
  hotel,
  searchParams,
}: {
  hotel: Hotel;
  searchParams: HotelSearchParams;
}) {
  return (
    <article className="border rounded-md grid-cols-[0.75fr_1fr] grid h-72">
      <div className="relative">
        <Image
          src={hotel.picture}
          alt={`${hotel.name} Hotel Image`}
          fill
          className="object-cover rounded-l-md"
        />
      </div>
      <div className="flex flex-col justify-between rounded-r-md bg-background">
        <div className="flex flex-col gap-y-1 p-4 h-full">
          <div className="font-medium tracking-tight text-xl">{hotel.name}</div>
          <div className="flex gap-x-1 text-sm items-center text-muted-foreground">
            <div>{Math.round(hotel.reviews.average)}</div>
            <Star className="w-4 h-4 text-black fill-yellow-500" />
            <div>({hotel.reviews.count} reviews)</div>
            <div>|</div>
            <MapPin className="w-4 h-4 text-black fill-red-700" />
            <div>{hotel.location.address}</div>
          </div>
          <p className="text-sm line-clamp-3 mt-4">{hotel.description}</p>
          <HotelDialog hotel={hotel} searchParams={searchParams} />
        </div>
        <div className="border-t p-3 flex justify-end gap-x-3">
          <div className="flex gap-x-1 items-end">
            <div className="text-sm mb-[2px] text-muted-foreground">from</div>
            <div className="font-bold text-xl">
              {hotel.rooms.juniorSuite.price}
            </div>
            <div className="text-sm mb-[2px] text-muted-foreground">
              USD / Night
            </div>
          </div>
          <Button asChild>
            <Link
              href={`/search/${hotel._id}/?${new URLSearchParams(
                searchParams
              ).toString()}`}
            >
              View Rates
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
