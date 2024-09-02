import Link from "next/link";
import { Button } from "@/components/ui/button";

type variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | null
  | undefined;

export function NavButton({
  variant,
  icon,
  children,
  href,
}: {
  variant: variant;
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Button className="justify-normal" variant={variant} asChild>
      <Link href={href}>
        {icon}
        {children}
      </Link>
    </Button>
  );
}
