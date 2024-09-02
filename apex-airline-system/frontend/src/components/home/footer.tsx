import Link from "next/link";
import Image from "next/image";
// Data
import { getSiteIdentity } from "@/lib/data";

export async function Footer() {
  const { name, logo, address, copyright, contactNumber } = await getSiteIdentity();

  return (
    <footer className="flex container py-8 gap-x-10 border-t">
      <div className="flex items-center h-[60px] gap-x-3">
        <Image src={logo} alt="Chain Logo" width={60} height={60} />
        <div className="text-4xl text-foreground font-satisfy">{name}</div>
      </div>
      <div className="flex flex-col gap-y-2 text-sm">
        <div>{address}</div>
        <div>{copyright}</div>
        <div>{contactNumber}</div>
      </div>
    </footer>
  );
}
