import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";
import { PasswordForm } from "@/components/admin/password-form";

export const metadata: Metadata = { title: "Paramètres — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.clinicSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-primary-900">
        Paramètres de la clinique
      </h1>
      <SettingsForm
        settings={{
          clinicName: settings.clinicName,
          tagline: settings.tagline ?? "",
          phone: settings.phone ?? "",
          email: settings.email ?? "",
          whatsapp: settings.whatsapp ?? "",
          address: settings.address ?? "",
          mapEmbedUrl: settings.mapEmbedUrl ?? "",
          slotDuration: settings.slotDuration,
          bufferMinutes: settings.bufferMinutes,
          maxAdvanceDays: settings.maxAdvanceDays,
          facebookUrl: settings.facebookUrl ?? "",
          instagramUrl: settings.instagramUrl ?? "",
          linkedinUrl: settings.linkedinUrl ?? "",
        }}
      />
      <PasswordForm />
    </div>
  );
}
