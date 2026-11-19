import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function getBusinessId(userId: string) {
  const admin = await prisma.businessAdmin.findUnique({ where: { id: userId } });
  return admin?.businessId ?? null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const businessId = await getBusinessId(session.user.id as string);
  if (!businessId) return NextResponse.json({ error: "admin_not_found" }, { status: 404 });
  const items = await prisma.inventoryItem.findMany({ where: { businessId }, orderBy: { name: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const businessId = await getBusinessId(session.user.id as string);
  if (!businessId) return NextResponse.json({ error: "admin_not_found" }, { status: 404 });
  const body = await req.json();
  const { name, description, sku, quantity, minThreshold, supplierName, supplierEmail, supplierPhone } = body;
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  const item = await prisma.inventoryItem.create({
    data: {
      businessId,
      name,
      description: description ?? null,
      sku: sku ?? null,
      quantity: Number(quantity ?? 0),
      minThreshold: Number(minThreshold ?? 5),
      supplierName: supplierName ?? null,
      supplierEmail: supplierEmail ?? null,
      supplierPhone: supplierPhone ?? null,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const businessId = await getBusinessId(session.user.id as string);
  if (!businessId) return NextResponse.json({ error: "admin_not_found" }, { status: 404 });
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
  const existing = await prisma.inventoryItem.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const item = await prisma.inventoryItem.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      description: data.description ?? undefined,
      sku: data.sku ?? undefined,
      quantity: data.quantity != null ? Number(data.quantity) : undefined,
      minThreshold: data.minThreshold != null ? Number(data.minThreshold) : undefined,
      supplierName: data.supplierName ?? undefined,
      supplierEmail: data.supplierEmail ?? undefined,
      supplierPhone: data.supplierPhone ?? undefined,
    },
  });
  return NextResponse.json({ item });
}