import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const ALLOWED_FOLDERS = ["general", "services", "content", "gallery"];

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

    const uploaded = await uploadImage(file, folder);
    const media = await prisma.media.create({
      data: { ...uploaded, folder },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("[admin media POST]", error);
    return NextResponse.json(
      { error: "Échec de l'upload. Vérifiez la configuration Cloudinary." },
      { status: 500 }
    );
  }
}
