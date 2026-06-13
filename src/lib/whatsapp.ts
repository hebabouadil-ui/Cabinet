import { prisma } from "@/lib/prisma";
import { CLINIC_NAME } from "@/lib/constants";

/**
 * WhatsApp notifications via the Meta WhatsApp Cloud API.
 * Requires WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN.
 * When not configured, notifications are logged as PENDING so they can
 * be reviewed in the admin panel without breaking the booking flow.
 */
export async function sendWhatsAppMessage(opts: {
  to: string; // E.164 format, e.g. +212600000000
  body: string;
  userId?: string;
  appointmentId?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      type: "WHATSAPP",
      subject: "WhatsApp",
      body: opts.body,
      userId: opts.userId,
      appointmentId: opts.appointmentId,
    },
  });

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("[whatsapp] credentials not set — message stored as PENDING");
    return;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: opts.to.replace(/[^+\d]/g, ""),
          type: "text",
          text: { body: opts.body },
        }),
      }
    );

    if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${await res.text()}`);

    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (error) {
    console.error("[whatsapp] send failed:", error);
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED" },
    });
  }
}

export async function sendAppointmentWhatsApp(opts: {
  phone: string | null | undefined;
  name: string;
  userId?: string;
  appointmentId: string;
  serviceName: string;
  date: string;
  time: string;
  kind: "requested" | "confirmed" | "rejected" | "cancelled" | "rescheduled" | "reminder";
}) {
  if (!opts.phone) return;

  const messages: Record<typeof opts.kind, string> = {
    requested: `Bonjour ${opts.name}, votre demande de rendez-vous (${opts.serviceName}) le ${opts.date} à ${opts.time} a bien été reçue. Vous recevrez une confirmation prochainement. — ${CLINIC_NAME}`,
    confirmed: `Bonjour ${opts.name}, votre rendez-vous (${opts.serviceName}) est confirmé le ${opts.date} à ${opts.time}. À bientôt ! — ${CLINIC_NAME}`,
    rejected: `Bonjour ${opts.name}, le créneau demandé le ${opts.date} à ${opts.time} n'est plus disponible. Merci de choisir un autre horaire sur votre espace patient. — ${CLINIC_NAME}`,
    cancelled: `Bonjour ${opts.name}, votre rendez-vous du ${opts.date} à ${opts.time} a été annulé. — ${CLINIC_NAME}`,
    rescheduled: `Bonjour ${opts.name}, votre rendez-vous (${opts.serviceName}) a été déplacé au ${opts.date} à ${opts.time}. — ${CLINIC_NAME}`,
    reminder: `Bonjour ${opts.name}, rappel : rendez-vous ${opts.serviceName} demain ${opts.date} à ${opts.time}. — ${CLINIC_NAME}`,
  };

  await sendWhatsAppMessage({
    to: opts.phone,
    body: messages[opts.kind],
    userId: opts.userId,
    appointmentId: opts.appointmentId,
  });
}
