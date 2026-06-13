"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarX2, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  cn,
  formatDate,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/utils";

type AppointmentItem = {
  id: string;
  date: string;
  startTime: string;
  status: string;
  serviceName: string;
  serviceId: string;
};

export function PatientAppointments({
  appointments,
}: {
  appointments: AppointmentItem[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<AppointmentItem | null>(null);

  const cancel = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Impossible d'annuler ce rendez-vous.");
        return;
      }
      toast.success("Rendez-vous annulé.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-12 text-center">
        <CalendarX2 className="mx-auto mb-3 h-10 w-10 text-primary-300" aria-hidden />
        <p className="text-gray-600">Vous n&apos;avez aucun rendez-vous pour le moment.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {appointments.map((a) => {
          const isActionable = ["PENDING", "CONFIRMED"].includes(a.status);
          return (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary-100 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="mb-1 flex items-center gap-3">
                  <p className="font-semibold text-primary-900">{a.serviceName}</p>
                  <Badge className={cn(APPOINTMENT_STATUS_COLORS[a.status])}>
                    {APPOINTMENT_STATUS_LABELS[a.status]}
                  </Badge>
                </div>
                <p className="text-sm capitalize text-gray-600">
                  {formatDate(a.date)} à {a.startTime}
                </p>
              </div>
              {isActionable && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRescheduling(a)}
                    disabled={busy === a.id}
                  >
                    <RefreshCcw className="h-3.5 w-3.5" aria-hidden /> Reporter
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => cancel(a.id)}
                    disabled={busy === a.id}
                  >
                    {busy === a.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <CalendarX2 className="h-3.5 w-3.5" aria-hidden />
                    )}
                    Annuler
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <RescheduleDialog
        appointment={rescheduling}
        onClose={() => setRescheduling(null)}
        onDone={() => {
          setRescheduling(null);
          router.refresh();
        }}
      />
    </>
  );
}

function RescheduleDialog({
  appointment,
  onClose,
  onDone,
}: {
  appointment: AppointmentItem | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = useCallback(async () => {
    if (!date || !appointment) return;
    setLoading(true);
    setSlot("");
    try {
      const res = await fetch(
        `/api/availability?date=${date}&serviceId=${appointment.serviceId}`
      );
      const json = await res.json();
      setSlots(json.slots ?? []);
    } finally {
      setLoading(false);
    }
  }, [date, appointment]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const submit = async () => {
    if (!appointment) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime: slot }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Impossible de reporter le rendez-vous.");
        return;
      }
      toast.success("Rendez-vous reporté. Il sera revalidé par le cabinet.");
      onDone();
    } finally {
      setSubmitting(false);
    }
  };

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  return (
    <Dialog open={!!appointment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reporter le rendez-vous</DialogTitle>
          <DialogDescription>
            {appointment?.serviceName} — choisissez une nouvelle date et un horaire.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const value = format(day, "yyyy-MM-dd");
            return (
              <button
                key={value}
                onClick={() => setDate(value)}
                className={cn(
                  "rounded-lg border p-1.5 text-center text-xs transition-colors",
                  date === value
                    ? "border-primary-700 bg-primary-50 ring-1 ring-primary-700"
                    : "border-gray-200 hover:border-primary-300"
                )}
              >
                <span className="block capitalize text-gray-500">
                  {format(day, "EEE", { locale: fr })}
                </span>
                <span className="block font-semibold text-primary-900">
                  {format(day, "d/M")}
                </span>
              </button>
            );
          })}
        </div>

        {date &&
          (loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary-600" aria-hidden />
            </div>
          ) : slots.length === 0 ? (
            <p className="py-2 text-center text-sm text-gray-500">
              Aucun créneau disponible ce jour-là.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={cn(
                    "rounded-lg border p-2 text-sm font-medium transition-colors",
                    slot === s
                      ? "border-primary-700 bg-primary-700 text-white"
                      : "border-gray-200 text-primary-900 hover:border-primary-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          ))}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={!date || !slot || submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
