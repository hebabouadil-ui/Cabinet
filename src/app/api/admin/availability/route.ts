import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { availabilitySchema } from "@/lib/validations";

export async function PUT(req: Request) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = availabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    for (const slot of parsed.data.slots) {
      if (slot.startTime >= slot.endTime) {
        return NextResponse.json(
          { error: "L'heure de fin doit être après l'heure de début." },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction([
      prisma.availability.deleteMany(),
      prisma.availability.createMany({ data: parsed.data.slots }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin availability PUT]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
