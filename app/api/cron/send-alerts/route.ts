import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const CRON_SECRET = process.env.CRON_SECRET || "";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const alerts = await prisma.lowStockAlert.findMany({
    where: { resolved: false },
    include: { item: true, business: { include: { admins: true } } },
  });

  let sent = 0; let failed = 0;
  for (const alert of alerts) {
    // skip if already notified
    const existing = await prisma.notification.findFirst({ where: { alertId: alert.id } });
    if (existing) continue;

    const recipients = alert.business.admins.map((a) => a.email);
    if (recipients.length === 0) continue;

    const subject = `Low stock alert: ${alert.item.name}`;
    const body = `Product: ${alert.item.name}\nSKU: ${alert.item.sku || "N/A"}\nCurrent quantity: ${alert.quantity}\nMinimum threshold: ${alert.threshold}\n\nView inventory: ${process.env.NEXT_PUBLIC_APP_URL || ""}/inventory`;

    for (const r of recipients) {
      let status = "failed"; let providerId: string | undefined; let error: string | undefined;
      if (resend) {
        try {
          const res = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "Inventory AI <noreply@example.com>",
            to: r,
            subject,
            text: body,
          });
          if (res.error) { error = res.error.message; }
          else { status = "sent"; providerId = res.data?.id; sent++; }
        } catch (e: any) { error = e?.message; failed++; }
      } else {
        error = "RESEND_API_KEY not configured"; failed++;
      }
      await prisma.notification.create({
        data: { businessId: alert.businessId, alertId: alert.id, recipient: r, subject, body, status, providerId, error, sentAt: status === "sent" ? new Date() : null },
      });
    }
  }

  return NextResponse.json({ processed: alerts.length, sent, failed });
}