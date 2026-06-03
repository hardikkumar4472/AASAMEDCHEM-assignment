import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { convertQuantity, calculateUnitPrice, calculateTotalPrice } from "@/lib/conversions";
import { createNotification, notifyAllAdmins } from "@/lib/notifications";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "BUYER") {
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
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "BUYER") {
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

      // Notify the buyer: order received
      await createNotification(tx, {
        userId: session.user.id,
        type: "ORDER_SUBMITTED",
        title: "Order Submitted",
        message: `Your purchase order #${quotation.id.slice(0, 8).toUpperCase()} (₹${finalTotal.toFixed(2)}) has been submitted and is awaiting admin review.`,
      });

      // Notify all admins: new order pending
      await notifyAllAdmins(tx, {
        type: "NEW_ORDER",
        title: "New Purchase Order",
        message: `Buyer ${session.user.name} (${session.user.email}) submitted order #${quotation.id.slice(0, 8).toUpperCase()} for ₹${finalTotal.toFixed(2)} — awaiting your review.`,
      });

      return quotation;
    });

    return NextResponse.json({ success: true, quotationId: result.id });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit order" }, { status: 500 });
  }
}
