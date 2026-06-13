"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Check,
  CheckCheck,
  Loader2,
  MessageSquareText,
  RefreshCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AppointmentActions({
  id,
  status,
  serviceId,
  patientNote,
}: {
  id: string;
  status: string;
  serviceId: string;
  patientNote: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Une erreur est survenue.");
        return;
      }
      toast.success("Statut mis à jour. Le patient a été notifié.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {patientNote && (
        <Button
          variant="ghost"
          size="icon"
          title="Voir la note du patient"
          onClick={() => setNoteOpen(true)}
        >
          <MessageSquareText className="h-4 w-4" aria-hidden />
        </Button>
      )}

      {status === "PENDING" && (
        <>
          <Button
            size="sm"
            disabled={busy}
            onClick={() => updateStatus("CONFIRMED")}
            title="Approuver"
          >
            <Check className="h-4 w-4" aria-hidden /> Approuver
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={() => updateStatus("REJECTED")}
            title="Refuser"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </>
      )}

      {status === "CONFIRMED" && (
        <>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => updateStatus("COMPLETED")}
            title="Marquer comme terminé"
          >
            <CheckCheck className="h-4 w-4" aria-hidden /> Terminé
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => setRescheduleOpen(true)}
            title="Reporter"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={() => updateStatus("CANCELLED")}
            title="Annuler"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </>
      )}

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note du patient</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{patientNote}</p>
        </DialogContent>
      </Dialog>

      <AdminRescheduleDialog
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        appointmentId={id}
        serviceId={serviceId}
        onDone={() => {
          setRescheduleOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function AdminRescheduleDialog({
  open,
  onClose,
  appointmentId,
  serviceId,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  serviceId: string;
  onDone: () => void;
}) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    setSlot("");
    try {
      const res = await fetch(`/api/availability?date=${date}&serviceId=${serviceId}`);
      const json = await res.json();
      setSlots(json.slots ?? []);
    } finally {
      setLoading(false);
    }
  }, [date, serviceId]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime: slot }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Impossible de reporter.");
        return;
      }
      toast.success("Rendez-vous reporté. Le patient a été notifié.");
      onDone();
    } finally {
      setSubmitting(false);
    }
  };

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reporter le rendez-vous</DialogTitle>
          <DialogDescription>
            Choisissez une nouvelle date et un horaire. Le patient sera notifié.
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
