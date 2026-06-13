import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { prisma } from "@/lib/prisma";
import { CLINIC_NAME } from "@/lib/constants";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.clinicSettings
    .findUnique({ where: { id: "singleton" }, select: { clinicName: true } })
    .catch(() => null);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar clinicName={settings?.clinicName ?? CLINIC_NAME} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
