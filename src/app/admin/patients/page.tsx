import type { Metadata } from "next";
import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PatientSearch } from "@/components/admin/patient-search";
import { formatDateShort } from "@/lib/utils";

export const metadata: Metadata = { title: "Patients — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const patients = await prisma.patient.findMany({
    where: q
      ? {
          user: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          },
        }
      : undefined,
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-primary-900">Patients</h1>
        <a href="/api/admin/patients/export" download>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" aria-hidden /> Exporter (CSV)
          </Button>
        </a>
      </div>

      <PatientSearch initialQuery={q ?? ""} />

      <div className="rounded-2xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead>RDV</TableHead>
              <TableHead className="text-right">Fiche</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                  Aucun patient trouvé.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-primary-900">
                    {p.user.name}
                  </TableCell>
                  <TableCell>{p.user.email}</TableCell>
                  <TableCell>{p.user.phone ?? "—"}</TableCell>
                  <TableCell>{formatDateShort(p.user.createdAt)}</TableCell>
                  <TableCell>{p._count.appointments}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/patients/${p.id}`}>
                      <Button variant="ghost" size="icon" aria-label="Voir la fiche">
                        <Eye className="h-4 w-4" aria-hidden />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
