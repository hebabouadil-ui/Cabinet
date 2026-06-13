import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { AppointmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppointmentActions } from "@/components/admin/appointment-actions";
import {
  cn,
  formatDateShort,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/utils";

export const metadata: Metadata = { title: "Rendez-vous — Admin" };
export const dynamic = "force-dynamic";

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"] as const;

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter =
    status && STATUSES.includes(status as (typeof STATUSES)[number]) && status !== "ALL"
      ? (status as AppointmentStatus)
      : undefined;

  const appointments = await prisma.appointment.findMany({
    where: filter ? { status: filter } : undefined,
    include: {
      service: { select: { name: true } },
      patient: {
        include: { user: { select: { name: true, email: true, phone: true } } },
      },
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    take: 200,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-primary-900">
        Rendez-vous
      </h1>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "/admin/appointments" : `/admin/appointments?status=${s}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              (s === "ALL" && !filter) || filter === s
                ? "bg-primary-700 text-white"
                : "bg-white text-gray-600 hover:bg-primary-50"
            )}
          >
            {s === "ALL" ? "Tous" : APPOINTMENT_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Soin</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                  Aucun rendez-vous trouvé.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <p className="font-medium text-primary-900">{a.patient.user.name}</p>
                    <p className="text-xs text-gray-500">{a.patient.user.phone}</p>
                  </TableCell>
                  <TableCell>{a.service.name}</TableCell>
                  <TableCell>{formatDateShort(a.date)}</TableCell>
                  <TableCell>
                    {a.startTime}–{a.endTime}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(APPOINTMENT_STATUS_COLORS[a.status])}>
                      {APPOINTMENT_STATUS_LABELS[a.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <AppointmentActions
                      id={a.id}
                      status={a.status}
                      serviceId={a.serviceId}
                      patientNote={a.patientNote}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
