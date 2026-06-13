import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CalendarManager } from "@/components/admin/calendar-manager";

export const metadata: Metadata = { title: "Agenda & horaires — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const [availability, blockedDates] = await Promise.all([
    prisma.availability.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.blockedDate.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-primary-900">
        Agenda & horaires
      </h1>
      <CalendarManager
        availability={availability.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isActive: a.isActive,
        }))}
        blockedDates={blockedDates.map((b) => ({
          id: b.id,
          date: b.date.toISOString().slice(0, 10),
          reason: b.reason,
        }))}
      />
    </div>
  );
}
