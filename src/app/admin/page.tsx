import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Euro,
  UserPlus,
  Users,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cn,
  formatDateShort,
  formatPrice,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/utils";

export const metadata: Metadata = { title: "Tableau de bord — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin/appointments");

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalPatients,
    upcomingCount,
    monthlyCount,
    newRegistrations,
    monthlyRevenue,
    pendingCount,
    upcoming,
    revenueByMonth,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({
      where: { date: { gte: startOfDay(now) }, status: { in: ["PENDING", "CONFIRMED"] } },
    }),
    prisma.appointment.count({
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.user.count({
      where: { role: "PATIENT", createdAt: { gte: monthStart } },
    }),
    prisma.appointment.aggregate({
      _sum: { price: true },
      where: { status: "COMPLETED", date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.findMany({
      where: { date: { gte: startOfDay(now) }, status: { in: ["PENDING", "CONFIRMED"] } },
      include: {
        service: { select: { name: true } },
        patient: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 8,
    }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const month = subMonths(now, 5 - i);
        return prisma.appointment
          .aggregate({
            _sum: { price: true },
            where: {
              status: "COMPLETED",
              date: { gte: startOfMonth(month), lte: endOfMonth(month) },
            },
          })
          .then((r) => ({
            label: format(month, "MMM", { locale: fr }),
            total: r._sum.price ?? 0,
          }));
      })
    ),
  ]);

  const stats = [
    { label: "Patients", value: totalPatients, icon: Users },
    { label: "RDV à venir", value: upcomingCount, icon: CalendarClock },
    { label: "RDV ce mois", value: monthlyCount, icon: CalendarDays },
    { label: "Nouveaux inscrits", value: newRegistrations, icon: UserPlus },
    {
      label: "Revenu du mois",
      value: formatPrice(monthlyRevenue._sum.price ?? 0),
      icon: Euro,
    },
  ];

  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.total), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-primary-900">
          Tableau de bord
        </h1>
        {pendingCount > 0 && (
          <Link
            href="/admin/appointments?status=PENDING"
            className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200"
          >
            {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <stat.icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-semibold text-primary-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Prochains rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Aucun rendez-vous à venir.
              </p>
            ) : (
              <ul className="divide-y">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-primary-900">
                        {a.patient.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.service.name} — {formatDateShort(a.date)} à {a.startTime}
                      </p>
                    </div>
                    <Badge className={cn(APPOINTMENT_STATUS_COLORS[a.status])}>
                      {APPOINTMENT_STATUS_LABELS[a.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/appointments"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
            >
              Voir tous les rendez-vous <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenus (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-3">
              {revenueByMonth.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-primary-800">
                    {m.total > 0 ? formatPrice(m.total) : "—"}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-primary-600"
                    style={{ height: `${Math.max((m.total / maxRevenue) * 100, 4)}%` }}
                    aria-label={`${m.label} : ${formatPrice(m.total)}`}
                  />
                  <span className="text-xs capitalize text-gray-500">{m.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
