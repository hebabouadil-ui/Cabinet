import { prisma } from "@/lib/prisma";

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
    requested: `Bonjour ${opts.name}, votre demande de rendez-vous (${opts.serviceName}) le ${opts.date} à ${opts.time} a bien été reçue. Vous recevrez une confirmation prochainement. — Cabinet Kiné Santé`,
    confirmed: `Bonjour ${opts.name}, votre rendez-vous (${opts.serviceName}) est confirmé le ${opts.date} à ${opts.time}. À bientôt ! — Cabinet Kiné Santé`,
    rejected: `Bonjour ${opts.name}, le créneau demandé le ${opts.date} à ${opts.time} n'est plus disponible. Merci de choisir un autre horaire sur votre espace patient. — Cabinet Kiné Santé`,
    cancelled: `Bonjour ${opts.name}, votre rendez-vous du ${opts.date} à ${opts.time} a été annulé. — Cabinet Kiné Santé`,
    rescheduled: `Bonjour ${opts.name}, votre rendez-vous (${opts.serviceName}) a été déplacé au ${opts.date} à ${opts.time}. — Cabinet Kiné Santé`,
    reminder: `Bonjour ${opts.name}, rappel : rendez-vous ${opts.serviceName} demain ${opts.date} à ${opts.time}. — Cabinet Kiné Santé`,
  };

  await sendWhatsAppMessage({
    to: opts.phone,
    body: messages[opts.kind],
    userId: opts.userId,
    appointmentId: opts.appointmentId,
  });
}
