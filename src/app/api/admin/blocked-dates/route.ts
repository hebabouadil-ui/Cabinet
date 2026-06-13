import { NextResponse } from "next/server";
import { parse, startOfDay } from "date-fns";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blockedDateSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = blockedDateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const date = startOfDay(parse(parsed.data.date, "yyyy-MM-dd", new Date()));
    const blocked = await prisma.blockedDate.upsert({
      where: { date },
      update: { reason: parsed.data.reason },
      create: { date, reason: parsed.data.reason },
    });

    return NextResponse.json({ blocked }, { status: 201 });
  } catch (error) {
    console.error("[blocked-dates POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
