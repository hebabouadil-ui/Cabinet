import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contentBlockSchema } from "@/lib/validations";

export async function PUT(req: Request) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = contentBlockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { key, ...data } = parsed.data;
    const block = await prisma.contentBlock.upsert({
      where: { key },
      update: data,
      create: { key, ...data },
    });

    return NextResponse.json({ block });
  } catch (error) {
    console.error("[admin content PUT]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
