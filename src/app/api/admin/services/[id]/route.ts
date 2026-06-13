import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const conflict = await prisma.service.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Un autre soin utilise déjà ce slug." },
        { status: 409 }
      );
    }

    const service = await prisma.service.update({
      where: { id },
      data: { ...parsed.data, image: parsed.data.image || null },
    });
    return NextResponse.json({ service });
  } catch (error) {
    console.error("[admin services PUT]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const appointmentCount = await prisma.appointment.count({
      where: { serviceId: id },
    });
    if (appointmentCount > 0) {
      // Keep history intact: deactivate instead of deleting
      await prisma.service.update({ where: { id }, data: { active: false } });
      return NextResponse.json({
        ok: true,
        deactivated: true,
        message:
          "Ce soin a des rendez-vous associés : il a été désactivé au lieu d'être supprimé.",
      });
    }

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin services DELETE]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
