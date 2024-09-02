import { Suspense } from "react";
import Image from "next/image";
// Data
import { getCities } from "@/lib/data";
// Components
import { HotelCardSkeleton } from "@/components/skeletons/hotelCardSkeleton";
import { SearchBar } from "@/components/searchBar/searchBar";
import { FilteredHotels } from "@/components/hotels/filteredHotels";

export default async function SearchHome({
  searchParams,
}: {
  searchParams: HotelSearchParams;
}) {
  const cities = await getCities();

  return (
    <section className="relative min-h-[calc(100vh-4.813rem)]">
      <Image
        src="/home-bg.jpg"
        alt="Decorative Background"
        quality={100}
        fill
        className="object-cover -z-10 fixed"
        priority
      />
      <div className="container flex flex-col py-8 gap-y-10">
        <Suspense
          fallback={Array(2)
            .fill(0)
            .map((_, index) => (
              <HotelCardSkeleton key={index} />
            ))}
        >
          <SearchBar locations={cities} />
          <FilteredHotels searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
