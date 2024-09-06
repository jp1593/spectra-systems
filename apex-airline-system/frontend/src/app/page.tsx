import Image from "next/image";
import { Suspense } from "react";
// Data
import { getCities, getFeaturedHotel } from "@/lib/data";
// Components
import { SearchBar } from "@/components/searchBar/searchBar";
import { Footer } from "@/components/home/footer";
import { Locations } from "@/components/home/locations";
import { HotelInventoryCard } from "@/components/hotels/hotelInventoryCard";
import { AboutUs } from "@/components/home/aboutUs";
import { Partners } from "@/components/home/partners";

export default async function Home() {
  const cities = await getCities();
  const featuredHotel = await getFeaturedHotel();

  return (
    <>
      <section className="flex relative h-[calc(100vh-4.813rem)]">
        <Image
          src="/home-bg.jpg"
          alt="Decorative Background"
          quality={100}
          fill
          className="object-cover -z-10"
          priority
        />
        <Suspense>
          <SearchBar locations={cities} />
        </Suspense>
      </section>
      <Section title="Featured Hotel">
        {featuredHotel && (
          <HotelInventoryCard hotel={featuredHotel} searchParams={{}} />
        )}
      </Section>
      <Section title="Our Locations">
        <Locations />
      </Section>
      <Section title="Partners">
        <Partners />
      </Section>
      <Section title="About Us">
        <AboutUs />
      </Section>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container flex flex-col py-8 gap-y-5">
      <div className="text-xl font-bold">{title}</div>
      {children}
    </div>
  );
}
