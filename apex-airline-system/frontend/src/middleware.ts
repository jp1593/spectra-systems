import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// JSON Web Token Utilities
import * as jose from "jose";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  const params = new URLSearchParams(request.nextUrl.search);
  params.set("pathname", request.nextUrl.pathname);

  if (!token) {
    return NextResponse.redirect(
      new URL(
        `/signin?${params.toString()}`,
        request.url
      )
    );
  }

  try {
    const { payload } = await jose.jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    const pathName = request.nextUrl.pathname;

    if (
      pathName.startsWith("/inventory") ||
      pathName.startsWith("/administration") ||
      pathName.startsWith("/purchase-logs") ||
      pathName.startsWith("/analytics")
    ) {
      if (payload.role === "user") {
        return NextResponse.redirect(new URL("/signin", request.url));
      }
    }
  } catch (e) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reservations/:path*",
    "/inventory/:path*",
    "/purchase-logs/:path*",
    "/administration/:path*",
    "/analytics/:path*",
    "/checkout/:path*",
    "/reservation/:path*",
  ],
};
