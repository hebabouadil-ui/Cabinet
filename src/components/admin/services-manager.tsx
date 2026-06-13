"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { formatPrice } from "@/lib/utils";

type ServiceItem = {
  id: string;
  slug: string;
  name: string;
  excerpt: string;
  description: string;
  duration: number;
  price: number;
  image: string | null;
  featured: boolean;
  active: boolean;
  order: number;
};

const emptyService: Omit<ServiceItem, "id"> = {
  slug: "",
  name: "",
  excerpt: "",
  description: "",
  duration: 45,
  price: 0,
  image: null,
  featured: false,
  active: true,
  order: 0,
};

export function ServicesManager({ services }: { services: ServiceItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<ServiceItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const res = await fetch(
        isNew ? "/api/admin/services" : `/api/admin/services/${editing.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editing, image: editing.image ?? "" }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      toast.success(isNew ? "Soin créé." : "Soin mis à jour.");
      setEditing(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Suppression impossible.");
        return;
      }
      toast.success("Soin supprimé.");
      router.refresh();
    } finally {
      setDeleting(null);
    }
  };

  const set = (patch: Partial<ServiceItem>) =>
    setEditing((prev) => ({ ...prev, ...patch }));

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setEditing({ ...emptyService })}>
          <Plus className="h-4 w-4" aria-hidden /> Nouveau soin
        </Button>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Tarif</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <p className="font-medium text-primary-900">{s.name}</p>
                  <p className="text-xs text-gray-500">/{s.slug}</p>
                </TableCell>
                <TableCell>{s.duration} min</TableCell>
                <TableCell>{s.price > 0 ? formatPrice(s.price) : "Sur devis"}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Badge variant={s.active ? "default" : "secondary"}>
                      {s.active ? "Actif" : "Inactif"}
                    </Badge>
                    {s.featured && <Badge variant="outline">Mis en avant</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(s)}
                      aria-label={`Modifier ${s.name}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(s.id)}
                      disabled={deleting === s.id}
                      aria-label={`Supprimer ${s.name}`}
                    >
                      {deleting === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier le soin" : "Nouveau soin"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="svc-name">Nom *</Label>
                  <Input
                    id="svc-name"
                    value={editing.name ?? ""}
                    onChange={(e) => set({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="svc-slug">Slug *</Label>
                  <Input
                    id="svc-slug"
                    placeholder="ex: dry-needling"
                    value={editing.slug ?? ""}
                    onChange={(e) => set({ slug: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-excerpt">Résumé *</Label>
                <Textarea
                  id="svc-excerpt"
                  rows={2}
                  value={editing.excerpt ?? ""}
                  onChange={(e) => set({ excerpt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-description">Description *</Label>
                <Textarea
                  id="svc-description"
                  rows={4}
                  value={editing.description ?? ""}
                  onChange={(e) => set({ description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="svc-duration">Durée (min)</Label>
                  <Input
                    id="svc-duration"
                    type="number"
                    min={15}
                    max={180}
                    value={editing.duration ?? 45}
                    onChange={(e) => set({ duration: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="svc-price">Tarif (€)</Label>
                  <Input
                    id="svc-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editing.price ?? 0}
                    onChange={(e) => set({ price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="svc-order">Ordre</Label>
                  <Input
                    id="svc-order"
                    type="number"
                    value={editing.order ?? 0}
                    onChange={(e) => set({ order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <ImageUploadField
                label="Image du soin"
                folder="services"
                value={editing.image ?? ""}
                onChange={(url) => set({ image: url })}
              />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.active ?? true}
                    onChange={(e) => set({ active: e.target.checked })}
                    className="h-4 w-4 accent-primary-700"
                  />
                  Actif (visible sur le site)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.featured ?? false}
                    onChange={(e) => set({ featured: e.target.checked })}
                    className="h-4 w-4 accent-primary-700"
                  />
                  Mis en avant
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
