import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string | null | undefined) {
  if (!value) return "";
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await requireRole(["ADMIN", "RECEPTIONIST"]);
  if (!session) {
    return new Response("Accès refusé", { status: 403 });
  }

  const patients = await prisma.patient.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = "Nom,Email,Téléphone,Inscrit le,Nombre de RDV";
  const rows = patients.map((p) =>
    [
      csvEscape(p.user.name),
      csvEscape(p.user.email),
      csvEscape(p.user.phone),
      p.user.createdAt.toISOString().slice(0, 10),
      String(p._count.appointments),
    ].join(",")
  );

  // UTF-8 BOM so Excel opens accented characters correctly
  const csv = "﻿" + [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="patients-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
