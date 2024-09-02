import { HotelCardSkeleton } from "@/components/skeletons/hotelCardSkeleton";

export function ReservationCardSkeleton() {
  return (
    <div className="rounded-lg border bg-muted animate-pulse">
      <div className="flex p-3 gap-x-5">
        <div className="rounded-lg bg-muted-foreground h-10 w-48"/>
        <div className="rounded-lg bg-muted-foreground h-10 w-32"/>
      </div>
      <div className="grid grid-cols-3 p-3 gap-y-5">
        {Array(9)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex flex-col gap-y-1 text-sm">
              <div className="rounded-lg bg-muted-foreground h-5 w-24" />
              <div className="rounded-lg bg-muted-foreground h-5 w-40" />
            </div>
          ))}
      </div>
      <HotelCardSkeleton />
    </div>
  );
}
