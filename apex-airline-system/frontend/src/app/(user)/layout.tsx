import { cookies } from "next/headers";
// Components
import { NavBar } from "@/components/user/navBar";
// JSON Web Token Utilities
import * as jose from "jose";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAdmin = false;
  const token = cookies().get("token");

  if (token) {
    try {
      const { payload }: { payload: User } = await jose.jwtVerify(
        token.value,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      if (payload.role === "admin" || payload.role === "webService") {
        isAdmin = true;
      }
    } catch (e) {
      isAdmin = false;
    }
  }

  return (
    <div className="flex container h-[calc(100vh-4.813rem)] overflow-y-auto custom-scrollbar">
      <NavBar isAdmin={isAdmin} />
      <div className="flex flex-col pt-8 pl-8 w-full overflow-x-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
}
