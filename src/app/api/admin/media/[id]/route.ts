import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
    }

    await deleteImage(media.publicId).catch((e) =>
      console.error("[cloudinary destroy]", e)
    );
    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin media DELETE]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
