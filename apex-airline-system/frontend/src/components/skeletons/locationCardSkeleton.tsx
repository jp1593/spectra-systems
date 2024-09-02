export function LocationCardSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_0.25fr] border rounded-lg bg-muted animate-pulse">
      <div className="flex flex-col gap-y-3">
        <div className="flex gap-x-3 border-b p-3 items-center">
          <div className="w-1/2 h-7 bg-muted-foreground rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-y-3 px-3 pb-3">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex flex-col gap-y-2 text-sm">
                <div className="rounded-lg bg-muted-foreground h-5 w-24" />
                <div className="rounded-lg bg-muted-foreground h-5 w-40" />
              </div>
            ))}
        </div>
      </div>
      <div className="relative bg-muted-foreground rounded-r-md" />
    </div>
  );
}
