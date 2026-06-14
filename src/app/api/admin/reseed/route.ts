import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed-data";

/**
 * Re-applies the cabinet's reference content (services, opening hours,
 * contact details, practitioner name). Admin-only. Preserves the
 * practitioner photo and any custom testimonials/FAQs.
 */
export async function POST() {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    await runSeed(prisma);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin reseed]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
