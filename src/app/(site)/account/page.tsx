import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PatientAppointments } from "@/components/account/patient-appointments";

export const metadata: Metadata = { title: "Mes rendez-vous" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  const appointments = patient
    ? await prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: { service: { select: { id: true, name: true, duration: true } } },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
      })
    : [];

  return (
    <section className="section-padding bg-primary-50/50">
      <div className="container max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-primary-900">
              Bonjour {session.user.name?.split(" ")[0]} 👋
            </h1>
            <p className="mt-1 text-gray-600">Gérez vos rendez-vous au cabinet.</p>
          </div>
          <Link href="/book">
            <Button>
              <CalendarPlus className="h-4 w-4" aria-hidden /> Nouveau rendez-vous
            </Button>
          </Link>
        </div>

        <PatientAppointments
          appointments={appointments.map((a) => ({
            id: a.id,
            date: a.date.toISOString(),
            startTime: a.startTime,
            status: a.status,
            serviceName: a.service.name,
            serviceId: a.service.id,
          }))}
        />
      </div>
    </section>
  );
}
