import { NextResponse } from "next/server";
import { z } from "zod";
import { parse, startOfDay } from "date-fns";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, computeEndTime } from "@/lib/availability";
import { sendAppointmentEmail } from "@/lib/email";
import { sendAppointmentWhatsApp } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";

const updateSchema = z
  .object({
    status: z
      .enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"])
      .optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    cancelReason: z.string().max(500).optional(),
  })
  .refine((d) => d.status || (d.date && d.startTime), {
    message: "Statut ou nouvelle date requise",
  });

const KIND_BY_STATUS = {
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true, patient: { include: { user: true } } },
    });
    if (!appointment) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { status, date, startTime, cancelReason } = parsed.data;
    let updated;
    let notifyKind: "confirmed" | "rejected" | "cancelled" | "rescheduled" | null = null;
    let notifyDate = formatDate(appointment.date);
    let notifyTime = appointment.startTime;

    if (date && startTime) {
      const slots = await getAvailableSlots(date, appointment.serviceId);
      if (!slots.includes(startTime)) {
        return NextResponse.json(
          { error: "Ce créneau n'est plus disponible." },
          { status: 409 }
        );
      }
      const newDate = startOfDay(parse(date, "yyyy-MM-dd", new Date()));
      updated = await prisma.appointment.update({
        where: { id },
        data: {
          date: newDate,
          startTime,
          endTime: computeEndTime(startTime, appointment.service.duration),
          status: "CONFIRMED",
        },
      });
      notifyKind = "rescheduled";
      notifyDate = formatDate(newDate);
      notifyTime = startTime;
    } else if (status) {
      updated = await prisma.appointment.update({
        where: { id },
        data: { status, cancelReason },
      });
      notifyKind = KIND_BY_STATUS[status as keyof typeof KIND_BY_STATUS] ?? null;
    }

    if (notifyKind) {
      const notifyOpts = {
        name: appointment.patient.user.name,
        userId: appointment.patient.user.id,
        appointmentId: appointment.id,
        serviceName: appointment.service.name,
        date: notifyDate,
        time: notifyTime,
        kind: notifyKind,
      };
      await Promise.allSettled([
        sendAppointmentEmail({ to: appointment.patient.user.email, ...notifyOpts }),
        sendAppointmentWhatsApp({ phone: appointment.patient.user.phone, ...notifyOpts }),
      ]);
    }

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error("[admin appointments PATCH]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
