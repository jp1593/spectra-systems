export function HotelCardSkeleton() {
  return (
    <article className="border rounded-md grid-cols-[0.75fr_1fr] grid h-72 bg-muted animate-pulse">
      <div className="relative bg-muted-foreground rounded-l-md" />
      <div className="flex flex-col justify-between rounded-r-md bg-background">
        <div className="flex flex-col gap-y-1 p-4 h-full">
          <div className="h-7 w-80 bg-muted-foreground rounded-lg" />
          <div className="h-5 w-72 bg-muted-foreground rounded-lg" />
          <div className="h-10 w-full bg-muted-foreground rounded-lg mt-4" />
          <div className="h-7 w-[142px] bg-muted-foreground rounded-lg mt-auto" />
        </div>
        <div className="border-t p-3 flex justify-end gap-x-3">
          <div className="h-7 w-28 bg-muted-foreground rounded-lg" />
          <div className="h-10 w-[107px] bg-muted-foreground rounded-lg" />
        </div>
      </div>
    </article>
  );
}
