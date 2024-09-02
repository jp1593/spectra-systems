export function UserCardSkeleton() {
  return (
    <div className="rounded-lg border flex flex-col gap-y-3 bg-muted animate-pulse">
      <div className="text-sm border-b p-3">
        <div className="w-96 h-4 bg-muted-foreground rounded-lg" />
      </div>
      <div className="px-3 pb-3 grid grid-cols-3 gap-y-5">
        {Array(9)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex flex-col gap-y-2">
              <div className="w-28 h-4 bg-muted-foreground rounded-lg" />
              <div className="w-40 h-3 bg-muted-foreground rounded-lg" />
            </div>
          ))}
      </div>
    </div>
  );
}
