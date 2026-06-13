import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MediaLibrary } from "@/components/admin/media-library";

export const metadata: Metadata = { title: "Médiathèque — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-primary-900">
        Médiathèque
      </h1>
      <MediaLibrary
        media={media.map((m) => ({
          id: m.id,
          url: m.url,
          folder: m.folder,
          publicId: m.publicId,
        }))}
      />
    </div>
  );
}
