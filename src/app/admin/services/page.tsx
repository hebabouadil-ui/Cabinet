import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ServicesManager } from "@/components/admin/services-manager";

export const metadata: Metadata = { title: "Soins — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-primary-900">
        Gestion des soins
      </h1>
      <ServicesManager
        services={services.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          excerpt: s.excerpt,
          description: s.description,
          duration: s.duration,
          price: s.price,
          image: s.image,
          featured: s.featured,
          active: s.active,
          order: s.order,
        }))}
      />
    </div>
  );
}
