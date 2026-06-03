import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (
    (path.startsWith("/admin") || path.startsWith("/api/admin")) &&
    token.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
  }

  if (
    (path.startsWith("/seller") || path.startsWith("/api/seller")) &&
    token.role !== "SELLER" &&
    token.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
  }

  if (
    (path.startsWith("/buyer") || path.startsWith("/api/buyer")) &&
    token.role !== "BUYER" &&
    token.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/auth/login?error=AccessDenied", req.url));
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/buyer/:path*",
    "/api/admin/:path*",
    "/api/seller/:path*",
    "/api/buyer/:path*",
    "/api/notifications/:path*",
  ],
};
