import { prisma } from "@/lib/prisma";
import { addMinutes, format, parse, startOfDay, endOfDay, isBefore } from "date-fns";

/**
 * Computes available booking slots for a given date and service.
 * Takes into account: weekly working hours, blocked dates, existing
 * appointments (PENDING + CONFIRMED), slot duration and buffer.
 */
export async function getAvailableSlots(dateStr: string, serviceId: string) {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  if (isNaN(date.getTime())) return [];

  const [settings, service, blocked, windows, appointments] = await Promise.all([
    prisma.clinicSettings.findUnique({ where: { id: "singleton" } }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.blockedDate.findFirst({
      where: { date: { gte: startOfDay(date), lte: endOfDay(date) } },
    }),
    prisma.availability.findMany({
      where: { dayOfWeek: date.getDay(), isActive: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay(date), lte: endOfDay(date) },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  if (!service || blocked || windows.length === 0) return [];

  const maxAdvanceDays = settings?.maxAdvanceDays ?? 60;
  const maxDate = addMinutes(startOfDay(new Date()), maxAdvanceDays * 24 * 60);
  if (isBefore(date, startOfDay(new Date())) || isBefore(maxDate, date)) return [];

  const duration = service.duration || settings?.slotDuration || 45;
  const buffer = settings?.bufferMinutes ?? 0;
  const step = duration + buffer;
  const now = new Date();

  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const taken = appointments.map((a) => ({
    start: toMinutes(a.startTime),
    end: toMinutes(a.endTime),
  }));

  const slots: string[] = [];
  for (const window of windows) {
    let cursor = toMinutes(window.startTime);
    const windowEnd = toMinutes(window.endTime);

    while (cursor + duration <= windowEnd) {
      const slotEnd = cursor + duration;
      const overlaps = taken.some((t) => cursor < t.end && slotEnd > t.start);

      const slotDate = addMinutes(startOfDay(date), cursor);
      const isPast = isBefore(slotDate, now);

      if (!overlaps && !isPast) {
        slots.push(format(slotDate, "HH:mm"));
      }
      cursor += step;
    }
  }

  return slots;
}

export function computeEndTime(startTime: string, durationMinutes: number) {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
