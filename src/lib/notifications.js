import prisma from "@/lib/prisma";

export async function createNotification(tx, { userId, type, title, message }) {
  return tx.notification.create({
    data: { userId, type, title, message },
  });
}

export async function notifyAllAdmins(tx, { type, title, message }) {
  const admins = await tx.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length === 0) return;
  await tx.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, type, title, message })),
  });
}
