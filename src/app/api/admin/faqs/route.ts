import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const faq = await prisma.faq.create({ data: parsed.data });
    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error("[admin faqs POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
