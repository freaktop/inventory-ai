import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await prisma.businessAdmin.findUnique({ where: { id: session.user.id as string } });
  if (!admin) return NextResponse.json({ error: "admin_not_found" }, { status: 404 });
  const businessId = admin.businessId;
  const body = await req.json();
  const { itemId, delta, reason, note } = body;
  if (!itemId || delta == null) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  const item = await prisma.inventoryItem.findFirst({ where: { id: itemId, businessId } });
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const newQty = item.quantity + Number(delta);
  if (newQty < 0) return NextResponse.json({ error: "insufficient_stock" }, { status: 400 });

  const [updated] = await prisma.$transaction([
    prisma.inventoryItem.update({ where: { id: itemId }, data: { quantity: newQty } }),
    prisma.stockAdjustment.create({
      data: {
        businessId,
        itemId,
        delta: Number(delta),
        reason: reason || "manual",
        note: note ?? null,
        performedBy: admin.email,
      },
    }),
  ]);

  // low-stock check: create alert if at/below threshold and no open alert
  let alertCreated = false;
  if (newQty <= item.minThreshold) {
    const openAlert = await prisma.lowStockAlert.findFirst({ where: { businessId, itemId, resolved: false } });
    if (!openAlert) {
      await prisma.lowStockAlert.create({
        data: { businessId, itemId, quantity: newQty, threshold: item.minThreshold },
      });
      alertCreated = true;
    }
  } else {
    // resolve open alerts if replenished
    await prisma.lowStockAlert.updateMany({
      where: { businessId, itemId, resolved: false },
      data: { resolved: true, resolvedAt: new Date() },
    });
  }

  await prisma.auditLog.create({
    data: { businessId, action: "stock_adjusted", metadata: { itemId, delta, newQty, alertCreated } },
  });

  return NextResponse.json({ item: updated, alertCreated });
}