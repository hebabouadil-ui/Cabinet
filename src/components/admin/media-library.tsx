"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, FolderOpen, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type MediaItem = {
  id: string;
  url: string;
  folder: string;
  publicId: string;
};

const FOLDERS = ["general", "services", "content", "gallery"];

export function MediaLibrary({ media }: { media: MediaItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState("general");
  const [filter, setFilter] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? media : media.filter((m) => m.folder === filter)),
    [media, filter]
  );

  const upload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        if (!res.ok) {
          const json = await res.json();
          toast.error(json.error ?? `Échec de l'upload de ${file.name}.`);
        }
      }
      toast.success("Upload terminé.");
      router.refresh();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Suppression impossible.");
        return;
      }
      toast.success("Image supprimée.");
      router.refresh();
    } finally {
      setDeleting(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiée.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-gray-500" aria-hidden />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44" aria-label="Filtrer par dossier">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les dossiers</SelectItem>
              {FOLDERS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Select value={folder} onValueChange={setFolder}>
            <SelectTrigger className="w-40" aria-label="Dossier de destination">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOLDERS.map((f) => (
                <SelectItem key={f} value={f}>
                  → {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            Téléverser
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) upload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-16 text-center text-gray-500">
          Aucune image dans ce dossier.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border bg-white",
                deleting === m.id && "opacity-50"
              )}
            >
              <Image src={m.url} alt="" fill sizes="200px" className="object-cover" />
              <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded bg-white/20 px-1.5 py-0.5 text-xs text-white">
                  {m.folder}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => copyUrl(m.url)}
                    className="rounded-full bg-white/90 p-1.5 hover:bg-white"
                    aria-label="Copier l'URL"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    onClick={() => remove(m.id)}
                    disabled={deleting === m.id}
                    className="rounded-full bg-white/90 p-1.5 hover:bg-white"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
