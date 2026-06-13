"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Settings = {
  clinicName: string;
  tagline: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  mapEmbedUrl: string;
  slotDuration: number;
  bufferMinutes: number;
  maxAdvanceDays: number;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<Settings>) => setForm({ ...form, ...patch });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      toast.success("Paramètres enregistrés.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const field = (
    id: keyof Settings,
    label: string,
    type: "text" | "number" | "email" | "tel" = "text",
    placeholder = ""
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) =>
          set({ [id]: type === "number" ? Number(e.target.value) : e.target.value })
        }
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {field("clinicName", "Nom de la clinique")}
          {field("tagline", "Slogan")}
          {field("phone", "Téléphone", "tel", "+212 6 ...")}
          {field("email", "Email", "email")}
          {field("whatsapp", "WhatsApp (format international)", "tel", "+212600000000")}
          {field("address", "Adresse")}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="mapEmbedUrl">URL d&apos;intégration Google Maps</Label>
            <Input
              id="mapEmbedUrl"
              placeholder="https://www.google.com/maps/embed?..."
              value={form.mapEmbedUrl}
              onChange={(e) => set({ mapEmbedUrl: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réservation en ligne</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {field("slotDuration", "Durée par défaut (min)", "number")}
          {field("bufferMinutes", "Pause entre RDV (min)", "number")}
          {field("maxAdvanceDays", "Réservation max (jours)", "number")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {field("facebookUrl", "Facebook")}
          {field("instagramUrl", "Instagram")}
          {field("linkedinUrl", "LinkedIn")}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} size="lg">
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Save className="h-4 w-4" aria-hidden />
        )}
        Enregistrer les paramètres
      </Button>
    </div>
  );
}
