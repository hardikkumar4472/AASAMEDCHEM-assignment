import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { convertQuantity, calculateUnitPrice, calculateTotalPrice } from "@/lib/conversions";
import { createNotification, notifyAllAdmins } from "@/lib/notifications";
import { quotationLimiter, getIP, rateLimitResponse } from "@/lib/rateLimit";

// GET /api/seller/quotations — seller's quotation/order history
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quotations = await prisma.quotation.findMany({
      where: { sellerId: session.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotations);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch quotation history" }, { status: 500 });
  }
}

// POST /api/seller/quotations — submit cart as a new quotation
export async function POST(req) {
  // Rate limit: 20 quotation submissions per minute per IP
  const ip = getIP(req);
  const limit = quotationLimiter.check(ip);
  if (!limit.success) return rateLimitResponse(limit.resetAt);

  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adminNotes } = await req.json();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let calculatedSubtotal = 0;
    const quotationItemsData = [];

    for (const item of cartItems) {
      const neededBaseQty = convertQuantity(item.quantity, item.unit, item.product.baseUnit, item.product.density);
      if (neededBaseQty > Number(item.product.currentStockBaseUnit)) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${item.product.name}` },
          { status: 400 }
        );
      }

      const unitPrice = calculateUnitPrice(
        item.product.basePrice,
        item.product.baseUnit,
        item.unit,
        item.product.density
      );

      const calculatedPrice = calculateTotalPrice(item.quantity, unitPrice);
      calculatedSubtotal += calculatedPrice;

      quotationItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnitBase: item.product.basePrice,
        pricePerUnitConverted: unitPrice,
        calculatedPrice: calculatedPrice,
      });
    }

    const gst = calculatedSubtotal * 0.18;
    const finalTotal = calculatedSubtotal + gst;

    const result = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          sellerId: session.user.id,
          status: "PENDING",
          totalPrice: finalTotal,
          adminNotes: adminNotes || "",
          items: {
            create: quotationItemsData,
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      // Notify the seller: quotation received
      await createNotification(tx, {
        userId: session.user.id,
        type: "ORDER_SUBMITTED",
        title: "Quotation Submitted",
        message: `Your quotation #${quotation.id.slice(0, 8).toUpperCase()} (₹${finalTotal.toFixed(2)}) has been submitted and is awaiting admin review.`,
      });

      // Notify all admins: new quotation pending
      await notifyAllAdmins(tx, {
        type: "NEW_ORDER",
        title: "New Seller Quotation",
        message: `Seller ${session.user.name} (${session.user.email}) submitted quotation #${quotation.id.slice(0, 8).toUpperCase()} for ₹${finalTotal.toFixed(2)} — awaiting your review.`,
      });

      return quotation;
    });

    return NextResponse.json({ success: true, quotationId: result.id });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit quotation" }, { status: 500 });
  }
}
