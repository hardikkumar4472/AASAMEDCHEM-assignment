import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const unit = searchParams.get("unit") || "";
    const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
    const maxPrice = parseFloat(searchParams.get("maxPrice")) || Infinity;
    const sortBy = searchParams.get("sortBy") || "name";

    const where = {
      basePrice: {
        gte: minPrice,
        lte: maxPrice === Infinity ? undefined : maxPrice,
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.description = {
        contains: category,
        mode: "insensitive",
      };
    }

    if (unit) {
      where.baseUnit = unit;
    }

    const orderMap = {
      name: { name: "asc" },
      priceAsc: { basePrice: "asc" },
      priceDesc: { basePrice: "desc" },
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: orderMap[sortBy] || { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
