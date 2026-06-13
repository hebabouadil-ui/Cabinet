"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Clock, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn, formatPrice } from "@/lib/utils";

type ServiceOption = {
  id: string;
  name: string;
  duration: number;
  price: number;
  excerpt: string;
};

const STEPS = [
  { label: "Soin", icon: Stethoscope },
  { label: "Date", icon: CalendarDays },
  { label: "Horaire", icon: Clock },
  { label: "Confirmation", icon: CheckCircle2 },
];

export function BookingForm({
  services,
  maxAdvanceDays,
}: {
  services: ServiceOption[];
  maxAdvanceDays: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("service");

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(
    preselected && services.some((s) => s.id === preselected) ? preselected : ""
  );
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  const days = useMemo(() => {
    return Array.from({ length: Math.min(maxAdvanceDays, 30) }, (_, i) =>
      addDays(new Date(), i + 1)
    );
  }, [maxAdvanceDays]);

  const loadSlots = useCallback(async () => {
    if (!date || !serviceId) return;
    setSlotsLoading(true);
    setStartTime("");
    try {
      const res = await fetch(
        `/api/availability?date=${date}&serviceId=${serviceId}`
      );
      const json = await res.json();
      setSlots(json.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [date, serviceId]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, date, startTime, patientNote: note || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Une erreur est survenue.");
        if (res.status === 409) loadSlots();
        return;
      }
      setDone(true);
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-primary-100 bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-600" aria-hidden />
        <h2 className="mb-2 font-display text-2xl font-semibold text-primary-900">
          Demande envoyée !
        </h2>
        <p className="mx-auto max-w-md text-sm text-gray-600">
          Votre demande de rendez-vous a bien été enregistrée. Vous recevrez une
          confirmation dès sa validation par le cabinet.
        </p>
        <Button className="mt-6" onClick={() => router.push("/account")}>
          Voir mes rendez-vous
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm md:p-8">
      {/* Stepper */}
      <ol className="mb-8 flex items-center justify-between" aria-label="Étapes de réservation">
        {STEPS.map((s, i) => (
          <li key={s.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                i <= step
                  ? "border-primary-700 bg-primary-700 text-white"
                  : "border-gray-200 text-gray-400"
              )}
            >
              <s.icon className="h-4 w-4" aria-hidden />
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                i <= step ? "text-primary-800" : "text-gray-400"
              )}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ol>

      {/* Step 1: Service */}
      {step === 0 && (
        <div className="space-y-3">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setServiceId(service.id)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-colors",
                serviceId === service.id
                  ? "border-primary-700 bg-primary-50 ring-1 ring-primary-700"
                  : "border-gray-200 hover:border-primary-300"
              )}
              aria-pressed={serviceId === service.id}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-primary-900">{service.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{service.excerpt}</p>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p className="font-semibold text-primary-800">
                    {service.price > 0 ? formatPrice(service.price) : "Sur devis"}
                  </p>
                  <p className="text-xs text-gray-500">{service.duration} min</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Date */}
      {step === 1 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {days.map((day) => {
            const value = format(day, "yyyy-MM-dd");
            return (
              <button
                key={value}
                onClick={() => setDate(value)}
                className={cn(
                  "rounded-xl border p-3 text-center transition-colors",
                  date === value
                    ? "border-primary-700 bg-primary-50 ring-1 ring-primary-700"
                    : "border-gray-200 hover:border-primary-300"
                )}
                aria-pressed={date === value}
              >
                <p className="text-xs capitalize text-gray-500">
                  {format(day, "EEE", { locale: fr })}
                </p>
                <p className="font-display text-lg font-semibold text-primary-900">
                  {format(day, "d")}
                </p>
                <p className="text-xs capitalize text-gray-500">
                  {format(day, "MMM", { locale: fr })}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 3: Time slot */}
      {step === 2 && (
        <div>
          {slotsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" aria-hidden />
            </div>
          ) : slots.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Aucun créneau disponible ce jour-là. Veuillez choisir une autre date.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setStartTime(slot)}
                  className={cn(
                    "rounded-xl border p-3 text-sm font-medium transition-colors",
                    startTime === slot
                      ? "border-primary-700 bg-primary-700 text-white"
                      : "border-gray-200 text-primary-900 hover:border-primary-300"
                  )}
                  aria-pressed={startTime === slot}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 3 && selectedService && (
        <div className="space-y-6">
          <dl className="space-y-3 rounded-xl bg-primary-50 p-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Soin</dt>
              <dd className="font-semibold text-primary-900">{selectedService.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Date</dt>
              <dd className="font-semibold capitalize text-primary-900">
                {date &&
                  format(new Date(`${date}T00:00:00`), "EEEE d MMMM yyyy", { locale: fr })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Heure</dt>
              <dd className="font-semibold text-primary-900">{startTime}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Durée</dt>
              <dd className="font-semibold text-primary-900">
                {selectedService.duration} min
              </dd>
            </div>
            <div className="flex justify-between border-t border-primary-100 pt-3">
              <dt className="text-gray-600">Tarif</dt>
              <dd className="font-semibold text-primary-900">
                {selectedService.price > 0 ? formatPrice(selectedService.price) : "Sur devis"}
              </dd>
            </div>
          </dl>
          <div className="space-y-2">
            <Label htmlFor="note">Message pour le praticien (optionnel)</Label>
            <Textarea
              id="note"
              rows={3}
              maxLength={1000}
              placeholder="Motif de consultation, antécédents, douleurs..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
        >
          Retour
        </Button>
        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={
              (step === 0 && !serviceId) ||
              (step === 1 && !date) ||
              (step === 2 && !startTime)
            }
          >
            Continuer
          </Button>
        ) : (
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Confirmer la demande
          </Button>
        )}
      </div>
    </div>
  );
}
