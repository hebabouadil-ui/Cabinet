import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function WhatsAppButton() {
  const settings = await prisma.clinicSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  const number = settings?.whatsapp?.replace(/[^+\d]/g, "");
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number.replace("+", "")}?text=${encodeURIComponent("Bonjour, je souhaite prendre rendez-vous.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous contacter sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
