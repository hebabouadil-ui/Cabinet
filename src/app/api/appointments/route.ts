import { NextResponse } from "next/server";
import { parse, startOfDay } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { getAvailableSlots, computeEndTime } from "@/lib/availability";
import { sendAppointmentEmail } from "@/lib/email";
import { sendAppointmentWhatsApp } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });
  if (!patient) return NextResponse.json({ appointments: [] });

  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    include: { service: { select: { name: true, duration: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ appointments });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { serviceId, date, startTime, patientNote } = parsed.data;

    const [patient, service] = await Promise.all([
      prisma.patient.findUnique({
        where: { userId: session.user.id },
        include: { user: true },
      }),
      prisma.service.findUnique({ where: { id: serviceId } }),
    ]);

    if (!patient) {
      return NextResponse.json({ error: "Profil patient introuvable" }, { status: 404 });
    }
    if (!service || !service.active) {
      return NextResponse.json({ error: "Service indisponible" }, { status: 404 });
    }

    // Re-validate the slot server-side to avoid double booking
    const slots = await getAvailableSlots(date, serviceId);
    if (!slots.includes(startTime)) {
      return NextResponse.json(
        { error: "Ce créneau n'est plus disponible. Veuillez en choisir un autre." },
        { status: 409 }
      );
    }

    const appointmentDate = startOfDay(parse(date, "yyyy-MM-dd", new Date()));
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        serviceId,
        date: appointmentDate,
        startTime,
        endTime: computeEndTime(startTime, service.duration),
        patientNote,
        price: service.price,
        status: "PENDING",
      },
    });

    const notifyOpts = {
      name: patient.user.name,
      userId: patient.user.id,
      appointmentId: appointment.id,
      serviceName: service.name,
      date: formatDate(appointmentDate),
      time: startTime,
      kind: "requested" as const,
    };
    await Promise.allSettled([
      sendAppointmentEmail({ to: patient.user.email, ...notifyOpts }),
      sendAppointmentWhatsApp({ phone: patient.user.phone, ...notifyOpts }),
    ]);

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("[appointments POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
