import Link from "next/link";
import Image from "next/image";
// Data
import { getSiteIdentity } from "@/lib/data";
// Components
import { HeaderNav } from "@/components/home/headerNav";
import { SignInButton } from "@/components/home/signInButton";

export async function Header() {
  const { name, logo } = await getSiteIdentity();
  
  return (
    <header className="border-b">
      <div className="container py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center h-[60px] gap-x-3">
          <Image src={logo} alt="Chain Logo" width={60} height={60} />
          <div className="text-4xl text-foreground font-satisfy">{name}</div>
        </Link>
        <HeaderNav />
        <SignInButton />
      </div>
    </header>
  );
}
