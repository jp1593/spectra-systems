import Link from "next/link";
import { cookies } from "next/headers";
// UI Components
import { Button } from "@/components/ui/button";
// Icons
import { LuUserCircle2 } from "react-icons/lu";
// JSON Web Token Utilities
import * as jose from "jose";

export async function SignInButton() {
  const token = cookies().get("token");

  if (token) {
    try {
      const { payload }: { payload: User } = await jose.jwtVerify(
        token.value,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      return (
        <Button asChild className="gap-x-3">
          <Link href="/dashboard">
            <span>
              {payload.firstName} {payload.lastName}
            </span>
            <LuUserCircle2 size={24} />
          </Link>
        </Button>
      );
    } catch (e) {
      return (
        <Button asChild className="gap-x-3">
          <Link href="/signin">
            <span>Join </span>
            <span className="text-xs">|</span>
            <span>Sign In</span>
            <LuUserCircle2 size={24} />
          </Link>
        </Button>
      );
    }
  }

  return (
    <Button asChild className="gap-x-3">
      <Link href="/signin">
        <span>Join </span>
        <span className="text-xs">|</span>
        <span>Sign In</span>
        <LuUserCircle2 size={24} />
      </Link>
    </Button>
  );
}
