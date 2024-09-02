export function AnalyticCardSkeleton() {
  return (
    <div className="flex flex-col gap-y-2 border p-3 rounded-lg bg-muted animate-pulse">
      <div className="font-bold rounded-lg h-5 w-full bg-muted-foreground" />
      <div className="grid grid-cols-2 gap-y-5 gap-x-14 justify-between">
        <div className="flex flex-col gap-y-2 text-sm">
          <div className="h-3 bg-muted-foreground rounded-lg w-24" />
          <div className="h-3 bg-muted-foreground w-16 rounded-lg" />
        </div>
        <div className="flex flex-col gap-y-2 text-sm">
          <div className="h-3 bg-muted-foreground rounded-lg w-24" />
          <div className="h-3 bg-muted-foreground w-16 rounded-lg" />
        </div>
        <div className="flex flex-col gap-y-2 text-sm">
          <div className="h-3 bg-muted-foreground rounded-lg w-24" />
          <div className="h-3 bg-muted-foreground w-16 rounded-lg" />
        </div>
        <div className="flex flex-col gap-y-2 text-sm">
          <div className="h-3 bg-muted-foreground rounded-lg w-24" />
          <div className="h-3 bg-muted-foreground w-16 rounded-lg" />
        </div>
        <div className="flex flex-col gap-y-2 text-sm">
          <div className="h-3 bg-muted-foreground rounded-lg w-24" />
          <div className="h-3 bg-muted-foreground w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
