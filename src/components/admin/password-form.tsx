"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors du changement de mot de passe.");
        return;
      }
      toast.success("Mot de passe mis à jour.");
      setCurrent("");
      setNext("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Changer mon mot de passe</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pw-current">Mot de passe actuel</Label>
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw-new">Nouveau mot de passe</Label>
          <Input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            placeholder="8 caractères min., 1 majuscule, 1 chiffre"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={save} disabled={!current || !next || saving} size="sm">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <KeyRound className="h-4 w-4" aria-hidden />
            )}
            Mettre à jour le mot de passe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
