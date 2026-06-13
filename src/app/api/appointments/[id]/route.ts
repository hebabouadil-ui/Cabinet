import { NextResponse } from "next/server";
import { parse, startOfDay } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rescheduleSchema } from "@/lib/validations";
import { getAvailableSlots, computeEndTime } from "@/lib/availability";
import { sendAppointmentEmail } from "@/lib/email";
import { sendAppointmentWhatsApp } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

async function getOwnedAppointment(id: string, userId: string) {
  return prisma.appointment.findFirst({
    where: { id, patient: { userId } },
    include: {
      service: true,
      patient: { include: { user: true } },
    },
  });
}

// Patient reschedules their own appointment
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const appointment = await getOwnedAppointment(id, session.user.id);
    if (!appointment) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json(
        { error: "Ce rendez-vous ne peut plus être modifié." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = rescheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { date, startTime } = parsed.data;
    const slots = await getAvailableSlots(date, appointment.serviceId);
    if (!slots.includes(startTime)) {
      return NextResponse.json(
        { error: "Ce créneau n'est plus disponible." },
        { status: 409 }
      );
    }

    const newDate = startOfDay(parse(date, "yyyy-MM-dd", new Date()));
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        date: newDate,
        startTime,
        endTime: computeEndTime(startTime, appointment.service.duration),
        // A rescheduled appointment goes back to pending validation
        status: "PENDING",
      },
    });

    const notifyOpts = {
      name: appointment.patient.user.name,
      userId: appointment.patient.user.id,
      appointmentId: appointment.id,
      serviceName: appointment.service.name,
      date: formatDate(newDate),
      time: startTime,
      kind: "rescheduled" as const,
    };
    await Promise.allSettled([
      sendAppointmentEmail({ to: appointment.patient.user.email, ...notifyOpts }),
      sendAppointmentWhatsApp({ phone: appointment.patient.user.phone, ...notifyOpts }),
    ]);

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error("[appointments PATCH]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Patient cancels their own appointment
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const appointment = await getOwnedAppointment(id, session.user.id);
    if (!appointment) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json(
        { error: "Ce rendez-vous ne peut plus être annulé." },
        { status: 400 }
      );
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED", cancelReason: "Annulé par le patient" },
    });

    const notifyOpts = {
      name: appointment.patient.user.name,
      userId: appointment.patient.user.id,
      appointmentId: appointment.id,
      serviceName: appointment.service.name,
      date: formatDate(appointment.date),
      time: appointment.startTime,
      kind: "cancelled" as const,
    };
    await Promise.allSettled([
      sendAppointmentEmail({ to: appointment.patient.user.email, ...notifyOpts }),
      sendAppointmentWhatsApp({ phone: appointment.patient.user.phone, ...notifyOpts }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[appointments DELETE]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
