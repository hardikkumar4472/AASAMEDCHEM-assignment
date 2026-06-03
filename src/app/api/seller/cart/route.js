import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { convertQuantity } from "@/lib/conversions";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    return NextResponse.json(items);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch cart items" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity, unit } = await req.json();
    if (!productId || !unit || quantity <= 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const neededBaseQty = convertQuantity(quantity, unit, product.baseUnit, product.density);
    if (neededBaseQty > Number(product.currentStockBaseUnit)) {
      return NextResponse.json({ error: "Requested quantity exceeds available stock" }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId_unit: {
          userId: session.user.id,
          productId,
          unit,
        },
      },
      update: {
        quantity: quantity,
      },
      create: {
        userId: session.user.id,
        productId,
        quantity,
        unit,
      },
    });

    return NextResponse.json(cartItem);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");

    if (cartItemId) {
      await prisma.cartItem.delete({
        where: { id: cartItemId, userId: session.user.id },
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete cart items" }, { status: 500 });
  }
}
