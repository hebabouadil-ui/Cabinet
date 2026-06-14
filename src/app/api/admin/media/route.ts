import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const ALLOWED_FOLDERS = ["general", "services", "content", "gallery"];

const cloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

export async function POST(req: Request) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "general");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format d'image non supporté" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (8 Mo max)" }, { status: 400 });
    }
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: "Dossier invalide" }, { status: 400 });
    }

    if (cloudinaryConfigured) {
      const uploaded = await uploadImage(file, folder);
      const media = await prisma.media.create({ data: { ...uploaded, folder } });
      return NextResponse.json({ media }, { status: 201 });
    }

    // No Cloudinary: store the image directly in the database as a data URL.
    // The admin UI resizes images client-side first, so they stay small.
    if (file.size > 1.5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "Image trop lourde pour le stockage interne (1,5 Mo max). Réessayez ou configurez Cloudinary.",
        },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    const media = await prisma.media.create({
      data: {
        publicId: `local_${randomUUID()}`,
        url: dataUrl,
        folder,
        format: file.type.split("/")[1] ?? null,
        bytes: file.size,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("[admin media POST]", error);
    return NextResponse.json(
      { error: "Échec de l'envoi de l'image. Réessayez." },
      { status: 500 }
    );
  }
}
