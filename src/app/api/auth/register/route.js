import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { notifyAllAdmins } from "@/lib/notifications";
import { registerLimiter, getIP, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req) {
  // Rate limit: 5 registrations per hour per IP
  const ip = getIP(req);
  const limit = registerLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.resetAt);

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (role !== "SELLER" && role !== "BUYER") {
      return NextResponse.json({ error: "Invalid registration role" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role,
      },
    });

    // Notify admins about the new registration
    await notifyAllAdmins(prisma, {
      type: "NEW_USER",
      title: "New User Registered",
      message: `${name} (${email.toLowerCase()}) registered as a ${role}.`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
