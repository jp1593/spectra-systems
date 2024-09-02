export function AnalyticCard({ analytic }: { analytic: Analytic }) {
  return (
    <div className="flex flex-col gap-y-2 border p-3 rounded-lg">
      <div className="font-bold">#{analytic._id}</div>
      <div className="grid grid-cols-2 gap-y-5 justify-between">
        <div className="flex flex-col text-sm">
          <div className="font-bold">Source</div>
          <div>{analytic.source}</div>
        </div>
        <div className="flex flex-col text-sm justify-self-end">
          <div className="font-bold">Location</div>
          <div>{analytic.location}</div>
        </div>
        <div className="flex flex-col text-sm">
          <div className="font-bold">Check-In</div>
          <div>{analytic.checkin}</div>
        </div>
        <div className="flex flex-col text-sm justify-self-end">
          <div className="font-bold">Check-Out</div>
          <div>{analytic.checkout}</div>
        </div>
        <div className="flex flex-col text-sm">
          <div className="font-bold">Made At</div>
          <div>{analytic.madeAt}</div>
        </div>
      </div>
    </div>
  );
}
