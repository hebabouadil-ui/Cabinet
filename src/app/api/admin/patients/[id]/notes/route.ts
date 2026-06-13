import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminNoteSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = adminNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable" }, { status: 404 });
    }

    const note = await prisma.adminNote.create({
      data: {
        patientId: id,
        authorId: session.user.id,
        content: parsed.data.content,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("[admin notes POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
