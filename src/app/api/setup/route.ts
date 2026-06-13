import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed-data";

/**
 * One-click installation endpoint.
 *
 * - On a fresh database (no ADMIN user yet): open, seeds everything.
 * - Once an admin exists: requires ?key=<SETUP_SECRET or CRON_SECRET>
 *   so it can be re-run safely (it is idempotent) without being public.
 */
export async function GET(req: Request) {
  try {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

    if (adminCount > 0) {
      const key = new URL(req.url).searchParams.get("key");
      const secret = process.env.SETUP_SECRET ?? process.env.CRON_SECRET;
      if (!secret || key !== secret) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "L'installation a déjà été effectuée. Pour relancer le seed, appelez /api/setup?key=<SETUP_SECRET>.",
          },
          { status: 403 }
        );
      }
    }

    await runSeed(prisma);

    return NextResponse.json({
      ok: true,
      message:
        "Installation terminée : compte admin, soins, horaires, FAQ et témoignages créés.",
      admin: process.env.ADMIN_EMAIL ?? "admin@cabinet-physio.com",
      next: "Connectez-vous sur /admin puis changez le mot de passe dans Paramètres.",
    });
  } catch (error) {
    console.error("[setup]", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Échec de l'installation. Vérifiez que DATABASE_URL est configurée et que les migrations ont été appliquées (redéployez après avoir attaché la base).",
      },
      { status: 500 }
    );
  }
}
