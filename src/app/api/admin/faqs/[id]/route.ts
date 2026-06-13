import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const faq = await prisma.faq.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ faq });
  } catch (error) {
    console.error("[admin faqs PUT]", error);
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
    await prisma.faq.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin faqs DELETE]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
