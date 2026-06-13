import { NextResponse } from "next/server";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { sendAppointmentEmail } from "@/lib/email";
import { sendAppointmentWhatsApp } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";

/**
 * Sends a reminder (email + WhatsApp) for every CONFIRMED appointment
 * scheduled for tomorrow. Trigger daily via cron, e.g.:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/reminders
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const tomorrow = addDays(new Date(), 1);
  const appointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      date: { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) },
    },
    include: { service: true, patient: { include: { user: true } } },
  });

  let sent = 0;
  for (const a of appointments) {
    const notifyOpts = {
      name: a.patient.user.name,
      userId: a.patient.user.id,
      appointmentId: a.id,
      serviceName: a.service.name,
      date: formatDate(a.date),
      time: a.startTime,
      kind: "reminder" as const,
    };
    await Promise.allSettled([
      sendAppointmentEmail({ to: a.patient.user.email, ...notifyOpts }),
      sendAppointmentWhatsApp({ phone: a.patient.user.phone, ...notifyOpts }),
    ]);
    sent++;
  }

  return NextResponse.json({ ok: true, reminders: sent });
}
