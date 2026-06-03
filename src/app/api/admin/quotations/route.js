import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { convertQuantity } from "@/lib/conversions";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quotations = await prisma.quotation.findMany({
      include: {
        seller: {
          select: { name: true, email: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotations);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    if (quotation.status !== "PENDING") {
      return NextResponse.json({ error: "Quotation already processed" }, { status: 400 });
    }

    if (status === "REJECTED") {
      const updated = await prisma.quotation.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(updated);
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const item of quotation.items) {
        const neededBaseQty = convertQuantity(
          item.quantity,
          item.unit,
          item.product.baseUnit,
          item.product.density
        );

        if (neededBaseQty > Number(item.product.currentStockBaseUnit)) {
          throw new Error(`Insufficient stock for product: ${item.product.name}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStockBaseUnit: {
              decrement: neededBaseQty,
            },
          },
        });
      }

      return await tx.quotation.update({
        where: { id },
        data: { status: "APPROVED" },
      });
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to process quotation" }, { status: 500 });
  }
}
