import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: { ...parsed.data, image: parsed.data.image || null },
    });
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error("[admin testimonials POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
