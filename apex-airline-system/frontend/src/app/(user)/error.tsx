"use client"; // Error components must be Client Components
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-y-2 justify-center items-center h-full">
      <h1 className="text-2xl font-bold">Something Went Wrong!</h1>
      <h2 className="text-xl font-medium text-red-600 text-center text-balance">{error.message}</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
