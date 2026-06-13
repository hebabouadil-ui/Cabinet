import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const existing = await prisma.service.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Un soin avec ce slug existe déjà." },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data: { ...parsed.data, image: parsed.data.image || null },
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("[admin services POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
