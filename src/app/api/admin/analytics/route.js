import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [usersCount, productsCount, quotationsCount, quotations, products, users] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.quotation.count(),
      prisma.quotation.findMany({
        include: {
          seller: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const pending = quotations.filter(q => q.status === "PENDING").length;
    const approved = quotations.filter(q => q.status === "APPROVED").length;
    const rejected = quotations.filter(q => q.status === "REJECTED").length;

    const totalRevenue = quotations
      .filter(q => q.status === "APPROVED")
      .reduce((sum, q) => sum + Number(q.totalPrice), 0);

    const totalStockValue = products.reduce((sum, p) => sum + Number(p.basePrice) * Number(p.currentStockBaseUnit), 0);

    const recentSalesTrend = quotations
      .slice(0, 10)
      .reverse()
      .map(q => ({
        id: q.id.slice(0, 8),
        date: new Date(q.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        total: Number(q.totalPrice),
        status: q.status,
      }));

    return NextResponse.json({
      metrics: {
        totalUsers: usersCount,
        totalProducts: productsCount,
        totalQuotations: quotationsCount,
        pendingQuotations: pending,
        approvedQuotations: approved,
        rejectedQuotations: rejected,
        totalRevenue,
        totalStockValue,
      },
      users,
      orders: quotations.slice(0, 10).map(q => ({
        id: q.id,
        userEmail: q.seller.email,
        userName: q.seller.name,
        userRole: q.seller.role,
        status: q.status,
        total: Number(q.totalPrice),
        itemsCount: q.items.length,
        createdAt: q.createdAt,
      })),
      charts: {
        salesByStatus: [
          { status: "PENDING", count: pending },
          { status: "APPROVED", count: approved },
          { status: "REJECTED", count: rejected },
        ],
        recentSalesTrend,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate analytics data" }, { status: 500 });
  }
}
