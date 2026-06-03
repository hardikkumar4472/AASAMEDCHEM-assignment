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

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    if (!pageParam && !limitParam) {
      const products = await prisma.product.findMany({
        orderBy: { name: "asc" },
      });
      return NextResponse.json(products);
    }

    const page = parseInt(pageParam) || 1;
    const limit = parseInt(limitParam) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sku, name, description, basePrice, baseUnit, currentStockBaseUnit, density } = await req.json();

    if (!sku || !name || !baseUnit || basePrice === undefined || currentStockBaseUnit === undefined) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description: description || "",
        basePrice: parseFloat(basePrice),
        baseUnit,
        currentStockBaseUnit: parseFloat(currentStockBaseUnit),
        density: density ? parseFloat(density) : 1.0,
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, sku, name, description, basePrice, baseUnit, currentStockBaseUnit, density } = await req.json();

    if (!id || !sku || !name || !baseUnit || basePrice === undefined || currentStockBaseUnit === undefined) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        sku,
        name,
        description: description || "",
        basePrice: parseFloat(basePrice),
        baseUnit,
        currentStockBaseUnit: parseFloat(currentStockBaseUnit),
        density: density ? parseFloat(density) : 1.0,
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
