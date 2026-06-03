import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { loginLimiter, registerLimiter, getIP, rateLimitResponse } from "@/lib/rateLimit";

async function middleware(req) {
  const path = req.nextUrl.pathname;
  const method = req.method;
  const ip = getIP(req);
  if (method === "POST" && path === "/api/auth/signin") {
    const result = loginLimiter.check(ip);
    if (!result.success) return rateLimitResponse(result.resetAt);
  }
  if (method === "POST" && path === "/api/auth/register") {
    const result = registerLimiter.check(ip);
    if (!result.success) return rateLimitResponse(result.resetAt);
  }
  if (
    path.startsWith("/api/auth/") ||
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

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
    "/api/auth/signin",
    "/api/auth/register",
    "/admin/:path*",
    "/seller/:path*",
    "/buyer/:path*",
    "/api/admin/:path*",
    "/api/seller/:path*",
    "/api/buyer/:path*",
    "/api/notifications/:path*",
  ],
};
