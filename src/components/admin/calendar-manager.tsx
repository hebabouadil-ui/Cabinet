"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarOff, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateShort } from "@/lib/utils";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
// Display Monday first
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type Slot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type Blocked = { id: string; date: string; reason: string | null };

export function CalendarManager({
  availability,
  blockedDates,
}: {
  availability: Slot[];
  blockedDates: Blocked[];
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>(availability);
  const [saving, setSaving] = useState(false);
  const [newBlocked, setNewBlocked] = useState({ date: "", reason: "" });
  const [blocking, setBlocking] = useState(false);

  const addSlot = (day: number) => {
    setSlots([...slots, { dayOfWeek: day, startTime: "09:00", endTime: "12:00", isActive: true }]);
  };

  const updateSlot = (index: number, patch: Partial<Slot>) => {
    setSlots(slots.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const saveSlots = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      toast.success("Horaires enregistrés.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const addBlockedDate = async () => {
    if (!newBlocked.date) return;
    setBlocking(true);
    try {
      const res = await fetch("/api/admin/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlocked),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur.");
        return;
      }
      toast.success("Date bloquée.");
      setNewBlocked({ date: "", reason: "" });
      router.refresh();
    } finally {
      setBlocking(false);
    }
  };

  const removeBlockedDate = async (id: string) => {
    const res = await fetch(`/api/admin/blocked-dates/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Date débloquée.");
      router.refresh();
    } else {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Horaires de travail hebdomadaires</CardTitle>
          <Button onClick={saveSlots} disabled={saving} size="sm">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            Enregistrer
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {DAY_ORDER.map((day) => {
            const daySlots = slots
              .map((s, index) => ({ ...s, index }))
              .filter((s) => s.dayOfWeek === day);
            return (
              <div key={day} className="rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-primary-900">{DAYS[day]}</p>
                  <Button variant="ghost" size="sm" onClick={() => addSlot(day)}>
                    <Plus className="h-4 w-4" aria-hidden /> Plage
                  </Button>
                </div>
                {daySlots.length === 0 ? (
                  <p className="text-sm text-gray-400">Fermé</p>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div key={slot.index} className="flex flex-wrap items-center gap-2">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(slot.index, { startTime: e.target.value })}
                          className="w-32"
                          aria-label="Heure de début"
                        />
                        <span className="text-gray-400">→</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(slot.index, { endTime: e.target.value })}
                          className="w-32"
                          aria-label="Heure de fin"
                        />
                        <label className="flex items-center gap-1.5 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={slot.isActive}
                            onChange={(e) => updateSlot(slot.index, { isActive: e.target.checked })}
                            className="h-4 w-4 accent-primary-700"
                          />
                          Actif
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlot(slot.index)}
                          aria-label="Supprimer cette plage"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dates bloquées & congés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-xl border p-4">
            <div className="space-y-2">
              <Label htmlFor="blocked-date">Date</Label>
              <Input
                id="blocked-date"
                type="date"
                value={newBlocked.date}
                onChange={(e) => setNewBlocked({ ...newBlocked, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blocked-reason">Motif (optionnel)</Label>
              <Input
                id="blocked-reason"
                placeholder="Congés, formation, jour férié..."
                value={newBlocked.reason}
                onChange={(e) => setNewBlocked({ ...newBlocked, reason: e.target.value })}
              />
            </div>
            <Button
              onClick={addBlockedDate}
              disabled={!newBlocked.date || blocking}
              className="w-full"
              size="sm"
            >
              {blocking ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <CalendarOff className="h-4 w-4" aria-hidden />
              )}
              Bloquer cette date
            </Button>
          </div>

          {blockedDates.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune date bloquée à venir.</p>
          ) : (
            <ul className="space-y-2">
              {blockedDates.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-primary-900">{formatDateShort(b.date)}</p>
                    {b.reason && <p className="text-xs text-gray-500">{b.reason}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlockedDate(b.id)}
                    aria-label="Débloquer cette date"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
