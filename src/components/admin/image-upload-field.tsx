"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Downscales an image in the browser (max 1200px, JPEG) so it can be stored
 * even without Cloudinary. Falls back to the original file on any failure.
 */
async function resizeImage(file: File, maxSize = 1200): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

export function ImageUploadField({
  label,
  folder,
  value,
  onChange,
}: {
  label: string;
  folder: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const resized = await resizeImage(file);
      const formData = new FormData();
      formData.append("file", resized, "photo.jpg");
      formData.append("folder", folder);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Échec de l'upload.");
        return;
      }
      onChange(json.media.url);
      toast.success("Image téléversée.");
    } catch {
      toast.error("Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="relative h-36 w-full overflow-hidden rounded-xl border">
          <Image src={value} alt="" fill className="object-cover" sizes="400px" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow hover:bg-white"
            aria-label="Retirer l'image"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="h-4 w-4" aria-hidden />
              )}
              Téléverser
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUrl((v) => !v)}
              className="flex-1"
            >
              <Link2 className="h-4 w-4" aria-hidden />
              Coller un lien
            </Button>
          </div>
          {showUrl && (
            <div className="flex gap-2">
              <Input
                placeholder="https://exemple.com/photo.jpg"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => {
                  if (!/^https?:\/\//.test(urlValue.trim())) {
                    toast.error("Entrez une URL d'image valide (https://...).");
                    return;
                  }
                  onChange(urlValue.trim());
                  setUrlValue("");
                  setShowUrl(false);
                }}
              >
                OK
              </Button>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
