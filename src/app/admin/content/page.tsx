import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentManager } from "@/components/admin/content-manager";

export const metadata: Metadata = { title: "Contenu — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [blocks, testimonials, faqs] = await Promise.all([
    prisma.contentBlock.findMany({ orderBy: { key: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
    prisma.faq.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-primary-900">
        Gestion du contenu
      </h1>
      <ContentManager
        blocks={blocks}
        testimonials={testimonials.map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role,
          content: t.content,
          rating: t.rating,
          approved: t.approved,
          order: t.order,
        }))}
        faqs={faqs}
      />
    </div>
  );
}
