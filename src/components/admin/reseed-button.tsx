"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DownloadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReseedButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reseed", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de l'import.");
        return;
      }
      toast.success("Informations du cabinet importées.");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du cabinet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">
          Importe (ou réinitialise) les soins, les horaires d&apos;ouverture, les
          coordonnées et le nom du praticien aux valeurs officielles du cabinet.
          La photo du praticien et vos avis/FAQ personnalisés sont conservés.
        </p>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <DownloadCloud className="h-4 w-4" aria-hidden />
          Importer les informations du cabinet
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer les informations du cabinet ?</DialogTitle>
            <DialogDescription>
              Cette action remplace les soins, les horaires et les coordonnées par
              les valeurs de référence. Vos modifications manuelles sur ces éléments
              seront écrasées. La photo du praticien est conservée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={run} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Confirmer l&apos;import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
