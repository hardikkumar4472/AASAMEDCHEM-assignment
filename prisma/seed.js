import prisma from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/auth.js";

async function main() {
  await prisma.cartItem.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  const adminHash = await hashPassword("admin123");
  const sellerHash = await hashPassword("seller123");
  const buyerHash = await hashPassword("buyer123");

  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      passwordHash: adminHash,
      name: "Aasa Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "seller@gmail.com",
      passwordHash: sellerHash,
      name: "Aasa Seller",
      role: "SELLER",
    },
  });

  await prisma.user.create({
    data: {
      email: "buyer@gmail.com",
      passwordHash: buyerHash,
      name: "Aasa Buyer",
      role: "BUYER",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        sku: "ETH-001",
        name: "Ethanol (Absolute)",
        description: "99.9% Pure analytical grade ethanol liquid.",
        basePrice: 0.05,
        baseUnit: "ml",
        currentStockBaseUnit: 500000,
        density: 0.789,
      },
      {
        sku: "NACL-002",
        name: "Sodium Chloride",
        description: "USP Grade fine sodium chloride powder.",
        basePrice: 0.01,
        baseUnit: "g",
        currentStockBaseUnit: 1000000,
        density: 2.16,
      },
      {
        sku: "ASP-003",
        name: "Aspirin Powder (Acetylsalicylic Acid)",
        description: "Pharmaceutical active pharmaceutical ingredient.",
        basePrice: 0.15,
        baseUnit: "g",
        currentStockBaseUnit: 250000,
        density: 1.4,
      },
      {
        sku: "BEK-004",
        name: "Borosilicate Glass Beaker (250ml)",
        description: "High temperature resistant laboratory beaker.",
        basePrice: 12.50,
        baseUnit: "pc",
        currentStockBaseUnit: 200,
        density: 1.0,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
