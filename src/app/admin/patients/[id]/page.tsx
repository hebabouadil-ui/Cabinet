import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Phone, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNotes } from "@/components/admin/admin-notes";
import {
  cn,
  formatDateShort,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/utils";

export const metadata: Metadata = { title: "Fiche patient — Admin" };
export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: true,
      appointments: {
        include: { service: { select: { name: true } } },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
      },
      notes: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <User className="h-7 w-7" aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-900">
            {patient.user.name}
          </h1>
          <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" aria-hidden /> {patient.user.email}
            </span>
            {patient.user.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" aria-hidden /> {patient.user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Historique des rendez-vous ({patient.appointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.appointments.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                Aucun rendez-vous.
              </p>
            ) : (
              <ul className="divide-y">
                {patient.appointments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-primary-900">
                        {a.service.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateShort(a.date)} à {a.startTime}
                      </p>
                      {a.patientNote && (
                        <p className="mt-1 text-xs italic text-gray-500">
                          « {a.patientNote} »
                        </p>
                      )}
                    </div>
                    <Badge className={cn(APPOINTMENT_STATUS_COLORS[a.status])}>
                      {APPOINTMENT_STATUS_LABELS[a.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <AdminNotes
          patientId={patient.id}
          notes={patient.notes.map((n) => ({
            id: n.id,
            content: n.content,
            authorName: n.author.name,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
