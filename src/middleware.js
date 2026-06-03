import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if ((path.startsWith("/admin") || path.startsWith("/api/admin")) && token?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/auth/login?error=AccessDenied", req.url));
    }

    if ((path.startsWith("/seller") || path.startsWith("/api/seller")) && token?.role !== "SELLER" && token?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/auth/login?error=AccessDenied", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/api/admin/:path*",
    "/api/seller/:path*",
  ],
};
