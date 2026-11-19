import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = await prisma.businessAdmin.findUnique({ where: { id: session.user.id as string } });
  if (!admin) return NextResponse.json({ error: "admin_not_found" }, { status: 404 });
  const businessId = admin.businessId;
  const items = await prisma.inventoryItem.findMany({ where: { businessId }, select: { quantity: true, minThreshold: true } });
  const totalItems = items.length;
  const lowStock = items.filter((i) => i.quantity > 0 && i.quantity <= i.minThreshold).length;
  const outOfStock = items.filter((i) => i.quantity <= 0).length;
  const [recentAdjustments, recentAlerts] = await Promise.all([
    prisma.stockAdjustment.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 20, include: { item: true } }),
    prisma.lowStockAlert.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 20, include: { item: true } }),
  ]);
  return NextResponse.json({ businessId, metrics: { totalItems, lowStock, outOfStock }, recentAdjustments, recentAlerts });
}